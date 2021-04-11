import { EntityRepository, Repository } from 'typeorm';
import { CreateUserDTO } from '../dto/create-users.dto';
import { User } from '../entity/users.entity';
import { UserRole } from '../users-roles.enum';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CredentialsDTO } from 'src/auth/dto/credentials.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(
    createUserDTO: CreateUserDTO,
    role: UserRole,
  ): Promise<User> {
    const { email, password, name } = createUserDTO;

    const user = this.create();

    user.email = email;
    user.name = name;
    user.role = role;
    user.status = true;
    user.confirmationToken = crypto.randomBytes(32).toString('hex');
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);

    try {
      await user.save();
      delete user.password;
      delete user.salt;

      return user;
    } catch (error) {
      if (error.code.toString() === '23505') {
        throw new ConflictException('Endereço de email já está em uso');
      } else {
        throw new InternalServerErrorException(
          'Erro ao salvar o usuário no banco de dados',
        );
      }
    }
  }

  async checkCredentials(credentialsDTO: CredentialsDTO): Promise<User> {
    const { email, password } = credentialsDTO;
    const user = await this.findOne({ email, status: true });

    if (user && (await user.checkPassword(password))) {
      return user;
    }

    return null;
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}

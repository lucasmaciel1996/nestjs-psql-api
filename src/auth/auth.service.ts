import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDTO } from 'src/users/dto/create-users.dto';
import { User } from 'src/users/entity/users.entity';
import { UserRepository } from 'src/users/repositories/users.repository';
import { UserRole } from 'src/users/users-roles.enum';
import { CredentialsDTO } from './dto/credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private usersRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreateUserDTO): Promise<User> {
    if (createUserDto.password != createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException('As senhas não conferem');
    } else {
      return await this.usersRepository.createUser(
        createUserDto,
        UserRole.USER,
      );
    }
  }

  async signIn(credentialsDTO: CredentialsDTO) {
    const user = await this.usersRepository.checkCredentials(credentialsDTO);

    if (user === null) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const jwtPayload = {
      id: user.id,
    };

    const token = await this.jwtService.sign(jwtPayload);

    return { token };
  }
}

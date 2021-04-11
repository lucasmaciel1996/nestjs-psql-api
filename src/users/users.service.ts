import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDTO } from './dto/create-users.dto';
import { UpdateUserDTO } from './dto/update-users.dto';
import { UserRole } from './users-roles.enum';
import { User } from './entity/users.entity';
import { UserRepository } from './repositories/users.repository';
import { FindUsersQueryDTO } from './dto/find-users-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private usersRepository: UserRepository,
  ) {}

  async createAdminUser(createUserDto: CreateUserDTO): Promise<User> {
    if (createUserDto.password != createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException('As senhas não conferem');
    } else {
      return this.usersRepository.createUser(createUserDto, UserRole.ADMIN);
    }
  }

  async findUserById(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne(userId, {
      select: ['email', 'name', 'role', 'id'],
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    return user;
  }

  async updateUser(updateUserDTO: UpdateUserDTO, id: string): Promise<User> {
    const user = await this.findUserById(id);
    const { name, email, role, status } = updateUserDTO;

    user.name = name ? name : user.name;
    user.email = email ? email : user.email;
    user.role = role ? role : user.role;
    user.status = status === undefined ? user.status : status;

    try {
      await user.save();
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao salvar os dados no banco de dados',
      );
    }
  }
  async deleteUser(userId: string) {
    const result = await this.usersRepository.delete({ id: userId });
    if (result.affected === 0) {
      throw new NotFoundException(
        'Não foi encontrado um usuário com o ID informado',
      );
    }
  }

  async findUsers(
    queryDto: FindUsersQueryDTO,
  ): Promise<{ users: User[]; total: number }> {
    const users = await this.usersRepository.findUsers(queryDto);
    return users;
  }
}

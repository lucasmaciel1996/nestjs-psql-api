import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-users.dto';
import { UsersService } from './users.service';
import { ReturnUserDTO } from './dto/return-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/auth/role.decorator';
import { UserRole } from './users-roles.enum';
import { RolesGuard } from 'src/auth/roles.guard';
import { UpdateUserDTO } from './dto/update-users.dto';
import { User } from './entity/users.entity';
import { GetUser } from 'src/auth/user.decorator';
import { FindUsersQueryDTO } from './dto/find-users-query.dto';

@Controller('users')
@UseGuards(AuthGuard(), RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Role(UserRole.ADMIN)
  async createAdminUser(
    @Body(ValidationPipe) createUserDTO: CreateUserDTO,
  ): Promise<ReturnUserDTO> {
    const user = await this.usersService.createAdminUser(createUserDTO);

    return {
      user,
      message: 'Administrador cadastrado com sucesso',
    };
  }

  @Get(':id')
  @Role(UserRole.ADMIN)
  async findUserById(@Param('id') id): Promise<ReturnUserDTO> {
    const user = await this.usersService.findUserById(id);

    return {
      user,
      message: 'Usuário encontrado',
    };
  }

  @Patch(':id')
  async updateUser(
    @Body(ValidationPipe) updateUserDTO: UpdateUserDTO,
    @GetUser() user: User,
    @Param('id') id: string,
  ) {
    if (user.role != UserRole.ADMIN && user.id.toString() != id) {
      throw new ForbiddenException(
        'Você não tem autorização para acessar esse recurso',
      );
    }

    return this.usersService.updateUser(updateUserDTO, id);
  }

  @Delete(':id')
  @Role(UserRole.ADMIN)
  async deleteUser(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
    return {
      message: 'Usuário removido com sucesso',
    };
  }

  @Get()
  @Role(UserRole.ADMIN)
  async findUsers(@Query() query: FindUsersQueryDTO) {
    const found = await this.usersService.findUsers(query);
    return {
      found,
      message: 'Usuários encontrados',
    };
  }
}

import {
  Body,
  Controller,
  Post,
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

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  async createAdminUser(
    @Body(ValidationPipe) createUserDTO: CreateUserDTO,
  ): Promise<ReturnUserDTO> {
    const user = await this.usersService.createAdminUser(createUserDTO);

    return {
      user,
      message: 'Administrador cadastrado com sucesso',
    };
  }
}

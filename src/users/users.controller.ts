import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-users.dto';
import { UsersService } from './users.service';
import { ReturnUserDTO } from './dto/return-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
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

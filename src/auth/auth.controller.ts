import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDTO } from 'src/users/dto/create-users.dto';
import { User } from 'src/users/entity/users.entity';
import { AuthService } from './auth.service';
import { CredentialsDTO } from './dto/credentials.dto';
import { GetUser } from './user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signUp(
    @Body(ValidationPipe) createUserDto: CreateUserDTO,
  ): Promise<{ message: string }> {
    await this.authService.signUp(createUserDto);
    return {
      message: 'Cadastro realizado com sucesso',
    };
  }

  @Post('/signin')
  async signIn(
    @Body(ValidationPipe) credentiaslsDTO: CredentialsDTO,
  ): Promise<{ token: string }> {
    return await this.authService.signIn(credentiaslsDTO);
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  geMe(@GetUser() user: User): User {
    return user;
  }
}

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { CreateUserDTO } from 'src/users/dto/create-users.dto';
import { User } from 'src/users/entity/users.entity';
import { UserRepository } from 'src/users/repositories/users.repository';
import { UserRole } from 'src/users/users-roles.enum';
import { MailService } from '../mail/mail.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CredentialsDTO } from './dto/credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private usersRepository: UserRepository,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signUp(createUserDto: CreateUserDTO): Promise<User> {
    if (createUserDto.password != createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException('As senhas não conferem');
    } else {
      const user = await this.usersRepository.createUser(
        createUserDto,
        UserRole.USER,
      );

      await this.mailService.sendEmailConfirmation(
        user,
        user.confirmationToken,
      );

      return user;
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
  async confirmEmail(confirmationToken: string): Promise<void> {
    const result = await this.usersRepository.update(
      { confirmationToken },
      { confirmationToken: null },
    );
    if (result.affected === 0) throw new NotFoundException('Token inválido');
  }

  async sendRecoverPasswordEmail(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ email });

    if (!user)
      throw new NotFoundException('Não há usuário cadastrado com esse email.');

    user.recoverToken = randomBytes(32).toString('hex');
    await user.save();

    const mail = {
      to: user.email,
      from: 'noreply@application.com',
      subject: 'Recuperação de senha',
      template: 'recover-password',
      context: {
        token: user.recoverToken,
      },
    };
    await this.mailService.sendMail(mail);
  }
  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { password, passwordConfirmation } = changePasswordDto;

    if (password != passwordConfirmation)
      throw new UnprocessableEntityException('As senhas não conferem');

    await this.usersRepository.changePassword(id, password);
  }

  async resetPassword(
    recoverToken: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.usersRepository.findOne(
      { recoverToken },
      {
        select: ['id'],
      },
    );
    if (!user) throw new NotFoundException('Token inválido.');

    try {
      await this.changePassword(user.id.toString(), changePasswordDto);
    } catch (error) {
      throw error;
    }
  }
}

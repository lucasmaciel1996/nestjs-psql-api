import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { User } from '../users/entity/users.entity';

interface SendMailDTO {
  to: string;
  from: string;
  subject: string;
  template: string;
  context: any;
}

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmailConfirmation(user: User, token: string) {
    await this.mailerService.sendMail({
      to: user.email,
      from: 'noreply@application.com',
      subject: 'Email de confirmação',
      template: path.resolve(__dirname, 'templates', 'email-confirmation'),
      context: {
        token,
      },
    });
  }
  async sendMail(mail: SendMailDTO) {
    await this.mailerService.sendMail({
      ...mail,
      template: path.resolve(__dirname, 'templates', mail.template),
    });
  }
}

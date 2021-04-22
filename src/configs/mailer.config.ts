import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

export const mailerConfig: MailerOptions = {
  transport: {
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'c65e9d69eae262',
      pass: '32aca9c29c0c0f',
    },
  },
  defaults: {
    from: '"No Reply" <lucas333maciel@gmail.com>',
  },
  template: {
    dir: path.resolve(__dirname, '..', 'mail', 'templates'),
    adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
    options: {
      strict: true,
    },
  },
};

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './configs/typeorm.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './configs/winston.config';
@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    AuthModule,
    WinstonModule.forRoot(winstonConfig),
  ],
  controllers: [],
  providers: [
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggerInterceptor,
    },
  ],
})
export class AppModule {}

import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(@Inject('winston') private logger: Logger) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    this.log(context.switchToHttp().getRequest());
    return next.handle();
  }

  private log(req) {
    const body = { ...req.body };

    delete body.password;
    delete body.passwordConfirmation;

    const user = (req as any).user;

    const userEmail = user ? user.email : null;

    this.logger.log({
      level: 'info',
      timestamp: new Date().toISOString(),
      method: req.method,
      route: req.route.path,
      data: {
        body: body,
        query: req.query,
        params: req.params,
      },
      from: req.ip,
      madeBy: userEmail,
    });
  }
}

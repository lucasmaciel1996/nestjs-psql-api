import { BaseQueryParametersDTO } from '../../shared/dto/base-query-parametrs.dto';

export class FindUsersQueryDTO extends BaseQueryParametersDTO {
  name: string;
  email: string;
  status: boolean;
  role: string;
}

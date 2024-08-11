import { ApiProperty } from '@nestjs/swagger';

export class UserByOauth {
  @ApiProperty()
  oauth_id: string;

  @ApiProperty()
  email: string;
}

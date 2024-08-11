import { ApiProperty } from '@nestjs/swagger';
import { user_type } from '@prisma/client';

export class UserByJWT {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: user_type })
  userMode: user_type;

  @ApiProperty()
  email: string;

  constructor(data?) {
    this.id = data.id;
    this.userMode = data.userMode;
    this.email = data.email;
  }
}

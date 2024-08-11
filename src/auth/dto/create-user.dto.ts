import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { user_gender, user_type } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  nickName: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: user_gender })
  @IsEnum(user_gender)
  @IsOptional()
  gender: user_gender;

  @ApiProperty({ enum: user_type })
  @IsEnum(user_type)
  @IsOptional()
  userMode: user_type;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  childBirth: Date | null;

  @ApiPropertyOptional({ description: '출산예정일' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dueDate: Date | null;
}

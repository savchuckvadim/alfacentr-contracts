import { IsNumber } from "class-validator";

import { IsObject } from "class-validator";

import { Type } from "class-transformer";

import { ApiProperty } from "@nestjs/swagger";
import { ValidateNested } from "class-validator";
import { IsString } from "class-validator";

export class AuthDto {
    @ApiProperty({ example: 'example.bitrix24.ru' })
    @IsString()
    domain: string;
  }
  
  export class OnDealInitRequestBodyDto {
    @ApiProperty({ type: AuthDto })
    @ValidateNested()
    @Type(() => AuthDto)
    @IsObject()
    auth: AuthDto;
  }
  
  // Комбинированный тип для internal использования
  export class OnDealInitRequestDto extends OnDealInitRequestBodyDto {
    @ApiProperty({ example: 123456 })
    @IsNumber()
    dealId: number;
  }

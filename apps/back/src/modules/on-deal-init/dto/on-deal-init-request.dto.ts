import { IsNumber } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { BitrixHookDto } from '@/lib/dto';

// export class AuthDto {
//     @ApiProperty({ example: 'example.bitrix24.ru' })
//     @IsString()
//     domain: string;
//   }

//   export class OnDealInitRequestBodyDto {
//     @ApiProperty({ type: AuthDto })
//     @ValidateNested()
//     @Type(() => AuthDto)
//     @IsObject()
//     auth: AuthDto;
//   }

// Комбинированный тип для internal использования
export class OnDealInitRequestDto extends BitrixHookDto {
    @ApiProperty({ example: 123456 })
    @IsNumber()
    dealId: number;
}

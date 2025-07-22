import { IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class AuthDto {
    @ApiProperty({ example: 'example.bitrix24.ru' })
    @IsString()
    domain: string;
}

export class BitrixHookDto {
    @ApiProperty({ type: AuthDto })
    @ValidateNested()
    @Type(() => AuthDto)
    @IsObject()
    auth: AuthDto;
}

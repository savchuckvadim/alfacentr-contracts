import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BitrixHookDto } from '@/lib/dto';

export class DocumentNumberDto extends BitrixHookDto {
    @ApiProperty({ example: 123456 })
    @IsNumber()
    dealId: number;
}

export class DocumentNumberByPrefixDto {
    @ApiProperty({ example: 123456 })
    @IsNumber()
    dealId: number;

    @ApiProperty({ example: 'ППК' })
    @IsString()
    @IsOptional()
    prefix: string;

    @ApiProperty({ example: 'СП-123456' })
    @IsString()
    dinamycPrefix: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    socketId: string;
}

import { IsBxHookUserIdCustom } from '@/core/decorators/dto/bx-hook-user-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class DocumentEmailQueryDto {
    @ApiProperty({ example: 123456 })
    @IsNumber()
    dealId: number;

    @ApiProperty({ example: 123456 })
    @IsBxHookUserIdCustom()
    userId: string;

    @ApiProperty({ example: 'test@example.com' })
    @IsString()
    userName: string;

    @ApiProperty({ example: 'test@example.com' })
    @IsString()
    userFio: string;


    @ApiProperty({ example: 'test@example.com' })
    @IsString()
    companyId: string;

    @ApiProperty({ example: 'test@example.com' })
    @IsString()
    companyName: string;
}
export class DocumentEmailDto extends DocumentEmailQueryDto {
    @ApiProperty({ example: 123456, type: String })
    domain: string;

}
export class DocumentEmailResponseDto {
    @ApiProperty({ example: true })
    @IsBoolean()
    result: boolean;

    @ApiProperty({ example: 'Document email sent' })
    @IsString()
    message: string;
}

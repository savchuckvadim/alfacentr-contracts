import { ApiProperty } from '@nestjs/swagger';
import { EContractType } from '@alfa/entities';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class SendOnlyDto {
    @ApiProperty({ description: 'ID сделки', example: 204568 })
    @IsNotEmpty()
    @IsNumber()
    dealId: number;

    @ApiProperty({
        description: 'Домен портала',
        example: 'alfacentr.bitrix24.ru',
        required: false,
    })
    @IsOptional()
    @IsString()
    domain?: string;

    @ApiProperty({
        description:
            'Тип договора (если не передан — берётся из поля сделки «Тип»)',
        enum: EContractType,
        required: false,
    })
    @IsOptional()
    @IsEnum(EContractType, {
        message:
            'contractType должно быть одним из следующих значений: ' +
            Object.values(EContractType).join(', '),
    })
    contractType?: EContractType;

    @ApiProperty({
        description: 'E-mail получателя из заявки',
        example: 'client@example.com',
    })
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty({ description: 'ФИО получателя', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: 'Телефон получателя', required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ description: 'ID сотрудника, который отправляет' })
    @IsNotEmpty()
    @IsNumber()
    userId: number;
}

export interface SendOnlyResult {
    sent: boolean;
    /** Поля сделки с документами, которых не хватает */
    missing: { name: string; bitrixId: string }[];
    /** Контакт, которому уйдёт письмо */
    contactId: number | null;
}

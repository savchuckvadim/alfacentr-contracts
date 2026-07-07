import { ApiProperty } from '@nestjs/swagger';
import { EContractType } from '@alfa/entities';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class IsDealReadyForSendDto {
    @ApiProperty({
        description: 'ID сделки',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    dealId: number;

    @ApiProperty({
        description: 'Домен',
        example: 'alfacentr.bitrix24.ru',
        required: false,
    })
    @IsOptional()
    @IsString()
    domain?: string;

    @ApiProperty({
        description:
            'Тип договора (если не передан — берется из поля сделки "Тип")',
        example: EContractType.seminar_ppk,
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
}

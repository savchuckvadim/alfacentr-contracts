import { ApiProperty } from '@nestjs/swagger';
import { EContractType } from '@alfa/entities';
import { IsStringOrArrayString } from '@/core/decorators/dto/string-or-array-string.decorator';
import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsString,
    IsOptional,
} from 'class-validator';
import {
    IRequestDocumentGenerateFieldsType,
    IRequestDocumentGenerateFieldValueType,
    IRequestDocumentGenerateType,
    RQ_TYPE,
} from '@alfa/entities';

class DocumentGenerateFieldValueDto
    implements IRequestDocumentGenerateFieldValueType {
    @ApiProperty({
        description: 'Код поля',
        example: 'Client',
    })
    code: string;
    @ApiProperty({
        description: 'Значение поля',
        example: '123',
    })
    @IsStringOrArrayString()
    value: string | string[];
}
class DocumentGenerateFieldsDto implements IRequestDocumentGenerateFieldsType {
    [key: string]: DocumentGenerateFieldValueDto;
}

export class DocumentGenerateDto implements IRequestDocumentGenerateType {
    @ApiProperty({
        description: 'Домен',
        example: 'https://alfacentr.bitrix24.ru',
    })
    @IsString()
    domain: string;

    @ApiProperty({
        description: 'ID сокета',
        example: '123',
    })
    @IsString()
    @IsOptional()
    socketId?: string;

    @ApiProperty({
        description: 'Тип клиента',
        example: RQ_TYPE.ORGANIZATION,
        enum: RQ_TYPE,
    })
    @IsOptional()
    @IsEnum(RQ_TYPE, {
        message:
            'clientType должно быть одним из следующих значений: ' +
            Object.values(RQ_TYPE).join(', '),
    })
    clientType: RQ_TYPE;
    @ApiProperty({
        description: 'Тип договора',
        example: EContractType.seminar,
        enum: EContractType,
    })
    @IsOptional()
    @IsEnum(EContractType, {
        message:
            'contractType должно быть одним из следующих значений: ' +
            Object.values(EContractType).join(', '),
    })
    contractType: EContractType;

    @ApiProperty({
        description: 'ID сделки',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    dealId: number;

    @IsObject()
    @IsOptional()
    @ApiProperty({
        description: 'Поля для генерации',
        example: {
            Client: {
                code: 'Client',
                value: '123',
            },
        },
    })
    fields: DocumentGenerateFieldsDto;

    @ApiProperty({
        description: 'Шапка договора',
        example: '123',
    })
    @IsString()
    @IsOptional()
    header: string;

    @ApiProperty({
        description: 'Текст договора',
        example: '123',
    })
    @IsOptional()
    @IsString()
    paragraph: string;

    @ApiProperty({
        description: 'Сумма договора',
        example: '123',
    })
    @IsString()
    totalSum: string;

    @ApiProperty({
        description: 'Клиент',
        example: ['123', '456'],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    client: string[];


    @ApiProperty({
        description: 'Клиенты',
        example: ['Наименование: ___________'],
    })
    @IsOptional()
    @IsString()
    clientShortRq: string;
}

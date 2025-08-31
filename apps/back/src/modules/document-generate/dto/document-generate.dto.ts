import { ApiProperty } from '@nestjs/swagger';
import { EContractType, IRequestDocumentGenerateEmail } from '@alfa/entities';
import { IsStringOrArrayString } from '@/core/decorators/dto/string-or-array-string.decorator';
import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsString,
    IsOptional,
    IsBoolean,
} from 'class-validator';
import {
    IRequestDocumentGenerateFieldsType,
    IRequestDocumentGenerateFieldValueType,
    IRequestDocumentGenerateType,
    RQ_TYPE,
} from '@alfa/entities';

class DocumentGenerateFieldValueDto
    implements IRequestDocumentGenerateFieldValueType
{
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

    @ApiProperty({
        description: 'Подпись клиента',
        example: 'Директор _____________________/ИВАНОВ И. И.',
    })
    @IsOptional()
    @IsString()
    clientSignature: string;


    @ApiProperty({
        description: 'Наименование компании или физ лица из реквизитов для акта',
        example: 'ООО Пирожок или Иванов Иван Иванович',
    })
    @IsOptional()
    @IsString()
    clientCompanyTitle: string;
    @ApiProperty({
        description: 'Инициалы директора или физ лица из реквизитов для акта',
        example: 'ИВАНОВ И. И. или Иванов И. И.',
    })
    @IsOptional()
    @IsString()
    clientDirectorInitials: string;


    @ApiProperty({
        description: 'Массив элементов Пункт договора 1.1.2',
        example: ['123', '456'],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    paragraphItems?: string[];

    @ApiProperty({
        description: 'Номер документа',
        example: '123',
    })
    @IsOptional()
    @IsString()
    documentPrefixNumber: string;

    @ApiProperty({
        description: 'Префикс документа',
        example: '123',
    })
    @IsOptional()
    @IsString()
    documentPrefix: string;

    @ApiProperty({
        description: 'Счетчик документа',
        example: '123',
    })
    @IsOptional()
    @IsString()
    documentCounter: string;

    @ApiProperty({
        description: 'Email',
        example: 'test@test.com',
    })
    @IsOptional()

    email: IRequestDocumentGenerateEmail;

}


export class DocumentGenerateEmailDto implements IRequestDocumentGenerateEmail {
    @ApiProperty({
        description: 'Нужно ли отправлять email',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    needEmail?: boolean;

    @ApiProperty({
        description: 'Email',
        example: 'test@test.com',
    })
    @IsOptional()
    @IsString()
    email: string;

    @ApiProperty({
        description: 'Телефон',
        example: '+79999999999',
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({
        description: 'Имя',
        example: 'test',
    })
    @IsOptional()
    @IsString()
    name?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import {
    EContractType,
    IPpkDocumentApplicationData,
    IRequestDocumentGenerateEmail,
} from '@alfa/entities';
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
    IROwnBankBase,
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

export class DocumentGenerateOwnBankDto implements IROwnBankBase {
    @ApiProperty({
        description: 'Наименование банка',
        example: 'АЛЬФА-БАНК',
    })
    @IsString()
    name: string;
    @ApiProperty({
        description: 'Наименование банка',
        example: 'АЛЬФА-БАНК',
    })
    @IsString()
    bankName: string;
    @ApiProperty({
        description: 'БИК',
        example: '045004774',
    })
    @IsString()
    bik: string;
    @ApiProperty({
        description: 'Р/с',
        example: '123',
    })
    @IsString()
    rs: string;
    @ApiProperty({
        description: 'к/с',
        example: '123',
    })
    @IsString()
    ks: string;
    @ApiProperty({
        description: 'Адрес банка',
        example: 'г. Москва',
    })
    @IsString()
    bankAddress: string;
    @ApiProperty({
        description: 'Код банка',
        example: 'alfa',
    })
    @IsString()
    code: string;
}
export class DocumentGenerateDto implements IRequestDocumentGenerateType {
    @ApiProperty({
        description: 'Дата акта',
        example: '27 февраля 2026 г.',
    })
    @IsString()
    @IsOptional()
    actDate: string;

    @ApiProperty({
        description: 'Домен',
        example: 'https://alfacentr.bitrix24.ru',
    })
    @IsString()
    domain: string;
    @ApiProperty({
        description: 'ID пользователя',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @ApiProperty({
        description: 'ID пользователя',
        example: 1,
    })
    @IsNotEmpty()
    @IsString()
    userName: string;

    @ApiProperty({
        description: 'Имя пользователя',
        example: '1',
    })
    @IsNotEmpty()
    @IsString()
    userEmail: string;

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

    @ApiProperty({
        description: 'Наименование компании из битрикс',
        example: 'ООО Компания',
    })
    @IsOptional()
    @IsString()
    companyName: string;

    @ApiProperty({
        description: 'ID компании из битрикс',
        example: 1,
    })
    @IsOptional()
    @IsNumber()
    companyId: number;

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
        description:
            'Наименование компании или физ лица из реквизитов для акта',
        example: 'ООО Пирожок или Иванов Иван Иванович',
    })
    @IsOptional()
    @IsString()
    clientCompanyTitle: string;

    @ApiProperty({
        description:
            'Короткое наименование компании или физ лица из реквизитов для акта',
        example: 'ООО Пирожок или Иванов Иван Иванович',
    })
    @IsOptional()
    @IsString()
    clientCompanyShortTitle: string;

    @ApiProperty({
        description: 'Адрес компании или физ лица из реквизитов для акта',
        example: 'г. Москва, ул. Ленина, д. 1',
    })
    @IsOptional()
    @IsString()
    clientUpdAddress: string;

    @ApiProperty({
        description:
            'Короткое наименование компании или физ лица из реквизитов для акта',
        example: 'ООО Пирожок или Иванов Иван Иванович',
    })
    @IsOptional()
    @IsString()
    clientUpdShortRq: string;

    @ApiProperty({
        description: 'ИНН/КПП компании или физ лица из реквизитов для акта',
        example: '2526003992 / 252601001',
    })
    @IsOptional()
    @IsString()
    clientUpdInnKpp: string;

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

    @ApiProperty({
        description: 'Количество участников(слушателей) семинара',
        example: '123',
    })
    @IsOptional()
    @IsString()
    seminarParticipantsCount: string;

    @ApiProperty({
        description: 'Данные для генерации ППК',
        example: {
            prefix: '123',
        },
    })
    @IsOptional()
    @IsObject()
    ppkApplicationData?: IPpkDocumentApplicationData;

    @ApiProperty({
        description: 'Комментарий для сотрудника ЕДО',
        example: 'Комментарий для сотрудника ЕДО',
    })
    @IsOptional()
    @IsString()
    edoComment?: string;

    @ApiProperty({
        description: 'Реквизиты банка',
        example: {
            name: 'АЛЬФА-БАНК',
            bankName: 'АЛЬФА-БАНК',
            bik: '045004774',
            rs: '123',
            ks: '123',
            bankAddress: 'г. Москва',
        },
    })
    @IsNotEmpty()
    @IsObject()
    ownBank: DocumentGenerateOwnBankDto;
}

// р/с {MyCompanyBankDetailRqAccNum}
// в банке {MyCompanyBankDetailRqBankName},
// БИК {MyCompanyBankDetailRqBik}, к/с {MyCompanyBankDetailRqCorAccNum}

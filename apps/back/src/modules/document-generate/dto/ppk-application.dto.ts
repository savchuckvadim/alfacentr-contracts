import { IPpkApplicationParticipant, IPpkDocumentApplicationData } from "@alfa/entities";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsString } from "class-validator";

export class DocumentGeneratePpkApplicationParticipantDto implements IPpkApplicationParticipant {
    @ApiProperty({
        description: 'Индекс',
        example: '123',
    })
    @IsString()
    index: string;

    @ApiProperty({
        description: 'ФИО',
        example: '123',
    })
    @IsString()
    fio: string;


    @ApiProperty({
        description: 'Тема',
        example: '123',
    })
    @IsString()
    topic: string;

    @ApiProperty({
        description: 'Дата начала',
        example: '123',
    })
    @IsString()
    date_start: string;

    @ApiProperty({
        description: 'Дата окончания',
        example: '123',
    })
    @IsString()
    date_end: string;

}

export class DocumentGeneratePpkApplicationDataDto implements IPpkDocumentApplicationData {
    @ApiProperty({
        description: 'Префикс',
        example: '123',
    })
    @IsString()
    prefix: string;
    @ApiProperty({
        description: 'Номер документа',
        example: '123',
    })
    @IsString()
    document_number: string;
    @ApiProperty({
        description: 'День',
        example: '123',
    })
    @IsString()
    day: string;
    @ApiProperty({
        description: 'Месяц',
        example: '123',
    })
    @IsString()
    month: string;
    @ApiProperty({
        description: 'Год',
        example: '123',
    })
    @IsString()
    year: string;
    @ApiProperty({
        description: 'Участники',
        example: '123',
    })
    @IsArray()
    @Type(() => DocumentGeneratePpkApplicationParticipantDto)
    participants: DocumentGeneratePpkApplicationParticipantDto[];



    @ApiProperty({
        description: 'Наименование организации',
        example: '123',
    })
    @IsString()
    name_organization: string;
    @ApiProperty({
        description: 'Должность директора',
        example: '123',
    })
    @IsString()
    position_director: string;
    @ApiProperty({
        description: 'Подпись директора',
        example: '123',
    })
    @IsString()
    signature_director: string;
}

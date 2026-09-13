import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

/**
 * Полезная нагрузка исходящего вебхука из БП «Нумератор» (#664), ветка
 * «Таких семинаров нет». Битрикс подставляет значения прямо в URL, поэтому
 * всё приходит строками в query.
 *
 * Handler в БП:
 *   .../document-number/bp-counter-created
 *     ?smartId={=Document:ID}
 *     &elementId={=A95953_79142_18850_8272:ElementId}
 *     &prefix={=Document:UF_CRM_8_PREFIX}
 */
export class BpCounterCreatedDto {
    @ApiProperty({ example: '19622', description: 'ID карточки смарта 159' })
    @IsNumberString()
    smartId: string;

    @ApiProperty({
        example: '334372',
        description: 'ID элемента списка, который создал БП',
        required: false,
    })
    @IsOptional()
    @IsNumberString()
    elementId?: string;

    @ApiProperty({ example: 'СЗ2309СП', required: false })
    @IsOptional()
    @IsString()
    prefix?: string;
}

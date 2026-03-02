import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class AlfaActivityQueryDto {
    @ApiProperty({
        description: 'Тема для поиска в активностях',
        example: 'юр. форум',
        required: false,
    })
    @IsOptional()
    @IsString()
    subject?: string;

    @ApiProperty({
        description: 'Тип владельца активности (4 = компания)',
        example: 4,
        required: false,
        default: 4,
    })
    @IsOptional()
    @IsNumber()
    ownerTypeId?: number;
}

export class ActivityResponseDto {
    @ApiProperty({
        description: 'Список активностей',
    })
    result: any[];

    @ApiProperty({
        description: 'Количество активностей',
        example: 10,
    })
    count: number;

    //   @ApiProperty({
    //     description: 'Результаты обновления компаний',
    //     type: 'array'
    //   })
    //   responses: any[];

    @ApiProperty({
        description: 'Ошибка, если произошла',
        required: false,
    })
    error?: string;
}

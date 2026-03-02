import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CaseDeclineRequestDto {
    @ApiProperty({
        description: 'Текст для склонения',
        example: 'Иванов Иван Иванович',
    })
    @IsString()
    @IsNotEmpty()
    value: string;
}

export class CaseDeclineResponseDto {
    @ApiProperty({
        description: 'Результат склонения',
        example: 'Иванова Ивана Ивановича',
        required: false,
    })
    case?: string;
}

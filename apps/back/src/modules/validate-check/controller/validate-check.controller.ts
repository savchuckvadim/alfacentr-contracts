import { Controller, Post } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { IsEmail } from 'class-validator';

class IValidateCheckEmailDto {
    @IsEmail({}, { message: 'Некорректный email' })
    email: string;
}

/**
 * Проверки телефона здесь больше нет — и намеренно.
 *
 * Формат телефона приложение не проверяет (решение заказчика, сентябрь
 * 2026): менеджеры пишут добавочные и несколько номеров через запятую, а
 * робот берёт номера из своей таблицы, не из приложения. Эндпоинт с
 * IsPhoneNumber('RU') лежал невостребованным и был бы включён случайно.
 */
@Controller('validate-check')
export class ValidateCheckController {
    @Post('email')
    async email(@Body() dto: IValidateCheckEmailDto) {
        console.log('dto', dto);
        return true;
    }
}

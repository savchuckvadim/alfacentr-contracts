import { Controller, Post } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { IsEmail, IsPhoneNumber } from 'class-validator';

class IValidateCheckEmailDto {
    @IsEmail({}, { message: 'Некорректный email' })
    email: string;
}

class IValidateCheckPhoneDto {
    @IsPhoneNumber('RU', { message: 'Некорректный телефон' })
    phone: string;
}

@Controller('validate-check')
export class ValidateCheckController {
    @Post('email')
    async email(@Body() dto: IValidateCheckEmailDto) {
        console.log('dto', dto);
        return true;
    }

    @Post('phone')
    async phone(@Body() dto: IValidateCheckPhoneDto) {
        console.log('dto', dto);
        return true;
    }
}

import { Module } from '@nestjs/common';
import { ValidateCheckController } from './controller/validate-check.controller';

@Module({
    controllers: [ValidateCheckController],
})
export class ValidateCheckModule {}

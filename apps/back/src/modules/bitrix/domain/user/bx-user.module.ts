import { Module } from '@nestjs/common';
import { BxUserService } from './services/bx-user.service';

@Module({
    providers: [BxUserService],
    exports: [BxUserService],
})
export class BxUserDomainModule {}

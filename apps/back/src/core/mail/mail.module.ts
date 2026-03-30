import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMailerConfig } from '@/core/config/mail/mailer.config';
import { BullModule } from '@nestjs/bull';
@Global()
@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: getMailerConfig,
            inject: [ConfigService],
        }),
        BullModule.registerQueue({
            name: 'mail',
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}

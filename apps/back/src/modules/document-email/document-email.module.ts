import { Module } from '@nestjs/common';
import { PBXModule } from '../pbx';
import { DocumentEmailController } from './controllers/document-email.controller';
import { DocumentEmailService } from './services/document-email.service';
import { MailModule } from '@/core/mail/mail.module';
import { QueueModule } from '../queue/queue.module';
import { DocumentEmailSendQueueProcessor } from './processor/document-email.processor';
import { TelegramModule } from '../telegram';

@Module({
    imports: [PBXModule, MailModule, QueueModule, TelegramModule],
    controllers: [DocumentEmailController],
    providers: [DocumentEmailService, DocumentEmailSendQueueProcessor],
})
export class DocumentEmailModule {}

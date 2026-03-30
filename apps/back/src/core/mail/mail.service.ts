import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { render } from '@react-email/components';

import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { SendEmailOfferRequestDto } from './mail.dto';
import { EmailOfferTemplate } from './templates/email-offer.template';
import { StorageService, StorageType } from '@/core/storage';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(
        private readonly mailerService: MailerService,
        @InjectQueue('mail') private readonly queue: Queue,
        private readonly storageService: StorageService,
    ) {}

    public async sendOfferEmail(dto: SendEmailOfferRequestDto) {
        // Читаем логотип из storage

        // Читаем PDF из storage
        let pdfBuffer: Buffer | null = null;
        try {
            pdfBuffer = await this.storageService.readFileByType(
                StorageType.APP,
                'bitrix-app/offer',
                'offer.pdf',
            );
        } catch (error) {
            this.logger.warn('Не удалось загрузить PDF:', error);
        }

        // Используем CID для логотипа (встроенное изображение) - работает в Gmail
        const html = await render(EmailOfferTemplate());

        // Формируем attachments
        const attachments: any[] = [];

        // Добавляем PDF как вложение
        if (pdfBuffer) {
            attachments.push({
                filename: 'offer.pdf',
                content: pdfBuffer,
                contentType: 'application/pdf',
            });
        }

        await this.sendEmail({
            subject: 'Коммерческое предложение Битрикс для партнеров Гарант',
            html: html,
            context: {
                name: 'Вадим Савчук',
            },
            to: [dto.email],
            attachments: attachments.length > 0 ? attachments : undefined,
        });
        return html;
    }

    async sendEmail(params: {
        subject: string;
        html: string;
        to: string[];
        context: ISendMailOptions['context'];
        attachments?: Array<{
            filename: string;
            content: Buffer;
            cid?: string;
            contentType: string;
        }>;
    }) {
        try {
            const from = `"April App" <${process.env.SMTP_FROM || 'manager@april-app.ru'}>`;

            const emailsList: string[] = params.to;

            if (!emailsList) {
                throw new Error(
                    `No recipients found in SMTP_TO env var, please check your .env file`,
                );
            }

            const sendMailParams: ISendMailOptions = {
                to: emailsList,
                from: from,
                subject: params.subject,
                html: params.html,
                attachments: params.attachments,
            };
            const response = await this.mailerService.sendMail(sendMailParams);
            this.logger.log(
                `Email sent successfully to recipients with the following parameters : ${JSON.stringify(
                    sendMailParams,
                )}`,
                response,
            );
            return {
                ...response,

                message: 'Email sent successfully',
            };
        } catch (error) {
            this.logger.error(
                `Error while sending mail with the following parameters : ${JSON.stringify(
                    params,
                )}`,
                error,
            );
        }
    }
}

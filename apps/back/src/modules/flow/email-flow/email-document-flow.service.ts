import { delay } from '@/lib';
import { EmailService } from './email.service';
import { BxDealStageFlowService } from '../bitrix-deal-flow/bx-deal-stage-flow.service';
import { BitrixService } from '../../bitrix';
import { BxTimelineService } from '../timeline-flow/bx-timeline.service';
import { getStringError } from '@/lib/error-handler/get-string-error';

export class EmailDocumentFlowDto {
    filesForSend: [string, string][] = [];
    email: string;
    name: string;
    phone: string;
    documentPrefixNumber: string;

    contactId: number;
    edoComment: string;
    needEdoEmail: boolean;

    companyName: string;
    userName: string;
    userId: string;
}
export class EmailDocumentFlowService {
    constructor(
        private readonly bitrix: BitrixService,
        private readonly bxTimelineService: BxTimelineService,
        private readonly dealId: number,
    ) { }
    async flow() {
        try {
            await delay(400);
            const dealService = new BxDealStageFlowService(
                this.bitrix,
                Number(this.dealId),
            );

            void (await dealService.changeStageFromEmailSent());
        } catch (error) {
            console.error('error', error);
            void (await this.bxTimelineService.send(
                '❌ Ошибка при отправке email клиенту',
                'email',
            ));
        }
    }
    async flowWithServerSend(dto: EmailDocumentFlowDto) {
        const dealService = new BxDealStageFlowService(
            this.bitrix,
            Number(this.dealId),
        );
        await delay(1100);
        void (await this.bxTimelineService.send(
            '⌛ Отправка email...',
            'email',
        ));
        console.log('EmailDocumentFlowService')

        console.log('dto.userId', dto.userId);

        const emailService = new EmailService(
            this.bitrix,
            dto.filesForSend,
            dto.email,
            dto.name || '',
            dto.phone || '',
            dto.documentPrefixNumber,
            this.dealId,
            dto.companyName || '',
            dto.userName || '',
            dto.userId,
            dto.contactId,
            dto.edoComment,
        );
        let result = null;
        try {
            await delay(300);
            await emailService.send();

            await delay(1100);
            void (await dealService.changeStageFromEmailSent());
        } catch (error) {
            console.error('error', error);
            void (await this.bxTimelineService.send(
                '❌ Ошибка при отправке email клиенту',
                'email',
            ));
        }

        try {
            await delay(1100);
            await emailService.sendForEdoEmployee();
        } catch (error) {
            console.error('error', error);
            const errorString: string = getStringError(error);

            void (await this.bxTimelineService.send(
                `❌ Ошибка при отправке email сотруднику ЭДО: ${errorString}`,
                'error',
            ));
        }

        //обновление стадии сделки

        return {
            result,
        };
    }
}

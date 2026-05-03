import { delay } from '@/lib';
import { BitrixService, IBXContact } from '@/modules/bitrix';
import { DOCUMENT_FIELD_CONTACT_ID_FOR_SEND_EMAIL_BITRIX_ID } from '@alfa/entities';

export class BxDealContactFlowDto {
    email: string;
    name: string;
    phone: string;
    userId: number;
}
export class BxDealContactFlowService {
    constructor(
        private readonly bitrix: BitrixService,
        private readonly dealId: number,
    ) {}

    async flow(dto: BxDealContactFlowDto) {
        const contactResponse = await this.bitrix.contact.getList({
            EMAIL: dto.email || '',
        });

        const contact = (contactResponse.result?.[0] ||
            null) as IBXContact | null;
        let contactId = null as number | null;

        if (!contact) {
            const contactAddResponse = await this.bitrix.contact.set({
                RESPONSIBLE_ID: dto.userId,
                NAME: dto.name || '',
                EMAIL: [{ VALUE: dto.email || '', TYPE: 'WORK' }], //MAILING
                PHONE: [{ VALUE: dto.phone || '', TYPE: 'WORK' }], //MAILING
                DEAL_ID: this.dealId,
            });
            const createdContactId = contactAddResponse.result;

            contactId = Number(createdContactId);
        } else {
            contactId = Number(contact?.ID ?? 0);
        }
        await this.bitrix.deal.update(this.dealId, {
            [DOCUMENT_FIELD_CONTACT_ID_FOR_SEND_EMAIL_BITRIX_ID]: contactId,
        });
        await this.bitrix.deal.contactItemsSet(this.dealId, [contactId]);
        await delay(200);
        return {
            contactId,
        };
    }
}

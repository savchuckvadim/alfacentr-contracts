import { DOCUMENT_FIELD_CONTACT_ID_FOR_SEND_EMAIL_BITRIX_ID } from '@alfa/entities';
import { Bitrix, IBXContact } from '@bitrix/index';

export interface IBxDealContactFlowDto {
    dealId: number;
    email: string;
    name: string;
    phone: string;
    userId: number;
}
export class BxDealCurrentContactService {

    async flow(dto: IBxDealContactFlowDto) {
        const { dealId, email, name, phone, userId } = dto;
        const bitrix = Bitrix.getService();

        const contactResponse = await bitrix.contact.getList({
            EMAIL: dto.email || '',
        });

        const contact = (contactResponse.result?.[0] ||
            null) as IBXContact | null;
        let contactId = null as number | null;

        if (!contact) {
            const contactAddResponse = await bitrix.contact.set({
                RESPONSIBLE_ID: userId,
                NAME: name || '',
                EMAIL: [{ VALUE: email || '', TYPE: 'WORK' }],
                PHONE: [{ VALUE: phone || '', TYPE: 'WORK' }],
                // DEAL_ID: this.dealId,
            });
            const createdContactId = contactAddResponse.result;

            contactId = Number(createdContactId);
        } else {
            contactId = Number(contact?.ID ?? 0);
        }
        await bitrix.deal.update(dealId, {
            [DOCUMENT_FIELD_CONTACT_ID_FOR_SEND_EMAIL_BITRIX_ID]: contactId,
        });
        await bitrix.deal.contactItemsSet(dealId, [contactId]);
        return {
            contactId,
        };
    }
}

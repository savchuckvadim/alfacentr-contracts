import { BitrixService, IBXContact } from '@/modules/bitrix';
import { DOCUMENT_FIELD_CONTACT_ID_FOR_SEND_EMAIL_BITRIX_ID } from '@alfa/entities';
import { pickContactByEmail } from '@/modules/flow/bitrix-deal-flow/deal-contact.rules';

export interface IBxDealContactSyncDto {
    dealId: number;
    email: string;
    name: string;
    phone: string;
    userId: number;
    dealFields?: Record<string, string | number>;
}
const EMAIL_VALUE_TYPE = 'WORK'; // 'MAILING';

//порт актуальной фронтовой логики
//apps/front/modules/features/communications/services/bx-deal-contact-flow.service.ts
export class BxDealContactSyncService {
    private email!: string;
    private name!: string;
    private phone!: string;
    private userId!: number;
    private dealId!: number;
    private dealFields!: Record<string, string | number>;

    constructor(private readonly bitrix: BitrixService) {}

    async flow(dto: IBxDealContactSyncDto) {
        this.init(dto);

        const contacts = await this.getContactList();

        const contact = await this.getContactByEmailType(contacts);

        let contactId = null as number | null;

        if (!contact) {
            contactId = await this.addContact();
        } else {
            contactId = Number(contact?.ID ?? 0);
        }

        await this.updateDealContact(this.dealId, contactId);

        return {
            contactId,
        };
    }
    protected init(dto: IBxDealContactSyncDto) {
        this.email = dto.email || '';
        this.name = dto.name || '';
        this.phone = dto.phone || '';
        this.userId = dto.userId || 0;
        this.dealId = dto.dealId || 0;
        this.dealFields = dto.dealFields || {};
    }
    protected async getContactList(): Promise<IBXContact[]> {
        const contactResponse = await this.bitrix.contact.getList(
            {
                EMAIL: this.email || '',
            },
            ['ID', 'NAME', 'EMAIL', 'PHONE'],
        );
        return contactResponse.result || [];
    }

    /**
     * Контакт с нужным адресом среди найденных.
     *
     * Фильтр EMAIL у crm.contact.list работает как «содержит», а не
     * «равно», поэтому в выдачу попадают посторонние. Раньше при отсутствии
     * рабочего адреса брался просто первый из списка, и ему же
     * перезаписывался e-mail: чужой карточке подменялся адрес, а документы
     * уходили не тому человеку. Теперь без точного совпадения возвращаем
     * null — вызывающий заведёт новый контакт.
     */
    protected async getContactByEmailType(
        contacts: IBXContact[],
    ): Promise<IBXContact | null> {
        const { exact, needsWorkType } = pickContactByEmail(
            contacts,
            this.email,
        );
        if (!exact) return null;

        //адрес у контакта есть, но не помечен рабочим — робот отправки
        //такой не видит, проставляем тип его же адресу
        if (needsWorkType) await this.updateContactEmail(exact);

        return exact;
    }

    protected async updateContactEmail(contact: IBXContact) {
        await this.bitrix.contact.update(Number(contact.ID), {
            EMAIL: [{ VALUE: this.email || '', TYPE: EMAIL_VALUE_TYPE }],
        });
    }
    protected async addContact(): Promise<number> {
        const contactAddResponse = await this.bitrix.contact.set({
            RESPONSIBLE_ID: this.userId,
            NAME: this.name || '',
            EMAIL: [{ VALUE: this.email || '', TYPE: EMAIL_VALUE_TYPE }],
            PHONE: [{ VALUE: this.phone || '', TYPE: EMAIL_VALUE_TYPE }],
        });
        return Number(contactAddResponse.result);
    }

    protected async updateDealContact(dealId: number, contactId: number) {
        await this.bitrix.deal.update(dealId, {
            [DOCUMENT_FIELD_CONTACT_ID_FOR_SEND_EMAIL_BITRIX_ID]: contactId,
            ...this.dealFields,
        });
        await this.bitrix.deal.contactItemsSet(dealId, [contactId]);
    }
}

import { delay } from '@/lib';
import { Logger } from '@nestjs/common';
import { BitrixService, IBXContact } from '@/modules/bitrix';
import { DOCUMENT_FIELD_CONTACT_ID_FOR_SEND_EMAIL_BITRIX_ID } from '@alfa/entities';
import {
    isContactLast,
    pickContactByEmail,
    putContactLast,
    WORK_EMAIL_TYPE,
} from './deal-contact.rules';

export class BxDealContactFlowDto {
    email: string;
    name: string;
    phone: string;
    userId: number;
}

/**
 * Контакт сделки для отправки документов.
 *
 * Робот Битрикса «Отправить письмо клиенту» выбрать получателя не умеет —
 * он берёт рабочий e-mail последнего добавленного контакта сделки.
 * Поэтому наш контакт должен стоять последним.
 *
 * Сделка 204568 (19.11.2026): приём привязал контакт из заявки в 08:52,
 * в 09:32 менеджер вручную поставил компанию — Битрикс снёс нашего и
 * подставил три контакта компании, — а в 12:30 робот отправил документы
 * первому из них. Клиент письма не получил.
 */
export class BxDealContactFlowService {
    private readonly logger = new Logger(BxDealContactFlowService.name);

    constructor(
        private readonly bitrix: BitrixService,
        private readonly dealId: number,
    ) {}

    async flow(dto: BxDealContactFlowDto) {
        const contactId = await this.resolveContactId(dto);
        if (!contactId) {
            this.logger.warn(
                `Сделка ${this.dealId}: контакт для отправки не определён`,
            );
            return { contactId: null };
        }

        await this.bitrix.deal.update(this.dealId, {
            [DOCUMENT_FIELD_CONTACT_ID_FOR_SEND_EMAIL_BITRIX_ID]: contactId,
        });

        await this.ensureContactIsLast(contactId);
        await delay(200);

        return { contactId };
    }

    /**
     * Контакт с адресом из заявки: находим существующий или заводим новый.
     *
     * Первый попавшийся из выдачи не берём. Фильтр EMAIL у портала работает
     * как «содержит», и раньше чужому контакту доставался и наш адрес
     * (перезаписью), и письмо клиента
     */
    private async resolveContactId(
        dto: BxDealContactFlowDto,
    ): Promise<number | null> {
        const email = dto.email || '';
        if (!email) return null;

        const contactResponse = await this.bitrix.contact.getList(
            { EMAIL: email },
            ['ID', 'NAME', 'EMAIL', 'PHONE'],
        );
        const found: IBXContact[] = contactResponse.result || [];

        const { exact, needsWorkType } = pickContactByEmail(found, email);

        if (exact) {
            const contactId = Number(exact.ID ?? 0);
            //адрес у контакта есть, но не помечен рабочим — робот его не
            //увидит, проставляем тип его же адресу
            if (needsWorkType && contactId) {
                await this.setWorkEmail(contactId, email);
            }
            return contactId || null;
        }

        const contactAddResponse = await this.bitrix.contact.set({
            RESPONSIBLE_ID: dto.userId,
            NAME: dto.name || '',
            EMAIL: [{ VALUE: email, TYPE: WORK_EMAIL_TYPE }],
            PHONE: [{ VALUE: dto.phone || '', TYPE: WORK_EMAIL_TYPE }],
            DEAL_ID: this.dealId,
        });

        return Number(contactAddResponse.result) || null;
    }

    /** Помечает адрес контакта рабочим, не трогая остальные его адреса */
    private async setWorkEmail(contactId: number, email: string) {
        await this.bitrix.contact.update(contactId, {
            EMAIL: [{ VALUE: email, TYPE: WORK_EMAIL_TYPE }],
        });
    }

    /**
     * Ставит наш контакт последним в сделке.
     *
     * Контакты компании не выбрасываем — менеджеры ими пользуются, а
     * Битрикс привязал их сам. Роботу достаточно, чтобы наш был последним
     */
    private async ensureContactIsLast(contactId: number) {
        const currentIds = await this.getDealContactIds();

        if (isContactLast(currentIds, contactId)) return;

        const nextIds = putContactLast(currentIds, contactId);
        if (!nextIds.length) return;

        await this.bitrix.deal.contactItemsSet(this.dealId, nextIds);
        this.logger.log(
            `Сделка ${this.dealId}: контакт ${contactId} поставлен последним (всего ${nextIds.length})`,
        );
    }

    private async getDealContactIds(): Promise<number[]> {
        try {
            const response = await this.bitrix.deal.contactItemsGet(
                this.dealId,
            );
            const items = (response?.result || []) as {
                CONTACT_ID?: number | string;
            }[];

            return items
                .map((item) => Number(item?.CONTACT_ID))
                .filter((id) => Number.isInteger(id) && id > 0);
        } catch (error) {
            //не роняем отправку: без списка просто поставим один наш контакт
            this.logger.warn(
                `Сделка ${this.dealId}: не прочитаны контакты — ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );
            return [];
        }
    }
}

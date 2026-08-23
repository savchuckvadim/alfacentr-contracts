import { BxDealService } from '../services/bx-deal.service';
import { DealFieldValuesHelperService } from '../../../lib/deal-helper/deal-values-helper.service';
import { normalizeSeminarDayValues } from '../../../lib/deal-helper/normalize-seminar-days.helper';

import { AlfaFieldsService } from '@/modules/alfa-fields';
import { BitrixService } from '@/modules/bitrix';
import {
    BidInfoLayoutService,
    GetDealBidItemsType,
} from '@/modules/bid-info-layout/bid-info-layout.service';
import {
    AlfaParticipantSmartItemUserFieldsEnum,
    BxParticipantsFieldNameEnum,
    EntityTypeIdEnum,
    IAlfaParticipantSmartItem,
} from '@alfa/entities';

export enum BitrixEntityType {
    DEAL = 'deal',
    COMPANY = 'company',
    CONTACT = 'contact',
    LEAD = 'lead',
}

export interface BidParticipantItem {
    title: string;
    lines: string[];
}

export interface BidItemsByParticipantsResult {
    bidLines: string[];
    participants: BidParticipantItem[];
}

export class GetDealBidItemsUseCase {
    // private type: GetDealBidItemsType;
    constructor(private readonly bitrix: BitrixService) {}

    private async init() {
        const bxDealService = new BxDealService();
        const alfaFieldService = new AlfaFieldsService();

        await bxDealService.init(this.bitrix);
        await alfaFieldService.init(this.bitrix);

        return {
            bxDealService,
            alfaFieldService,
        };
    }

    private readonly participantFieldsForEmail: Array<{
        code: AlfaParticipantSmartItemUserFieldsEnum;
        label: string;
    }> = [
        {
            code: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Name,
            label: BxParticipantsFieldNameEnum.name,
        },
        {
            code: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Email,
            label: BxParticipantsFieldNameEnum.email,
        },
        {
            code: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Phone,
            label: BxParticipantsFieldNameEnum.phone,
        },
        {
            code: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AddressForUdost,
            label: BxParticipantsFieldNameEnum.address_for_udost,
        },
        {
            code: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Comment,
            label: BxParticipantsFieldNameEnum.comment,
        },
        {
            code: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Format,
            label: BxParticipantsFieldNameEnum.format,
        },
        {
            code: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12IsPpk,
            label: BxParticipantsFieldNameEnum.is_ppk,
        },
        {
            code: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantGos,
            label: BxParticipantsFieldNameEnum.accountant_gos,
        },
        {
            code: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantMedical,
            label: BxParticipantsFieldNameEnum.accountant_medical,
        },
        {
            code: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Zakupki,
            label: BxParticipantsFieldNameEnum.zakupki,
        },
        {
            code: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Kadry,
            label: BxParticipantsFieldNameEnum.kadry,
        },
        {
            code: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Days,
            label: BxParticipantsFieldNameEnum.days,
        },
    ];

    private formatParticipantValue(value: unknown): string {
        if (Array.isArray(value)) {
            return value
                .filter(item => item !== null && item !== undefined && item !== '')
                .map(item =>
                    typeof item === 'object' ? JSON.stringify(item) : String(item),
                )
                .join(', ');
        }
        if (value === null || value === undefined) {
            return '';
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        if (typeof value === 'string') {
            return value.trim();
        }
        if (
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            typeof value === 'bigint'
        ) {
            return `${value}`.trim();
        }
        return '';
    }

    private getParticipantTitle(
        index: number,
    ): string {
        return `Участник ${index + 1}`;
    }

    private formatParticipantFieldValue(
        code: AlfaParticipantSmartItemUserFieldsEnum,
        value: unknown,
    ): string {
        const formatted = this.formatParticipantValue(value);
        if (!formatted) {
            return '';
        }

        if (code === AlfaParticipantSmartItemUserFieldsEnum.ufCrm12IsPpk) {
            const normalized = formatted.toUpperCase();
            if (normalized === 'Y') return 'Да';
            if (normalized === 'N') return 'Нет';
        }

        return formatted;
    }

    private getParticipantLines(
        participant: IAlfaParticipantSmartItem,
    ): string[] {
        const lines: string[] = [];
        for (const field of this.participantFieldsForEmail) {
            const rawValue = participant[field.code] as unknown;
            const value = this.formatParticipantFieldValue(field.code, rawValue);
            if (!value) continue;
            lines.push(`${field.label}: ${value}`);
        }
        return lines;
    }

    public async getItemsByParticipants(
        dealId: number,
    ): Promise<BidItemsByParticipantsResult> {
        const { bxDealService, alfaFieldService } = await this.init();

        const { fieldData, bxFieldsIds } =
            await alfaFieldService.getDealFieldsDataWithIds();

        const participantsResponse = await this.bitrix.item.list(
            EntityTypeIdEnum.PARTICIPANT as unknown as string,
            {
                parentId2: dealId,
            },
        );
        const participantsPayload = participantsResponse as
            | { result?: { items?: unknown } }
            | undefined;
        const participantsItems = participantsPayload?.result?.items;
        const participants = Array.isArray(participantsItems)
            ? (participantsItems as IAlfaParticipantSmartItem[])
            : [];

        const deal = await bxDealService.getDeal(dealId, bxFieldsIds);
        //нормализуем поля семинаров так же, как на приеме заявки
        const dealValues = normalizeSeminarDayValues(
            DealFieldValuesHelperService.getDealValues(deal, fieldData),
        );
        const bidInfoLayoutService = new BidInfoLayoutService(
            GetDealBidItemsType.HTML,
        );
        const bidLines = bidInfoLayoutService.getInfoLines(dealValues);
        const participantItems = participants
            .map((participant, index) => {
                const lines = this.getParticipantLines(participant);
                return {
                    title: this.getParticipantTitle(index),
                    lines,
                };
            })
            .filter(item => item.lines.length > 0);

        return {
            bidLines,
            participants: participantItems,
        };
    }

    public async getItems(dealId: number) {
        const { bxDealService, alfaFieldService } = await this.init();

        const { fieldData, bxFieldsIds } =
            await alfaFieldService.getDealFieldsDataWithIds();

        const deal = await bxDealService.getDeal(dealId, bxFieldsIds);
        //нормализуем поля семинаров так же, как на приеме заявки
        const dealValues = normalizeSeminarDayValues(
            DealFieldValuesHelperService.getDealValues(deal, fieldData),
        );
        const bidInfoLayoutService = new BidInfoLayoutService(
            GetDealBidItemsType.HTML,
        );
        const comment = bidInfoLayoutService.getComment(dealValues);

        return comment;
    }
}

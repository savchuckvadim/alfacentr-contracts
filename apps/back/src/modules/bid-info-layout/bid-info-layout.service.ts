
import { DealValue } from '@/lib/deal-helper/deal-values-helper.service';
import { getIsNotEmptyParticipant } from '@/lib/deal-helper/get-participant-product-values-from-deal.helepr';
import { BitrixService } from '@/modules/bitrix';
import { BxDealDataKeys } from '@alfa/entities';


export enum GetDealBidItemsType {
    BB = 'bb',
    HTML = 'html',
    ARRAY = 'array',
}

export enum GetDealBidItemsIconCode {
    FIRST = 'first',
    BID_TYPE = 'bid_type',
    PARTICIPANT = 'participant',
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    SUCCESS = 'success',
}

export class BidInfoLayoutService {
    private type: GetDealBidItemsType;
    constructor(
      
        type: GetDealBidItemsType

    ) {
        this.type = type
     }



    public getComment(dealValues: DealValue[]) {
        const participants = this.getParticipants(dealValues);
        const info = this.getInfo(dealValues);
        let comment = `${info}\n`;
        for (const participant in participants) {
            comment += participants[participant] + '\n \n';
        }

        return comment;
    }
    private getParticipants(dealValues: DealValue[]) {
        let participants = {} as Record<string, string>;
        let participantsCount = 0;
        dealValues.forEach((value) => {
            if (
                value.name.includes('Участник') &&
                value.value &&
                value.value !== '0'
            ) {
                for (let i = 1; i <= 11; i++) {
                    const key = `Участник ${i}`;
                    if (getIsNotEmptyParticipant(dealValues, i)) {
                        const isFirstValue = !participants[i];
                        const isFirst = !participantsCount;

                        if (i === 1) {
                            if (
                                value.name.includes(key) &&
                                !value.name.includes('10')
                            ) {
                                participants[i] = isFirst
                                    ? this.getParticipantItemByType(
                                        i,
                                        value,
                                        isFirst,
                                        isFirstValue,
                                    ) || ''
                                    : participants[i] +
                                    this.getParticipantItemByType(
                                        i,
                                        value,
                                        isFirst,
                                        isFirstValue,
                                    ) || '';
                            }
                        } else {
                            if (value.name.includes(key) && value.value) {
                                participants[i] = isFirst
                                    ? this.getParticipantItemByType(
                                        i,
                                        value,
                                        isFirst,
                                        isFirstValue,
                                    ) || ''
                                    : participants[i]
                                        ? participants[i] +
                                        this.getParticipantItemByType(
                                            i,
                                            value,
                                            isFirst,
                                            isFirstValue,
                                        ) || ''
                                        : this.getParticipantItemByType(
                                            i,
                                            value,
                                            isFirst,
                                            isFirstValue,
                                        ) || '';
                            }
                        }
                        participantsCount++;
                    }
                }
            }
        });
        return participants;
    }
    private getInfo(dealValues: DealValue[]) {
        let info = '';
        const bidTye = dealValues.find((value) => value.code === BxDealDataKeys.bid_type);

        if (bidTye && bidTye.value) {
            const bidTypeFieldName = 'Тип заявки';
            info = this.getInfoItemByType(
                bidTypeFieldName,
                bidTye,
                true,
                GetDealBidItemsIconCode.BID_TYPE,
            );
        }
        dealValues.forEach((value) => {
            if (
                !value.name.includes('Участник') &&
                !value.name.toLowerCase().includes('скрытое') &&
                value.code !== BxDealDataKeys.bid_type
            ) {
                if (value.value) {
                    // if (!info) info = '💡[B]' + 'Информация' + '[/B] \n';
                    // info += '[B]' + value.name + ':[/B] ' + value.value + ' \n';
                    const isFirst = !info;
                    info += this.getInfoItemByType(value.name, value, isFirst);
                }
            }
        });
        return info;
    }

    private getParticipantItemByType(
        key: number,
        value: DealValue,
        isFirstParticipant: boolean,
        isFirstValue: boolean,
    ) {
        let item: string = '';
        const icon = this.getIconByCode(GetDealBidItemsIconCode.PARTICIPANT);
        const participantFieldName = this.normalizeParticipantFieldName(
            key,
            value.name,
        );
        const participantFieldValue = this.formatDealValueToText(value.value).trim();
        if (this.type === GetDealBidItemsType.BB) {
            if (isFirstValue) {
                item += `${icon}[B] Участник ${key}[/B] \n`;
            }
            item +=
                `• [B]` +
                participantFieldName +
                ':[/B] ' +
                participantFieldValue +
                ' \n';
        } else if (this.type === GetDealBidItemsType.HTML) {
            if (isFirstParticipant) {
                item =
                    '<div style="margin-bottom: 1px; width: 100%; display: flex; justify-content: center; align-items: center;"><h3>' +
                    'Участники' +
                    '</h3></div>';
            }
            if (isFirstValue) {
                item += `<div style="margin-top: 8px; margin-bottom: 4px;"><b>Участник ${key}</b></div>`;
            }
            item +=
                '<div style="margin: 0; padding: 0;"> <b>' +
                participantFieldName +
                ':</b> ' +
                participantFieldValue +
                '</div>';
        } else if (this.type === GetDealBidItemsType.ARRAY) {
            item = participantFieldValue;
        }
        return item;
    }
    private getInfoItemByType(
        name: string,
        value: DealValue,
        isFirst: boolean,
        iconCode?: GetDealBidItemsIconCode,
    ) {
        let item: string | string[] = '';
        const icon = iconCode ? this.getIconByCode(iconCode) : '';
        const firstIcon = isFirst
            ? this.getIconByCode(GetDealBidItemsIconCode.FIRST)
            : '';
        if (this.type === GetDealBidItemsType.BB) {
            if (isFirst) {
                item = `${firstIcon}[B] ` + 'Информация' + '[/B] \n';
            }

            item += `${icon}[B] ` + name + ':[/B] ' + this.formatDealValueToText(value.value) + ' \n';
        } else if (this.type === GetDealBidItemsType.HTML) {
            // if (isFirst) {
            //     item = '💡<b>' + 'Информация' + '</b> \n';
            // }

            item += '<li> <b>' + ` ${name}` + ':</b> ' + this.formatDealValueToText(value.value) + '</li>';
        } else if (this.type === GetDealBidItemsType.ARRAY) {
            if (isFirst) {
                item = `${firstIcon}[B]` + 'Информация' + '[/B] \n';
            }

            item += `${icon}[B] ` + name + ':[/B] ' + this.formatDealValueToText(value.value) + ' \n';
        }
        return item;
    }

    private getIconByCode(iconCode: GetDealBidItemsIconCode) {
        switch (iconCode) {
            case GetDealBidItemsIconCode.BID_TYPE:
                return '📌';
            case GetDealBidItemsIconCode.FIRST:
                return '💡';
            case GetDealBidItemsIconCode.PARTICIPANT:
                return '👤';
            case GetDealBidItemsIconCode.INFO:
                return '🧩';
            case GetDealBidItemsIconCode.WARNING:
                return '🚨';
            case GetDealBidItemsIconCode.ERROR:
                return '❌';
            case GetDealBidItemsIconCode.SUCCESS:
                return '✅';
            default:
                return '';
        }
    }


    private formatDealValueToText(value: DealValue['value']): string {
        if (Array.isArray(value)) {
            return value
                .map((item) => {
                    if (typeof item === 'string') {
                        return item;
                    }
                    if (this.hasName(item)) {
                        return String(item.name);
                    }
                    return JSON.stringify(item);
                })
                .join(', ');
        }

        if (this.hasName(value)) {
            return String(value.name);
        }
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }

        return String(value);
    }

    private hasName(value: unknown): value is { name: string } {
        return (
            typeof value === 'object' &&
            value !== null &&
            'name' in value &&
            typeof (value as { name?: unknown }).name === 'string'
        );
    }

    private normalizeParticipantFieldName(
        participantNumber: number,
        rawName: string,
    ): string {
        return rawName
            .replace(new RegExp(`^Участник\\s+${participantNumber}\\s*`, 'i'), '')
            .trim();
    }
}

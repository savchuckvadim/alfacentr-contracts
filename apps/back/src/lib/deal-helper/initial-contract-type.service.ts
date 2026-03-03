import { BxDealData, BxDealDataKeys, EContractType } from '@alfa/entities';
import { DealValue } from './deal-values-helper.service';
import { Injectable } from '@nestjs/common';

export enum EBidType {
    seminar = 'seminar',
    up = 'up',
}
@Injectable()
export class InitialBidTypeService {
    constructor() {}

    /**
     * сейчас логика в тестовом режиме завязана на поле тип
     * (семинар , ппк, семнар+ ппк и тд)
     * изменяем на привязку к типу заявки
     *
     *
     *
     */
    public initialContractType(dealValues: DealValue[]): EBidType | null {
        let resultContractType: EBidType = EBidType.seminar;
        const contractType = dealValues.find(
            (value) => value.code === BxDealDataKeys.bid_type,
        );
        const contractTypeValue = contractType?.value;
        const contractTypeField = BxDealData[BxDealDataKeys.bid_type];

        for (const item of contractTypeField.list) {
            if (contractTypeValue === item.name) {
                if (item.name.toLowerCase().includes('учетная')) {
                    resultContractType = EBidType.up;
                }
            }
        }
        return resultContractType;
    }

    public isUp(type: EBidType): boolean {
        return type === EBidType.up;
    }

    public isSeminar(type: EBidType): boolean {
        return !this.isUp(type);
    }
}

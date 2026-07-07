import { Injectable } from '@nestjs/common';
import { PBXService } from '@/modules/pbx';
import { IsDealReadyForSendDto } from '../dto/is-deal-ready-for-send.dto';
import { DealDocumentReadyService } from '../services/deal-document-ready.service';

const DEFAULT_DOMAIN = 'alfacentr.bitrix24.ru';

@Injectable()
export class IsDealReadyForSendUseCase {
    constructor(private readonly pbxService: PBXService) {}

    /**
     * Проверяет, что все обязательные (по типу договора) поля сделки
     * с документами заполнены — сделка готова к отправке
     */
    async isDealReadyForSend(dto: IsDealReadyForSendDto): Promise<boolean> {
        const { bitrix } = await this.pbxService.init(
            dto.domain || DEFAULT_DOMAIN,
        );

        const dealDocumentReadyService = new DealDocumentReadyService(bitrix);

        return await dealDocumentReadyService.isDealReadyForSend(
            Number(dto.dealId),
            dto.contractType,
        );
    }
}

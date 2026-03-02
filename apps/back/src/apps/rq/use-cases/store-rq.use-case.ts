import { BadRequestException, Injectable } from '@nestjs/common';
import { StoreRqRequestDto } from '../dto/request.dto';
import { ERQItem } from '../dto/erq-item.dto';
import { RequisiteService } from '../services/requisite.service';
import { RequisiteUpdateService } from '../services/requisite-update.service';
import { ErrorMessage } from '../enums/error-message.enum';

@Injectable()
export class StoreRqUseCase {
    constructor(
        private readonly requisiteService: RequisiteService,
        private readonly requisiteUpdateService: RequisiteUpdateService,
    ) {}

    async execute(dto: StoreRqRequestDto): Promise<ERQItem | boolean | number> {
        const { company_id, domain, rq, bx_id, preset_id } = dto;
        // iswait всегда true - убрали логику очередей
        const bxRqs = await this.requisiteService.getRq(company_id, domain);
        const { address, bank } = dto;
        if (rq) {
            // Обновление реквизита
            const result = await this.requisiteUpdateService.updateRequisite(
                rq,
                bx_id,
                bxRqs,
                company_id,
                domain,
                preset_id,
            );
            return result;
        } else if (address) {
            // Обновление адреса
            return await this.requisiteUpdateService.updateAddress(
                address,
                bx_id!,
                company_id,
                domain,
            );
        } else if (bank) {
            // Обновление банка
            return await this.requisiteUpdateService.updateBank(
                bank,
                bx_id!,
                domain,
            );
        }

        throw new BadRequestException(ErrorMessage.NOT_FULL_DATA);
    }
}

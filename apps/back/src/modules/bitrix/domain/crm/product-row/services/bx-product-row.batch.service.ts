import { Injectable } from "@nestjs/common";
import { BxProductRowRepository } from "../repository/bx-product-row.repository";
import { BitrixBaseApi } from "src/modules/bitrix/core/base/bitrix-base-api";
import { IBXProductRow, IBXProductRowRow } from "../interface/bx-product-row.interface";

@Injectable()
export class BxProductRowBatchService {
    private repo: BxProductRowRepository
    constructor() { }

    init(api: BitrixBaseApi) {
        this.repo = new BxProductRowRepository(api);
    }

    set(cmdCode: string, data: IBXProductRow) {
        return this.repo.setBtch(cmdCode, data);
    }
    add(cmdCode: string, data: IBXProductRowRow) {
        return this.repo.addBtch(cmdCode, data);
    }
} 
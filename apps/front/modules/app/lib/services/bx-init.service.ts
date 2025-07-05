import { Bitrix } from "@bitrix/bitrix"
import { BitrixService } from "@bitrix/bitrix.service"
import { TESTING_PLACEMENT } from "../../consts/app-global"
import { Placement } from "@workspace/bx"
import { BitrixOwnerType, IBXCompany, IBXDeal, IBXItem, IBXProduct, IBXProductRowRow } from "@bitrix/index"
import { AlfaBxProductService, BxProductRowWithProduct } from "@/modules/entities/product"
import { BxDealCompanyService } from "./bx-deal-compny.service"
import { BxParticipantService } from "@/modules/entities/participant/lib/hook/service/bx-participant.service"
import { IParticipant } from "@alfa/entities"

// export interface IDealProductRowWithProduct extends IBXProductRowRow {
//     ownerType: BitrixOwnerType;
//     ownerId: string | number;
//     id?: number;
//     ownerTypeId?: string | BitrixOwnerType;
//     price?: number;
//     productId?: number;
//     measureCode?: number | string;
//     measureId?: number | string;
//     product: IBXProduct;
// }

export interface IBitrixinitResult {
    deal: IBXDeal
    company: IBXCompany
    rows: BxProductRowWithProduct[]
    participants: IParticipant[]
}
interface IBitrixinitResponse {
    dealGet: IBXDeal,
    companyGet: IBXCompany
    participants: {
        items: IBXItem[]
    }
}
export class BxInitService {
    private bitrix: BitrixService
    private productService: AlfaBxProductService
    private dealCompanyService: BxDealCompanyService
    private participantService: BxParticipantService
    constructor(

    ) {
        this.bitrix = Bitrix.getService()
        this.productService = new AlfaBxProductService()
        this.dealCompanyService = new BxDealCompanyService()
        this.participantService = new BxParticipantService()
    }

    public async init(): Promise<IBitrixinitResult> {
        const dealId = await this.getDealId()



        this.dealCompanyService.getDealAndCompanyComand(Number(dealId))
        this.participantService.getParticipantsComand(dealId.toString())
        const totalBxResponse = await this.bitrix.api.callBatch() as IBitrixinitResponse
        const { rows } = await this.productService.getDealProductRowsWithProducts(dealId.toString())


        console.log("ROWS WITH PRODUCTS")
        console.log(rows)
        const { company, deal, items } = this.prepare(totalBxResponse)
        const participants = this.participantService.getParticipantsFrommItems(items)
        return { deal, company, rows, participants } as IBitrixinitResult
    }

    private getPlacement() {
        return this.bitrix.api.getPlacement() || TESTING_PLACEMENT as Placement
    }


    private async getDealId(): Promise<number> {
        const placement = this.getPlacement()
        const dealId = 'ID' in placement.options ? placement.options.ID : ('dealId' in placement.options ? placement.options.dealId : null)
        if (!dealId) {
            throw new Error('Deal ID not found in placement options')
        }
        return Number(dealId) as number
    }

    private prepare(totalBxResponse: IBitrixinitResponse): {
        deal: IBXDeal,
        company: IBXCompany,
        items: IBXItem[]
    } {
        const deal = totalBxResponse.dealGet
        const company = totalBxResponse.companyGet
        const items = totalBxResponse.participants.items
        return { deal, company, items }
    }

}
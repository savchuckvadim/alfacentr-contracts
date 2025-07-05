import { Bitrix, IBXCompany, IBXDeal } from "@workspace/bitrix";
import { Placement } from "@workspace/bx";
import { TESTING_PLACEMENT } from "../../consts/app-global";


export const bitrixInit = async (): Promise<{
    deal: IBXDeal
    company: IBXCompany
} | null> => {

    const bitrix = Bitrix.getService()
    const placement = bitrix.api.getPlacement() || TESTING_PLACEMENT as Placement

    const dealId = 'ID' in placement.options ? placement.options.ID : ('dealId' in placement.options ? placement.options.dealId : null)

    if (!dealId) {
        throw new Error('Deal ID not found in placement options')
    }

    const deal = await bitrix.deal.get(dealId as number)
    console.log("TEST DEAL");
    console.log(deal);
    if (!deal) {
        throw new Error('Сделка не найдена')
    }


    if (!deal.COMPANY_ID || !Number(deal.COMPANY_ID)) {
        throw new Error('В сделке нет компании !!!!')
    }



    const companyId = deal.COMPANY_ID
    // const company = await bxAPI.getProtectedMethod(
    //     'crm.company.get',
    //     {
    //         ID: companyId
    //     },
    //     domain,
    //     inBitrix
    // ) as BXCompany | null
    const company = await bitrix.company.get(Number(companyId))
    if (!company) {
        throw new Error('Company not found')
    }
    return {

        deal,
        company
    }
}

export const bitrixBatchInit = async (): Promise<void> => {

    const bitrix = Bitrix.getService()
    const placement = bitrix.api.getPlacement() || TESTING_PLACEMENT as Placement
    const dealId = 'ID' in placement.options ? placement.options.ID : ('dealId' in placement.options ? placement.options.dealId : null)

    if (!dealId) {
        throw new Error('Deal ID not found in placement options')
    }
    bitrix.batch.deal.get(
        'dealGet',
        dealId
    )
    const companyId = `$result[dealGet.COMPANY_ID]`
    bitrix.batch.company.get(
        'companyGet',
        companyId
    )
    const cmdBatch = bitrix.api.getCmdBatch()
    console.log(cmdBatch)
    debugger
    const totalBxResponse = await bitrix.api.callBatch()
    console.log("TOTAL BX RESPONSE")
    console.log(totalBxResponse)

    for (let i = 0; i < 100; i++) {
        bitrix.batch.deal.get(
            'dealGet' + i,
            dealId
        )
    }

    const totalChankBxResponse = await bitrix.api.callBatchByChunk()
    console.log("TOTAL CHANK BX RESPONSE")
    console.log(totalChankBxResponse)


}
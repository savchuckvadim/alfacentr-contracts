import { BXCompany, BXDeal, Placement } from "@workspace/bx"
import { TESTING_DOMAIN, TESTING_PLACEMENT } from "../../consts/app-global"
import { IN_BITRIX } from "../../model/AppThunk"
import { bxAPI } from "@workspace/api";
import { Bitrix } from "@workspace/bitrix";


export const bitrixInit = async (): Promise<{
    deal: BXDeal
    company: BXCompany
} | null> => {

    const inBitrix = IN_BITRIX
    const placement: Placement = inBitrix
        ? await bxAPI.getPlacement() as Placement
        : TESTING_PLACEMENT

    const dealId = placement.options.ID
    const domain = TESTING_DOMAIN
    // const deal = await bxAPI.getProtectedMethod(
    //     'crm.deal.get',
    //     {
    //         id: dealId
    //     },
    //     domain,
    //     inBitrix
    // ) as BXDeal | null
    const bitrix = Bitrix.getService()
    const deal = await bitrix.deal.get(dealId as number)
    console.log("TEST DEAL");
    console.log(deal);
    if (!deal) {
        throw new Error('Сделка не найдена')
    }

    // @ts-ignore
    if (!deal.COMPANY_ID || !Number(deal.COMPANY_ID)) {
        throw new Error('В сделке нет компании !!!!')
    }


    // @ts-ignore
    const companyId = deal.COMPANY_ID
    const company = await bxAPI.getProtectedMethod(
        'crm.company.get',
        {
            ID: companyId
        },
        domain,
        inBitrix
    ) as BXCompany | null

    if (!company) {
        throw new Error('Company not found')
    }
    return {
        // @ts-ignore
        deal,
        company
    }
}

import { BxInitService, IBitrixinitResult } from "../services/bx-init.service";


export const bitrixInit = async (): Promise<IBitrixinitResult> => {

    const bxInitService = new BxInitService()
    const { deal, company, rows, participants } = await bxInitService.init()
    debugger
    return { deal, company, rows, participants }

}


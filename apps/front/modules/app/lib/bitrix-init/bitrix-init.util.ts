
import { BxInitService, IBitrixinitResult } from "../services/bx-init.service";


export const bitrixInit = async (): Promise<IBitrixinitResult> => {

    const bxInitService = new BxInitService()
    const { deal, company, participants } = await bxInitService.init()
    
    return { deal, company, participants }

}


import { BXRQ, EvsRqItem, RQ_TYPE } from "@workspace/bx-rq";
import { BxClientRqService } from "./bx-client-rq.service";
import { PROVIDER_RQ_CONST } from "../../consts/provider-rq.const";
import { DocumentRqAgent } from "../../model/slice/DocumentRqSlice";


export class ContractRqService {
    private clientRqService: BxClientRqService

    constructor(


    ) {
        this.clientRqService = new BxClientRqService();
    }

    public getRqs(

        clientRq: EvsRqItem,
        clientType: RQ_TYPE,


    ): {
        client: DocumentRqAgent<RQ_TYPE.FIZ | RQ_TYPE.ORGANIZATION>

        roles: { provider: string; client: string; providerCase: string; clientCase: string }
    } {


        // const providerRq = this.getProviderData(provider);
        const clientRqData = this.clientRqService.getClientRq(clientRq, clientType);
        const roles = this.getRoles();
        return {
            client: clientRqData,

            roles,
            // we_rq: [
            //     PROVIDER_RQ_CONST.companyName,
            //     PROVIDER_RQ_CONST.inn,
            //     PROVIDER_RQ_CONST.address,
            //     PROVIDER_RQ_CONST.phone,
            //     PROVIDER_RQ_CONST.email,
            //     PROVIDER_RQ_CONST.bank,
            //     PROVIDER_RQ_CONST.bik,
            //     PROVIDER_RQ_CONST.rs,
            //     PROVIDER_RQ_CONST.ks,
            //     PROVIDER_RQ_CONST.providerCompanyDirectorPosition,
            //     PROVIDER_RQ_CONST.providerCompanyDirectorName
            // ],
            // client_rq: clientRqData,
            // we_role: roles.provider,
            // we_role_case: roles.providerCase,
            // we_direct_position: PROVIDER_RQ_CONST.providerCompanyDirectorPosition,

            // we_direct_fio: PROVIDER_RQ_CONST.providerCompanyDirectorName,

            // client_role: roles.client,

            // client_role_case: roles.clientCase,
            // client_direct_position: clientRq.fields.find(field => field.code === 'position')?.value as string || '',
            // client_direct_fio: clientRq.fields.find(field => field.code === 'director')?.value as string || '',
        }


    }


    // private getProviderData(provider: RqEntity) {
    //     const rq = provider;
    //     return {
    //         companyName: rq.fullname,
    //         address: rq.registredAdress,
    //         phone: `тел: ${rq.phone}`,
    //         email: `email: ${rq.email}`,
    //         inn: `ИНН: ${rq.inn}`,
    //         rs: `р/с: ${rq.rs}`,
    //         ks: `к/с: ${rq.ks}`,
    //         bank: rq.bank,
    //         bik: `БИК: ${rq.bik}`,
    //         providerBankAddress: rq.bankAdress,
    //         providerCompanyDirectorPosition: rq.position,
    //         providerCompanyDirectorName: rq.director,
    //     };
    // }

    public getRoles(): { provider: string; client: string; providerCase: string; clientCase: string } {
        let clientRole = 'ЗАКАЗЧИК';
        let providerRole = 'ИСПОЛНИТЕЛЬ';

        // switch (contractType) {
        //     case 'abon':
        //     case 'key':
        //         clientRole = 'Покупатель';
        //         providerRole = 'Поставщик';
        //         break;
        //     case 'lic':
        //         clientRole = 'Лицензиат';
        //         providerRole = 'Лицензиар';
        //         break;
        //     default:
        //         clientRole = 'Заказчик';
        //         providerRole = 'Исполнитель';
        //         break;
        // }

        const providerCase = 'от Исполнителя'
        const clientCase = 'от Заказчика'
        return {
            provider: providerRole,
            client: clientRole,
            providerCase,
            clientCase,
        };
    }

}

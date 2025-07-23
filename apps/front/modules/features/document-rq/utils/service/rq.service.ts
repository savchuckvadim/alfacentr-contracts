import { BXRQ, EvsRqItem, RQ_TYPE } from '@workspace/bx-rq';
import { BxClientRqService } from './bx-client-rq.service';
import { PROVIDER_RQ_CONST } from '../../consts/provider-rq.const';
import { DocumentRqAgent } from '../../model/slice/DocumentRqSlice';

export class ContractRqService {
    private clientRqService: BxClientRqService;

    constructor() {
        this.clientRqService = new BxClientRqService();
    }

    public getRqs(
        clientRq: EvsRqItem,
        clientType: RQ_TYPE,
    ): {
        client: DocumentRqAgent<RQ_TYPE.FIZ | RQ_TYPE.ORGANIZATION>;
        clientShortRq: string;
        roles: {
            provider: string;
            client: string;
            providerCase: string;
            clientCase: string;
        };
    } {
        // const providerRq = this.getProviderData(provider);
        const clientRqData = this.clientRqService.getClientRq(
            clientRq,
            clientType,
        );
        const roles = this.getRoles();
        const clientShortRq = this.getClientShortRq(clientRq, clientType);
        debugger;
        return {
            client: clientRqData,
            clientShortRq,
            roles,

        };
    }

    private getClientShortRq(clientRq: EvsRqItem, clientType: RQ_TYPE): string {
        if (clientType === RQ_TYPE.FIZ) {
            const shortRq = this.clientRqService.prepareClientFizShortRq(clientRq);

            return shortRq;
        } else {
            const shortRq = this.clientRqService.prepareClientOrgShortRq(clientRq);

            return shortRq;
        }
    }

    public getRoles(): {
        provider: string;
        client: string;
        providerCase: string;
        clientCase: string;
    } {
        let clientRole = 'ЗАКАЗЧИК';
        let providerRole = 'ИСПОЛНИТЕЛЬ';



        const providerCase = 'от Исполнителя';
        const clientCase = 'от Заказчика';
        return {
            provider: providerRole,
            client: clientRole,
            providerCase,
            clientCase,
        };
    }
}

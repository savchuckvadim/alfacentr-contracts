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
        clientSignature: string;
        clientCompanyTitle: string;
        clientCompanyShortTitle: string;
        clientDirectorInitials: string;
        clientUpdShortRq: string;
        clientUpdAddress: string;
        clientUpdInnKpp: string;
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
        const clientSignature = this.getClientSignature(clientRq, clientType);
        const clientCompanyTitle = this.getClientCompanyTitle(
            clientRq,
            clientType,
        );
        const clientCompanyShortTitle = this.getClientCompanyShortTitle(
            clientRq,
            clientType,
        );
        const clientDirectorInitials = this.getClientDirectorInitials(
            clientRq,
            clientType,
        );
        const clientUpdShortRq = this.getClientUpdShortRq(clientRq, clientType);
        const clientUpdAddress = this.getClientAddressForShortRq(
            clientRq,
            clientType,
        );
        const clientUpdInnKpp = this.getClientUpdInnKpp(clientRq, clientType);

        return {
            client: clientRqData,
            clientShortRq,
            clientUpdShortRq,
            clientUpdAddress,
            clientSignature,
            clientCompanyTitle,
            clientCompanyShortTitle,
            clientDirectorInitials,
            clientUpdInnKpp,
            roles,
        };
    }

    private getClientShortRq(clientRq: EvsRqItem, clientType: RQ_TYPE): string {
        if (clientType === RQ_TYPE.FIZ) {
            const shortRq =
                this.clientRqService.prepareClientFizShortRq(clientRq);

            return shortRq;
        } else {
            const shortRq =
                this.clientRqService.prepareClientOrgShortRq(clientRq);

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

    private getClientSignature(
        clientRq: EvsRqItem,
        clientType: RQ_TYPE,
    ): string {
        if (clientType === RQ_TYPE.FIZ) {
            return this.clientRqService.prepareClientFizSignature(clientRq);
        } else {
            return this.clientRqService.prepareClientOrgSignature(clientRq);
        }
    }

    private getClientCompanyTitle(
        clientRq: EvsRqItem,
        clientType: RQ_TYPE,
    ): string {
        return this.clientRqService.prepareClientCompanyTitle(
            clientType,
            clientRq,
        );
    }
    private getClientCompanyShortTitle(
        clientRq: EvsRqItem,
        clientType: RQ_TYPE,
    ): string {
        return this.clientRqService.prepareClientCompanyShortTitle(
            clientType,
            clientRq,
        );
    }
    private getClientAddressForShortRq(
        clientRq: EvsRqItem,
        clientType: RQ_TYPE,
    ): string {
        return this.clientRqService.getAdreesForShortRq(clientRq);
    }
    private getClientUpdShortRq(
        clientRq: EvsRqItem,
        clientType: RQ_TYPE,
    ): string {
        const shortCompanyTitle = this.getClientCompanyShortTitle(
            clientRq,
            clientType,
        );
        const innKpp = this.clientRqService.getUpdShortRq(clientType, clientRq);

        const shortUpdRq = `${shortCompanyTitle} ${innKpp}`;
        return shortUpdRq;
    }
    private getClientUpdInnKpp(
        clientRq: EvsRqItem,
        clientType: RQ_TYPE,
    ): string {
        return this.clientRqService.getUpdInnKpp(clientType, clientRq);
    }

    private getClientDirectorInitials(
        clientRq: EvsRqItem,
        clientType: RQ_TYPE,
    ): string {
        if (clientType === RQ_TYPE.FIZ) {
            return this.clientRqService.prepareClientFizDirectorInitials(
                clientRq,
            );
        } else {
            return this.clientRqService.prepareClientOrgDirectorInitials(
                clientRq,
            );
        }
    }
}

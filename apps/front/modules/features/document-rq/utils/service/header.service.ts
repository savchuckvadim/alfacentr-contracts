// import RussianNounsJS, { createLemma } from 'russian-nouns-js';
import { incline } from 'lvovich';
import { FioT } from "lvovich/lib/gender";
import { EvsRqItem, RQ_TYPE } from "@workspace/bx-rq";
import { ContractRqService } from "./rq.service";
import { Provider } from '../../consts/provider-rq.const';


export class ContractRqHeaderService {


    constructor(
        private readonly rqService: ContractRqService
    ) {



    }

    public getContractHeaderText(clientType: RQ_TYPE, clientRq: EvsRqItem | null) {
        const roles = this.rqService.getRoles();
        const providerRole = roles.provider;
        const clientRole = roles.client;

        const providerType = Provider.type;
        const providerCompanyFullName = Provider.fullname;
        const providerCompanyDirectorName = Provider.director;
        const providerCompanyDirectorPosition = Provider.providerCompanyDirectorPosition || 'Директор';
        const providerCompanyDirectorNameCase = Provider.directorCase;
        const providerCompanyDirectorPositionCase = 'Директора';
        const providerCompanyBased = Provider.based;

        let clientCompanyFullName = ' __________________________________________________________ ';
        let clientCompanyDirectorNameCase = '____________________________________________________';
        let clientCompanyDirectorPositionCase = '______________________________________________';
        let clientCompanyBased = 'Устава';

        if (clientRq?.fields) {
            for (const rqItem of clientRq.fields) {
                if (rqItem.value) {
                    if (rqItem.code === 'fullname' && (clientType === 'ip' || clientType === 'org' || clientType === 'org_state')) {
                        clientCompanyFullName = rqItem.value as string;
                    } else if (rqItem.code === 'personName' && clientType === 'fiz') {
                        clientCompanyFullName = rqItem.value as string;
                    } else if (rqItem.code === 'position_case') {
                        clientCompanyDirectorPositionCase = rqItem.value as string;
                    } else if (rqItem.code === 'director_case') {
                        clientCompanyDirectorNameCase = rqItem.value as string;
                    } else if (rqItem.code === 'based') {
                        clientCompanyBased = rqItem.value as string;
                    }
                }
            }
        }

        let headerText = `${providerCompanyFullName} , официальный партнер компании "Гарант", именуемый в дальнейшем "${providerRole}`;

        if (providerType === 'org' || providerType === 'org_state') {
            headerText += `, в лице ${providerCompanyDirectorPositionCase} ${providerCompanyDirectorNameCase}, действующего(-ей) на основании ${providerCompanyBased}`;
        }

        headerText += ` с одной стороны и ${clientCompanyFullName}, именуемое(-ый) в дальнейшем "${clientRole}`;

        if (clientType === 'org' || clientType === 'org_state') {
            headerText += `, в лице ${clientCompanyDirectorPositionCase} ${clientCompanyDirectorNameCase}, действующего(-ей) на основании ${clientCompanyBased}`;
        }

        if (clientType === 'ip') {
            headerText += `, действующего(-ей) на основании ${clientCompanyBased}`;
        }

        headerText += ' с другой стороны, заключили настоящий Договор о нижеследующем:';

        return headerText;
    }


    private inflectName(fio: string,): string {
        const fioParts = this.splitFullName(fio);
        // const gender = getGender(fioParts);
        const inflectedName = incline(fioParts, 'genitive');

        return ` ${inflectedName.last} ${inflectedName.first} ${inflectedName.middle}`;
    }
    private inflectNoun(noun: string,): string {
        // const lemma = createLemma({ text: noun, gender: this.Gender.MASCULINE });
        // const result = this.rne.decline(lemma, this.Case.GENITIVE);
        // return result[0];
        return noun;
    }
    private splitFullName(fullName: string): FioT {
        const parts = fullName.trim().split(/\s+/);
        return {
            last: parts[0] || null,
            first: parts[1] || null,
            middle: parts[2] || null,
        };
    }
    // private getNounCase(noun: string, case_: string): string {
    //     // TODO: Implement noun case logic
    //     return noun;
    // }

}


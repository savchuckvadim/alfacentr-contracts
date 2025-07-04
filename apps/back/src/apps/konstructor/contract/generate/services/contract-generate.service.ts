import { Injectable } from "@nestjs/common";
import { ContractGenerateDto } from "../dto/contract-generate.dto";
import { StorageService, StorageType } from "src/core/storage";
import { FileLinkService } from "src/core/file-link/file-link.service";
import { ConfigService } from "@nestjs/config";

import fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import dayjs from "dayjs";
import 'dayjs/locale/ru';
import localizedFormat from "dayjs/plugin/localizedFormat";
import { ProviderService, RqEntity } from "../../../../../modules/portal-konstructor/provider";

import { ContractGenerateTemplateProps } from "../type/contract-generate.type";
import { ContractRqHeaderService } from "./contract-rq-header.service";
import { ContractRqService } from "./contract-rq.service";


@Injectable()
export class ContractGenerateService {
    private readonly baseUrl: string;
    private currentYear: string;





    constructor(

        private readonly storage: StorageService,
        private readonly fileLinkService: FileLinkService,
        private readonly configService: ConfigService,
        private readonly providerService: ProviderService,


        private readonly headerService: ContractRqHeaderService,
        private readonly rqService: ContractRqService,
    ) {
        dayjs.extend(localizedFormat);
        dayjs.locale('ru');
        this.currentYear = dayjs().format('YYYY');

        this.baseUrl = this.configService.get('APP_URL') as string;


    }

    async generateContract(dto: ContractGenerateDto):
        Promise<{
            link: string,
           
            data: ContractGenerateTemplateProps,
            provider: RqEntity
        }> {
        const provider = await this.providerService.findById(dto.providerId);
        if (!provider) {
            throw new Error('Provider not found');
        }


        const resultPath = this.getDocumentPath(dto.domain, dto.userId);
        const doc = this.getDoc();


   

        const data = await this.prepareDocumentData(dto, provider);

        const { rootLink } = await this.saveDoc(doc, dto, 'documentName', resultPath, data);


        const link = `${this.baseUrl}${rootLink}`;


        return {
            link,
            data,
       
            provider
        };
    }

    private getDoc(): Docxtemplater {
        const templatePath = this.storage.getFilePath(StorageType.APP, 'konstructor/templates/contract', 'template.docx');
        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
        return doc;
    }
    private async saveDoc(
        doc: Docxtemplater,
        dto: ContractGenerateDto,
        documentName: string,
        resultPath: string,
        data: ContractGenerateTemplateProps
    ) {
        try {
            doc.render(data);
        } catch (error) {
            throw new Error(`Docx render error: ${error}`);
        }

        const buf = doc.toBuffer();
        await this.storage.saveFile(buf, documentName, StorageType.PUBLIC, resultPath);
        const rootLink = await this.fileLinkService.createPublicLink(dto.domain, dto.userId, 'konstructor', 'contract', this.currentYear, `${documentName}`);
        return { rootLink };
    }
    private getDocumentPath(domain: string, userId: string | number) {
        return `konstructor/contract/${this.currentYear}/${domain}/${userId}`;
    }
    private async getDocumentName(name: string, number: string | undefined, resultPath: string) {
        const { documentCount } = await this.getDocumentCount(resultPath);
        if (number) {
            return `Договор ${name}-${number}-${documentCount}.docx`;
        } else {
            return `Договор ${name}-${documentCount}.docx`;
        }
    }

    private formatDocumentDate(date: string): string {
        const formattedDate = dayjs(date).format('D MMMM YYYY [г.]');
        return formattedDate;
    }

    private async getDocumentCount(resultPath: string): Promise<{ documentCount: number }> {
        const filesCount = await this.storage.countFilesInDirectory(StorageType.PUBLIC, resultPath);
        const documentCount = filesCount + 1;
        return { documentCount };
    }

    private async prepareDocumentData(dto: ContractGenerateDto, provider: RqEntity): Promise<ContractGenerateTemplateProps> {

        // const recipientData = this.getRecipientData(dto.recipient);
        const contractData = this.getContractData(dto.contract);
        // const supplyData = this.getSupplyData(dto.supply);
        // const totalData = this.totalRowService.getContractData(dto.total, this.clientType);

        const contractStart = dto.contractStart && this.formatDocumentDate(dto.contractStart) || "________________________________";
        const contractEnd = dto.contractEnd && this.formatDocumentDate(dto.contractEnd) || "________________________________";
        const contractNumber = dto.contractNumber || "________________________________";
        const contractCreateDate = dto.contractCreateDate && this.formatDocumentDate(dto.contractCreateDate) || "________________________________";


        const headerText = this.headerService.getContractHeaderText(dto.contractType, dto.clientType, dto.bxrq, provider as RqEntity);
        const rqs = this.rqService.getRqs(
            provider,
            dto.bxrq,
            dto.clientType,
            dto.contractType
        );



        return {
            ...rqs,
            contract_number: contractNumber,
            contract_date: contractCreateDate,
            header: headerText,
            contract_start: contractStart,
            contract_end: contractEnd,
         
            contract_pay_date: dto.firstPayDate || '________________________________',
        
        } as ContractGenerateTemplateProps;
    }
















    // private getRecipientData(recipient: any) {
    //     return {
    //         recipientName: recipient.recipient,
    //         recipientNameCase: recipient.recipientCase,
    //         positionCase: recipient.positionCase,
    //         recipientCompanyName: recipient.companyName,
    //         recipientCompanyAdress: recipient.companyAdress,
    //         recipientInn: recipient.inn,
    //     };
    // }

    private getContractData(contract: any) {
        const generalContract = contract.contract;
        return {
            contractName: generalContract.name,
            contractCode: contract.code,
            contractNumber: contract.number,
            contractPrepayment: contract.prepayment,
            contractDiscount: contract.discount,
            contractProductName: generalContract.productName,
        };
    }

    private getSupplyData(supply: any) {
        return {
            supplyName: supply.name,
            supplyType: supply.type,
            supplyQuantity: supply.contractPropSuppliesQuantity,
            supplyComment: supply.contractPropComment,
            supplyEmail: supply.contractPropEmail,
        };
    }

    // private getTotalData(total: any) {
    //     const price = total.price;
    //     return {
    //         totalProductName: total.name,
    //         totalSupplyName: total.currentSupply.name,
    //         totalSupplyFullName: total.currentSupply.quantityForKp,
    //         totalSumMonth: Number((price.month / total.product.contractCoefficient).toFixed(2)),
    //         totalSum: Number((price.sum / total.product.contractCoefficient).toFixed(2)),
    //         totalQuantity: Number((price.quantity * total.product.contractCoefficient).toFixed(2)),
    //         totalMeasure: 'мес.',
    //     };
    // }

    // private getContractPeriod(contractStart: string, contractEnd: string) {
    //     const contractStartFormatted = contractStart ? dayjs(contractStart).format('D MMMM YYYY [г.]') : '___________________________________';
    //     const contractEndFormatted = contractEnd ? dayjs(contractEnd).format('D MMMM YYYY [г.]') : '___________________________________';
    //     return `c ${contractStartFormatted} по ${contractEndFormatted}`;
    // }




}


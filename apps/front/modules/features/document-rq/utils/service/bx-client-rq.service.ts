import {
    EvsRqItem, RQ_TYPE, RQ_ITEM_CODE,
    BX_ADDRESS_TYPE,
    ADDRESS_RQ_ITEM_CODE
} from "@workspace/bx-rq";
import { DocumentRqAgent } from "../../model/slice/DocumentRqSlice";

export class BxClientRqService {

    public getClientRq(clientRq: EvsRqItem, clientType: RQ_TYPE): DocumentRqAgent {
   
     

        if (clientType === RQ_TYPE.FIZ) {
            return this.prepareClientFizRq(clientRq);
        } else {
            return this.prepareClientOrgRq(clientRq);
        }
       
    }

    private prepareClientFizRq(clientRq: EvsRqItem): DocumentRqAgent {
        const result: DocumentRqAgent = {
            id: 0,
            name: '',
            based: '',
            documentType: '',
            docSeries: '',
            docNumber: '',
            docDate: '',
            depCode: '',

            inn: '',
            kpp: '',
            other: '',
            address: '',
            bank: '',
            phone: '',
            email: '',
            type: RQ_TYPE.FIZ
        };
        let fullname = '________________________________________';
        let inn = '________________________________________';

        fullname = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.PERSON_NAME)?.value as string || fullname;



        const innValue = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.INN)?.value;

        inn = `ИНН: ${innValue || inn}`;
        result.inn = inn;

        let documentType = '_____________________________';
        const documentTypeValue = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.DOCUMENT)?.value as string;
        documentType = documentTypeValue ? documentTypeValue : `Документ: ${documentType}`;
        result.documentType = documentType;
        let docSeries = '_____________________________';
        const docSeriesValue = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.DOCUMENT_SERIES)?.value;
        docSeries = `Серия: ${docSeriesValue || docSeries}`;
        result.docSeries = docSeries;
        let docNumber = '_____________________________';
        const docNumberValue = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.DOCUMENT_NUMBER)?.value;
        docNumber = `Номер: ${docNumberValue || docNumber}`;
        result.docNumber = docNumber;
        let docDate = '_____________________________';
        const docDateValue = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.DOCUMENT_DATE)?.value;
        docDate = `Документ выдан: ${docDate || docDate}`;
        const issuedByValue = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.ISSUED_BY)?.value;
        docDate = issuedByValue ? `${docDate}, ${issuedByValue}` : docDate;
        result.docDate = docDate;
        let depCode = '_____________________________';
        const depCodeValue = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.DEPARTMENT_CODE)?.value;
        depCode = `Код подразделения: ${depCodeValue || depCode}`;
        result.depCode = depCode;
        let phone = '_____________________________';
        const phoneValue = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.PHONE)?.value;
        phone = `Телефон: ${phoneValue || phone}`;
        result.phone = phone;
        let address = this.getAddressString(clientRq);
        result.address = address;
        return result;
    }

    private prepareClientOrgRq(clientRq: EvsRqItem): DocumentRqAgent {
        const result: DocumentRqAgent = {
            id: 0,
            name: '',
            based: '',
            fullname: '',
            shortName: '',
            director: '',
            directorCase: '',
            gb: '',

            inn: '',
            kpp: '',
            other: '',
            address: '',
            bank: '',
            phone: '',
            email: '',
            type: RQ_TYPE.ORGANIZATION
        };
        let fullname = '________________________________________';
        let inn = '________________________________________';

        fullname = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.FULLNAME)?.value as string || fullname;



        const innValue = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.INN)?.value;

        inn = `ИНН: ${innValue || inn}`;
        result.inn = inn;

        let based = '_____________________________';
        const basedValue = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.BASED)?.value as string;
        based = basedValue ? basedValue : `${based}` || 'Устава';
        result.based = based;
        let shortName = '_____________________________';
        const shortNameValue = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.SHORTNAME)?.value as string;
        shortName = shortNameValue ? shortNameValue : `${shortName}`;
        result.shortName = shortName;
        let director = '_____________________________';
        const directorValue = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.DIRECTOR_NAME)?.value as string;
        director = directorValue ? directorValue : `${director}`;
        result.director = director;
        let directorCase = '_____________________________';
        const directorCaseValue = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.DIRECTOR_CASE)?.value as string;
        directorCase = directorCaseValue ? directorCaseValue : `${directorCase}`;
        result.directorCase = directorCase;
       

        let gb = '_____________________________';
        const gbValue = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.ACCOUNTANT)?.value as string;
        gb = gbValue ? gbValue : `${gb}`;
        result.gb = gb;






        let phone = '_____________________________';
        const phoneValue = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.PHONE)?.value;
        phone = `Телефон: ${phoneValue || phone}`;
        result.phone = phone;
        let address = this.getAddressString(clientRq);
        result.address = address;
        return result;
    }



    private getAddressString(clientRq: EvsRqItem): string {
        let address = '';
        clientRq.address.items.forEach(addresType => {
            if (addresType.anchor_id === BX_ADDRESS_TYPE.REGISTERED) {
                addresType.fields.forEach(field => {
                    if (field.code === ADDRESS_RQ_ITEM_CODE.ADDRESS_POSTAL_CODE) {
                        address += field.value + ', ';
                    } else {
                        address += field.value + ', ';
                    }
                })
            }
        })
        return address || 'Адрес: ________________________________________';
    }
}


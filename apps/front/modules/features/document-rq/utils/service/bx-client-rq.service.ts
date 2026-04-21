import {
    EvsRqItem,
    RQ_TYPE,
    RQ_ITEM_CODE,
    BX_ADDRESS_TYPE,
    ADDRESS_RQ_ITEM_CODE,
    BANK_RQ_ITEM_CODE,
    BankRqItem,
} from '@workspace/bx-rq';
import { DocumentRqAgent } from '../../model/slice/DocumentRqSlice';
import {
    EnumFizRqFields,
    EnumOrganizationRqFields,
} from '../../type/document-rq.type';
import { FioT } from 'lvovich/lib/gender';

export class BxClientRqService {
    public getClientRq(
        clientRq: EvsRqItem,
        clientType: RQ_TYPE,
    ): DocumentRqAgent<RQ_TYPE.FIZ | RQ_TYPE.ORGANIZATION> {
        if (clientType === RQ_TYPE.FIZ) {
            return this.prepareClientFizRq(clientRq);
        } else {
            return this.prepareClientOrgRq(clientRq);
        }
    }

    private prepareClientFizRq(
        clientRq: EvsRqItem,
    ): DocumentRqAgent<RQ_TYPE.FIZ> {
        const result: DocumentRqAgent<RQ_TYPE.FIZ> = {
            [EnumFizRqFields.NAME]: '',
            [EnumFizRqFields.BASED]: '',
            [EnumFizRqFields.DOCUMENT_TYPE]: '',
            [EnumFizRqFields.DOC_SERIES]: '',
            [EnumFizRqFields.DOC_NUMBER]: '',
            [EnumFizRqFields.DOC_DATE]: '',
            [EnumFizRqFields.DEP_CODE]: '',

            [EnumFizRqFields.INN]: '',

            [EnumFizRqFields.OTHER]: '',
            [EnumFizRqFields.BASE_OTHER]: '',
            [EnumFizRqFields.ADDRESS]: '',
            [EnumFizRqFields.PRIMARY_ADDRESS]: '',
            [EnumFizRqFields.BANK]: '',
            [EnumFizRqFields.PHONE]: '',
            [EnumFizRqFields.EMAIL]: '',
            [EnumFizRqFields.TYPE]: RQ_TYPE.FIZ,
        } as DocumentRqAgent<RQ_TYPE.FIZ>;
        let fullname = '________________________________________';
        let inn = '________________________________________';

        fullname =
            (clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.PERSON_NAME)
                ?.value as string) || fullname;
        result.name = fullname;

        const innValue = clientRq.fields.find(
            fld => fld.code === RQ_ITEM_CODE.INN,
        )?.value;

        inn = `ИНН: ${innValue || inn}`;
        result.inn = inn;

        let documentType = '_____________________________';
        const documentTypeValue = clientRq.fields.find(
            fld => fld.code === RQ_ITEM_CODE.DOCUMENT,
        )?.value as string;
        documentType = documentTypeValue
            ? documentTypeValue
            : `Документ: ${documentType}`;
        result.documentType = documentType;
        let docSeries = '_____________________________';
        const docSeriesValue = clientRq.fields.find(
            fld => fld.code === RQ_ITEM_CODE.DOCUMENT_SERIES,
        )?.value;
        docSeries = `Серия: ${docSeriesValue || docSeries}`;
        result.docSeries = docSeries;
        let docNumber = '_____________________________';
        const docNumberValue = clientRq.fields.find(
            fld => fld.code === RQ_ITEM_CODE.DOCUMENT_NUMBER,
        )?.value;
        docNumber = `Номер: ${docNumberValue || docNumber}`;
        result.docNumber = docNumber;
        let docDate = '_____________________________';
        const docDateValue = clientRq.fields.find(
            fld => fld.code === RQ_ITEM_CODE.DOCUMENT_DATE,
        )?.value;


        docDate = `Документ выдан: ${docDateValue || docDate}`;


        const issuedByValue = clientRq.fields.find(
            fld => fld.code === RQ_ITEM_CODE.ISSUED_BY,
        )?.value;
        docDate = issuedByValue ? `${docDate}, ${issuedByValue}` : docDate;
        result.docDate = docDate;
        let depCode = '_____________________________';
        const depCodeValue = clientRq.fields.find(
            fld => fld.code === RQ_ITEM_CODE.DEPARTMENT_CODE,
        )?.value;
        depCode = `Код подразделения: ${depCodeValue || depCode}`;
        result.depCode = depCode;


        let phone = '_____________________________';
        const phoneValue = clientRq.fields.find(
            fld => fld.code === RQ_ITEM_CODE.PHONE,
        )?.value;
        phone = `Телефон: ${phoneValue || phone}`;
        result.phone = phone;
        let baseOther = '';
        const baseOtherValue = this.findFieldByCode(
            clientRq,
            RQ_ITEM_CODE.BASE_OTHER,
        );
        baseOther = baseOtherValue ? baseOtherValue : `${baseOther}`;
        result.base_other = baseOther;

        let address = this.getAddressString(
            clientRq,
            BX_ADDRESS_TYPE.REGISTERED,
            RQ_TYPE.FIZ,
        );
        const primaryAddress = this.getAddressString(
            clientRq,
            BX_ADDRESS_TYPE.PRIMARY,
            RQ_TYPE.FIZ,
        );

        // result.primaryAddress = primaryAddress;
        result.address = address;


        const { bankComments } = this.getBankRqs(clientRq.bank.current || null);
        result.other = bankComments;
        return result;
    }

    private prepareClientOrgRq(
        clientRq: EvsRqItem,
    ): DocumentRqAgent<RQ_TYPE.ORGANIZATION> {
        const result: DocumentRqAgent<RQ_TYPE.ORGANIZATION> = {
            [EnumOrganizationRqFields.NAME]: '',
            [EnumOrganizationRqFields.BASED]: '',
            [EnumOrganizationRqFields.FULLNAME]: '',
            [EnumOrganizationRqFields.SHORTNAME]: '',
            [EnumOrganizationRqFields.PRIMARY_ADDRESS]: '',
            [EnumOrganizationRqFields.DIRECTOR_NAME]: '',
            [EnumOrganizationRqFields.DIRECTOR_CASE]: '',
            [EnumOrganizationRqFields.DIRECTOR_FIO]: '',
            [EnumOrganizationRqFields.DIRECTOR_POSITION]: '',
            [EnumOrganizationRqFields.DIRECTOR_POSITION_CASE]: '',
            [EnumOrganizationRqFields.ACCOUNTANT]: '',

            [EnumOrganizationRqFields.INN]: '',
            [EnumOrganizationRqFields.KPP]: '',
            [EnumOrganizationRqFields.OTHER]: '',
            [EnumOrganizationRqFields.BASE_OTHER]: '',
            [EnumOrganizationRqFields.ADDRESS]: '',
            [EnumOrganizationRqFields.BANK]: '',
            [EnumOrganizationRqFields.PHONE]: '',
            [EnumOrganizationRqFields.EMAIL]: '',
            [EnumOrganizationRqFields.RS]: '',
            [EnumOrganizationRqFields.KS]: '',
            [EnumOrganizationRqFields.BIK]: '',
            [EnumOrganizationRqFields.OGRN]: '',
            [EnumOrganizationRqFields.EDO]: '',
            [EnumOrganizationRqFields.SBIS_ID]: '',
            [EnumOrganizationRqFields.BANK_ADDRESS]: '',

            [EnumOrganizationRqFields.TYPE]: RQ_TYPE.ORGANIZATION,
        };
        let fullname = '________________________________________';
        let inn = '________________________________________';
        let kpp = '________________________________________';
        fullname =
            this.findFieldByCode(clientRq, RQ_ITEM_CODE.FULLNAME) || fullname;
        result.fullname = fullname;

        const innValue = this.findFieldByCode(clientRq, RQ_ITEM_CODE.INN);

        inn = `ИНН: ${innValue || inn}`;
        result.inn = inn;

        const kppValue = this.findFieldByCode(clientRq, RQ_ITEM_CODE.KPP);
        kpp = `КПП: ${kppValue || kpp}`;
        result.kpp = kpp;

        let based = '_____________________________';
        const basedValue = this.findFieldByCode(clientRq, RQ_ITEM_CODE.BASED);
        based = basedValue ? basedValue : `${based}` || 'Устава';
        result.based = based;
        let shortName = '_____________________________';
        const shortNameValue = this.findFieldByCode(
            clientRq,
            RQ_ITEM_CODE.SHORTNAME,
        );
        shortName = shortNameValue ? shortNameValue : `${shortName}`;
        result.shortName = shortName;
        let director = '_____________________________';
        const directorValue = this.findFieldByCode(
            clientRq,
            RQ_ITEM_CODE.DIRECTOR_NAME,
        );
        director = directorValue ? directorValue : `${director}`;
        result.director = director;
        let directorCase = '_____________________________';
        const directorCaseValue = this.findFieldByCode(
            clientRq,
            RQ_ITEM_CODE.DIRECTOR_CASE,
        );
        directorCase = directorCaseValue
            ? directorCaseValue
            : `${directorCase}`;
        result.directorCase = directorCase;

        // let rs = 'р/с: _____________________________';
        // const rsValue = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.RS)?.value as string;
        // rs = rsValue ? rsValue : `${rs}`;
        // result.rs = rs;

        // let ks = 'к/с: _____________________________';
        // const ksValue = clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.KS)?.value as string;
        // ks = ksValue ? ksValue : `${ks}`;
        let gb = '_____________________________';
        const gbValue = clientRq.fields.find(
            fld => fld.code === RQ_ITEM_CODE.ACCOUNTANT,
        )?.value as string;
        gb = gbValue ? gbValue : `${gb}`;
        result.accountant = gb;

        let phone = '_____________________________';
        const phoneValue = clientRq.fields.find(
            fld => fld.code === RQ_ITEM_CODE.PHONE,
        )?.value;
        phone = `Телефон: ${phoneValue || phone}`;
        result.phone = phone;
        let address = this.getAddressString(
            clientRq,
            BX_ADDRESS_TYPE.REGISTERED,
            RQ_TYPE.ORGANIZATION,
        );
        result.address = address;

        let baseOther = '';
        const baseOtherValue = this.findFieldByCode(
            clientRq,
            RQ_ITEM_CODE.BASE_OTHER,
        );

        baseOther = baseOtherValue ? baseOtherValue : `${baseOther}`;
        result.base_other = baseOther;

        const { bankComments } = this.getBankRqs(clientRq.bank.current || null);
        result.other = bankComments;
        //Почтовый адрес не добавляем в результат
        // const primaryAddress = this.getAddressString(
        //     clientRq,
        //     BX_ADDRESS_TYPE.PRIMARY,
        //     RQ_TYPE.ORGANIZATION,
        // );

        // result.primaryAddress = primaryAddress;
        //Банковские реквизиты не добавляем в результат
        const bankRq = this.getBankRqStrings(clientRq.bank.current || null);

        const withBankResult = {
            ...result,

        };
        return withBankResult;
    }

    public prepareClientOrgShortRq(clientRq: EvsRqItem): string {
        // const shortRqCodes: EnumOrganizationRqFields[] = [
        //     EnumOrganizationRqFields.NAME,
        //     EnumOrganizationRqFields.FULLNAME,
        //     EnumOrganizationRqFields.INN,
        //     EnumOrganizationRqFields.KPP,
        //     EnumOrganizationRqFields.PRIMARY_ADDRESS,
        //     EnumOrganizationRqFields.DIRECTOR_NAME,
        //     EnumOrganizationRqFields.DIRECTOR_FIO,
        //     EnumOrganizationRqFields.DIRECTOR_POSITION,
        // ];

        let result: string = '';

        let fullnameResult =
            'Наименование: _________________________________________';
        let innResult = 'ИНН: ________________________________________';
        let kppResult = 'КПП: ________________________________________';

        const fullnameValue = this.findFieldByCode(
            clientRq,
            RQ_ITEM_CODE.FULLNAME,
        );
        if (fullnameValue) {
            fullnameResult = fullnameValue;
        } else {
            const nameValue = this.findFieldByCode(
                clientRq,
                RQ_ITEM_CODE.SHORTNAME,
            );
            if (nameValue) {
                fullnameResult = nameValue;
            }
        }

        const innValue = this.findFieldByCode(clientRq, RQ_ITEM_CODE.INN);

        innResult = innValue ? `ИНН: ${innValue}` : `${innResult}`;

        const kppValue = this.findFieldByCode(clientRq, RQ_ITEM_CODE.KPP);
        kppResult = kppValue ? `КПП: ${kppValue}` : `${kppResult}`;

        let addressResult = 'Адрес: ________________________________________';
        let registredAdress = this.getAddressString(
            clientRq,
            BX_ADDRESS_TYPE.REGISTERED,
            RQ_TYPE.ORGANIZATION,
            true,
        );
        const primaryAddress = this.getAddressString(
            clientRq,
            BX_ADDRESS_TYPE.PRIMARY,
            RQ_TYPE.ORGANIZATION,
            true,
        );

        addressResult = registredAdress
            ? `Адрес: ${registredAdress}`
            : primaryAddress
                ? `Адрес: ${primaryAddress}`
                : `${addressResult}`;

        result = `${fullnameResult} ${innResult} ${kppResult} ${addressResult}`;
        return result;
    }
    public prepareClientFizShortRq(clientRq: EvsRqItem): string {
        // const result: EnumFizRqFields[] = [
        //     EnumFizRqFields.NAME,

        //     EnumFizRqFields.DOCUMENT_TYPE,
        //     EnumFizRqFields.DOC_SERIES,
        //     EnumFizRqFields.DOC_NUMBER,
        //     EnumFizRqFields.DOC_DATE,
        //     EnumFizRqFields.DEP_CODE,

        //     EnumFizRqFields.INN,

        //     EnumFizRqFields.OTHER,
        //     EnumFizRqFields.ADDRESS,
        //     EnumFizRqFields.PRIMARY_ADDRESS,
        // ];
        let fullname = '________________________________________';
        let inn = '';

        fullname =
            (clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.PERSON_NAME)
                ?.value as string) || fullname;

        const innValue = clientRq.fields.find(
            fld => fld.code === RQ_ITEM_CODE.INN,
        )?.value;

        inn = innValue ? `ИНН: ${innValue}` : ``;

        let documentType = 'Документ: _____________________________';
        const documentTypeValue = clientRq.fields.find(
            fld => fld.code === RQ_ITEM_CODE.DOCUMENT,
        )?.value as string;
        documentType = documentTypeValue
            ? documentTypeValue
            : `Документ: ${documentType}`;

        let docSeries = '_____________________________';
        const docSeriesValue = clientRq.fields.find(
            fld => fld.code === RQ_ITEM_CODE.DOCUMENT_SERIES,
        )?.value;
        docSeries = `Серия: ${docSeriesValue || docSeries}`;

        let docNumber = '_____________________________';
        const docNumberValue = clientRq.fields.find(
            fld => fld.code === RQ_ITEM_CODE.DOCUMENT_NUMBER,
        )?.value;
        docNumber = `Номер: ${docNumberValue || docNumber}`;

        let docDate = '_____________________________';
        const docDateValue = clientRq.fields.find(
            fld => fld.code === RQ_ITEM_CODE.DOCUMENT_DATE,
        )?.value;
        if (docDateValue) {
            docDate = `Документ выдан: ${docDateValue}`;
        } else {
            docDate = `Документ выдан: ${docDate}`;
        }
        const issuedByValue = clientRq.fields.find(
            fld => fld.code === RQ_ITEM_CODE.ISSUED_BY,
        )?.value;
        docDate = issuedByValue ? `${docDate}, ${issuedByValue}` : docDate;

        let depCode = '_____________________________';
        const depCodeValue = clientRq.fields.find(
            fld => fld.code === RQ_ITEM_CODE.DEPARTMENT_CODE,
        )?.value;
        depCode = `Код подразделения: ${depCodeValue || depCode}`;



        let addressResult = 'Адрес: ________________________________________';
        let address = this.getAddressString(
            clientRq,
            BX_ADDRESS_TYPE.REGISTERED,
            RQ_TYPE.FIZ,
            true,
        );
        const primaryAddress = this.getAddressString(
            clientRq,
            BX_ADDRESS_TYPE.PRIMARY,
            RQ_TYPE.FIZ,
            true,
        );

        addressResult = primaryAddress
            ? `Адрес: ${primaryAddress}`
            : address
                ? `Адрес: ${address}`
                : `${addressResult}`;
        // return `${fullname} ${documentType} ${docSeries} ${docNumber} ${docDate} ${depCode} ${inn} ${addressResult}`;
        return `${fullname}`;
    }
    private findFieldByCode(clientRq: EvsRqItem, code: RQ_ITEM_CODE) {
        if (code === RQ_ITEM_CODE.BASE_OTHER) {

        }
        return clientRq.fields.find(fld => fld.code === code)?.value as string;
    }

    private getAddressString(
        clientRq: EvsRqItem,
        type: BX_ADDRESS_TYPE.REGISTERED | BX_ADDRESS_TYPE.PRIMARY,
        clientType: RQ_TYPE.FIZ | RQ_TYPE.ORGANIZATION,
        isClean: boolean = false,
    ): string {
        let address = '';
        const space = '________________________________________';
        clientRq.address.items.forEach(addresType => {
            if (addresType.type_id === type) {
                addresType.fields.forEach((field, index) => {
                    if (field.value) {
                        if (
                            field.code ===
                            ADDRESS_RQ_ITEM_CODE.ADDRESS_POSTAL_CODE
                        ) {
                            address += field.value;
                        } else {
                            address += field.value;
                        }

                        if (index < addresType.fields.length - 1) {
                            address += ', ';
                        }
                    }
                });
            }
        });
        let addressType = '';
        if (clientType === RQ_TYPE.FIZ) {
            if (type === BX_ADDRESS_TYPE.REGISTERED) {
                addressType = 'Адрес регистрации';
            } else {
                addressType = 'Почтовый адрес';
            }
        } else {
            if (type === BX_ADDRESS_TYPE.REGISTERED) {
                addressType = 'Юридический адрес';
            } else {
                addressType = 'Почтовый адрес';
            }
        }

        if (isClean) {
            return `${address}` || space;
        } else {
            return address
                ? `${addressType}: ${address}`
                : `${addressType}: ${space}`;
        }
    }

    private getBankRqs(bankRq: BankRqItem | null) {
        if (!bankRq) {
            return {
                bankName: '',
                bankBik: '',
                bankPc: '',
                bankKc: '',
                bankComments: '',
                bankAddress: '',
            };
        }
        const bank = bankRq;
        const bankName = this.findBankFieldByCode(
            bank,
            BANK_RQ_ITEM_CODE.BANK_NAME,
        );
        const bankBik = this.findBankFieldByCode(
            bank,
            BANK_RQ_ITEM_CODE.BANK_BIK,
        );
        const bankPc = this.findBankFieldByCode(
            bank,
            BANK_RQ_ITEM_CODE.BANK_PC,
        );
        const bankKc = this.findBankFieldByCode(
            bank,
            BANK_RQ_ITEM_CODE.BANK_KC,
        );
        const bankComments = this.findBankFieldByCode(
            bank,
            BANK_RQ_ITEM_CODE.BANK_COMMENTS,
        );
        const bankAddress = this.findBankFieldByCode(
            bank,
            BANK_RQ_ITEM_CODE.BANK_ADDRESS,
        );
        return {
            bankName: bankName,
            bankBik: bankBik,
            bankPc: bankPc,
            bankKc: bankKc,
            bankComments: bankComments,
            bankAddress: bankAddress,
        };
    }
    private getBankRqStrings(bank: BankRqItem | null) {
        const { bankName, bankBik, bankPc, bankKc, bankComments, bankAddress } =
            this.getBankRqs(bank);
        let bankNameString = '_____________________________';
        bankNameString = `в Банке: ${bankName ? bankName : `${bankNameString}`}`;
        if (bankAddress) {
            bankNameString += `, ${bankAddress}`;
        }
        let bankBikString = '_____________________________';
        bankBikString = `БИК: ${bankBik ? bankBik : `${bankBikString}`}`;

        bankNameString += `, ${bankBikString}`;

        let bankPcString = '_____________________________';
        bankPcString = `р/с: ${bankPc ? bankPc : `${bankPcString}`}`;
        let bankKcString = '_____________________________';
        bankKcString = `к/с: ${bankKc ? bankKc : `${bankKcString}`}`;
        return {
            [EnumOrganizationRqFields.BANK]: bankNameString,
            // [EnumOrganizationRqFields.RS]: bankPcString,
            // [EnumOrganizationRqFields.KS]: bankKcString,
            // [EnumOrganizationRqFields.BIK]: bankBikString,
            [EnumOrganizationRqFields.BANK_ADDRESS]: bankAddress,
        };
    }

    private findBankFieldByCode(bank: BankRqItem, code: BANK_RQ_ITEM_CODE) {
        return bank.fields.find(fld => fld.code === code)?.value as string;
    }

    public prepareClientFizSignature(clientRq: EvsRqItem): string {
        // let fullname = '';

        // fullname =
        //     (clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.PERSON_NAME)
        //         ?.value as string) || fullname;

        // const initials = fullname
        //     ? this.getIinitialsNameByFullName(fullname)
        //     : '_____________________';
        const initials = this.prepareClientFizDirectorInitials(clientRq);
        return `_________________________/ ${initials}`;
    }

    public prepareClientOrgSignature(clientRq: EvsRqItem): string {
        let result: string = '';
        const directorNameResult =
            this.prepareClientOrgDirectorInitials(clientRq);
        // let directorNameResult =
        //     ' _____________________';

        let directorPositionResult = '';

        // const directorFullName = this.findFieldByCode(
        //     clientRq,
        //     RQ_ITEM_CODE.DIRECTOR_NAME,
        // );
        // if (directorFullName) {
        //     directorNameResult = this.getIinitialsNameByFullName(directorFullName);
        // }

        const directorPosition = this.findFieldByCode(
            clientRq,
            RQ_ITEM_CODE.DIRECTOR_POSITION,
        );
        if (directorPosition) {
            directorPositionResult = `${directorPosition} `;
        }

        result = `${directorPositionResult}_____________________/${directorNameResult} `;
        return result;
    }

    public prepareClientFizDirectorInitials(clientRq: EvsRqItem): string {
        let fullname = '';

        fullname =
            (clientRq.fields.find(fld => fld.code === RQ_ITEM_CODE.PERSON_NAME)
                ?.value as string) || fullname;

        const initials = fullname
            ? this.getIinitialsNameByFullName(fullname)
            : '_____________________';
        return initials;
    }

    public prepareClientOrgDirectorInitials(clientRq: EvsRqItem): string {
        let directorNameResult = ' _____________________';

        const directorFullName = this.findFieldByCode(
            clientRq,
            RQ_ITEM_CODE.DIRECTOR_NAME,
        );
        if (directorFullName) {
            directorNameResult =
                this.getIinitialsNameByFullName(directorFullName);
        }

        return directorNameResult;
    }

    public prepareClientCompanyTitle(
        clientType: RQ_TYPE,
        clientRq: EvsRqItem | null,
    ) {
        let clientCompanyName = '';
        if (clientRq?.fields) {
            if (
                clientType === RQ_TYPE.ORGANIZATION ||
                clientType === RQ_TYPE.BUDGET ||
                clientType === RQ_TYPE.IP
            ) {
                for (const rqItem of clientRq.fields) {
                    if (rqItem.value) {
                        if (rqItem.code === RQ_ITEM_CODE.SHORTNAME) {
                            clientCompanyName = rqItem.value as string;
                        }
                    }
                }
                if (!clientCompanyName) {
                    for (const rqItem of clientRq.fields) {
                        if (rqItem.value) {
                            if (rqItem.code === RQ_ITEM_CODE.FULLNAME) {
                                clientCompanyName = rqItem.value as string;
                            }
                        }
                    }
                }
            } else if (clientType === RQ_TYPE.FIZ) {
                for (const rqItem of clientRq.fields) {
                    if (rqItem.value) {
                        if (rqItem.code === RQ_ITEM_CODE.PERSON_NAME) {
                            clientCompanyName = rqItem.value as string;
                        }
                    }
                }
            }
        }

        return clientCompanyName;
    }

    public prepareClientCompanyShortTitle(
        clientType: RQ_TYPE,
        clientRq: EvsRqItem | null,
    ): string {
        let clientCompanyName = '';
        const space = '';
        if (clientRq?.fields) {
            if (
                clientType === RQ_TYPE.ORGANIZATION ||
                clientType === RQ_TYPE.BUDGET ||
                clientType === RQ_TYPE.IP
            ) {
                for (const rqItem of clientRq.fields) {
                    if (rqItem.value) {
                        if (rqItem.code === RQ_ITEM_CODE.SHORTNAME) {
                            clientCompanyName = rqItem.value as string;
                        }
                    }
                }
            } else if (clientType === RQ_TYPE.FIZ) {
                for (const rqItem of clientRq.fields) {
                    if (rqItem.value) {
                        if (rqItem.code === RQ_ITEM_CODE.PERSON_NAME) {
                            const value = rqItem.value as string;
                            const initials = !value
                                ? space
                                : this.getIinitialsNameByFullName(
                                    rqItem.value as string,
                                );
                            clientCompanyName = initials;
                        }
                    }
                }
            }
        }

        return clientCompanyName || space;
    }

    public getUpdShortRq(
        clientType: RQ_TYPE,
        clientRq: EvsRqItem | null,
    ): string {
        let clientCompanyName = '';
        const space = '________________________________________';
        let result = '';
        const innKpp = this.getUpdInnKpp(clientType, clientRq);
        if (clientRq?.fields) {
            const inn =
                this.findFieldByCode(clientRq, RQ_ITEM_CODE.INN) || space;

            if (
                clientType === RQ_TYPE.ORGANIZATION ||
                clientType === RQ_TYPE.BUDGET ||
                clientType === RQ_TYPE.IP
            ) {
                const kpp =
                    this.findFieldByCode(clientRq, RQ_ITEM_CODE.KPP) || space;
                // kpp = `КПП: ${kppValue || kpp}`;
                result += `ИНН / КПП: ${inn} / ${kpp}`;
            } else if (clientType === RQ_TYPE.FIZ) {
                result += `ИНН: ${inn}`;
            }
        }

        return result;
    }

    public getUpdInnKpp(
        clientType: RQ_TYPE,
        clientRq: EvsRqItem | null,
    ): string {
        let result = '';

        if (clientRq?.fields) {
            const inn = this.findFieldByCode(clientRq, RQ_ITEM_CODE.INN);

            if (
                clientType === RQ_TYPE.ORGANIZATION ||
                clientType === RQ_TYPE.BUDGET ||
                clientType === RQ_TYPE.IP
            ) {
                const kpp = this.findFieldByCode(clientRq, RQ_ITEM_CODE.KPP);
                // kpp = `КПП: ${kppValue || kpp}`;
                result += `${inn} / ${kpp}`;
            } else if (clientType === RQ_TYPE.FIZ) {
                result += `${inn}`;
            }
        }

        return result;
    }

    public getAdreesForShortRq(clientRq: EvsRqItem): string {
        const address = this.getAddressString(
            clientRq,
            BX_ADDRESS_TYPE.REGISTERED,
            RQ_TYPE.ORGANIZATION,
            true,
        );
        return address;
    }

    private getIinitialsNameByFullName(fullname: string): string {
        const person = this.splitFullName(fullname);
        const first = person.first?.[0]?.toUpperCase() || '';
        const middle = person.middle?.[0]?.toUpperCase() || '';
        let shortName = `${person.last}`;
        if (first) {
            shortName = `${person.last} ${first}.`;
        } else {
            shortName = `${person.last} ${middle}.`;
        }
        return shortName;
    }

    private splitFullName(fullName: string): FioT {
        const parts = fullName.trim().split(/\s+/);
        return {
            last: parts[0] || null,
            first: parts[1] || null,
            middle: parts[2] || null,
        };
    }
}

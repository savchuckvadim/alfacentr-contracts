import { Injectable } from '@nestjs/common';
import { DocumentEmailDto } from '../dtos/document-email.dto';
import { BxDealContactFlowService } from '@/modules/flow/bitrix-deal-flow/bx-deal-contact-flow.service';
import {
    BxDealData,
    BxDealDataKeys,
    documentFields,
    EnumDealDocumentFieldCode,
} from '@alfa/entities';
import { BxTimelineService } from '@/modules/flow/timeline-flow/bx-timeline.service';
import { EmailDocumentFlowService } from '@/modules/flow/email-flow/email-document-flow.service';
import { BitrixService } from '@/modules/bitrix';
import { BxDiskFlowService } from '@/modules/flow/disk-flow/bx-disk-flow.service';
import { PBXService } from '@/modules/pbx';
import { getStringError } from '@/lib/error-handler/get-string-error';

export interface IFileField {
    downloadUrl: string;
    showUrl: string;
    id: number;
}

interface IDealData {
    email: string;
    name: string;
    phone: string;
    documentPrefixNumber: string;
    edoComment: string;
    needEdoEmail: boolean;
}
interface IBitrixIdsForDeal {
    emailBitrixId: string;
    nameBitrixId: string;
    phoneBitrixId: string;
    documentPrefixBitrixId: string;
    documentNumberBitrixId: string;
    edoCommentBitrixId: string;

}
@Injectable()
export class DocumentEmailService {


    constructor(

        private readonly pbxService: PBXService,
    ) { }

    async sendDocumentEmail(dto: DocumentEmailDto) {
        const { dealId, userId: userIdString, userName, domain, companyName } = dto;
        const userId = Number(userIdString);
        const { bitrix } = await this.pbxService.init(domain);


        const bxTimelineService = new BxTimelineService(
            bitrix,
            userId,
            dealId,
        );
        try {
            void (await bxTimelineService.send(
                '⌛ Подготовка к отправке email клиенту',
                'waiting',
            ));
            console.log('dto', dto);
            console.log('userId', userId);

            // await this.init();
            // const edoComment = documentFields[EnumDealDocumentFieldCode.COMMENT_FOR_OD].bitrixId;
            //TODO GET FROM BX
            //         name
            // phone
            // documentPrefixNumber
            // userEmail
            // contactId
            // edoComment
            // companyName
            // userName
            // userId
            const dealContactService = new BxDealContactFlowService(
                bitrix,
                dealId,
            );

            //////////////////////BITRIX IDS FOR GET FROM DEAL //////////////////////



            ///получение сделки из bitrix
            const {
                email,
                name,
                phone,
                documentPrefixNumber,
                needEdoEmail,
                edoComment,

            } = await this.getDealData(dto.dealId, bitrix);



            /////получение нужных данных из сделки

            const contactResult = await dealContactService.flow({
                email,
                name: '',
                phone: '',
                userId: Number(userId),
            });
            const contactId = contactResult.contactId;
            console.log('contactResult', contactResult);
            console.log('contactId', contactId);

            const emailDocumentFlowService = new EmailDocumentFlowService(
                bitrix,
                bxTimelineService,
                dealId,
            );

            const diskFlowService = new BxDiskFlowService(
                bitrix,
                dealId,
            );
            const filesForSend = await diskFlowService.get();

            const emailResult = await emailDocumentFlowService.flow({
                filesForSend: filesForSend.files,
                email,
                name,
                phone,
                documentPrefixNumber,
                contactId: Number(contactId),
                edoComment,
                needEdoEmail,
                companyName,
                userName,
                userId: userId.toString(),
            });

            return { contactId, emailResult };
        } catch (error) {
            console.error(error);
            void (await bxTimelineService.send(
                '❌ Произошла ошибка: Не удалось отправить email клиенту',
                'error',
            ));
            const stringError = getStringError(error);
            void (await bxTimelineService.send(
                `❌ Подробности ошибки: ${stringError}`,
                'error',
            ));
        }
    }



    private async getDealData(dealId: number, bitrix: BitrixService): Promise<IDealData> {
        const { nameBitrixId, emailBitrixId, phoneBitrixId, edoCommentBitrixId, documentNumberBitrixId, documentPrefixBitrixId } = this.getBitrixIdsForDeal();
        const dealResponse = await bitrix.deal.get(dealId, [
            'RESPONSIBLE_ID',
            'CONTACT_ID',
            nameBitrixId,
            emailBitrixId,
            phoneBitrixId,
            edoCommentBitrixId,
            documentNumberBitrixId,
            documentPrefixBitrixId,
        ]);
        const deal = dealResponse.result;
        return {
            email: deal[emailBitrixId] as string,
            name: deal[nameBitrixId] as string,
            phone: deal[phoneBitrixId] as string,
            edoComment: deal[edoCommentBitrixId] as string,
            documentPrefixNumber: `${deal[documentPrefixBitrixId] as string} ${deal[documentNumberBitrixId] as string}`,
            needEdoEmail: false,

        } as IDealData;
    }

    private getBitrixIdsForDeal(): IBitrixIdsForDeal {
        const dealData = BxDealData;
        //имя контактного лица по документам
        const nameFieldBitrixId =
            dealData[BxDealDataKeys.exchange_doc_name].bitrixId;
        //email контактного лица по документам
        const emailFieldBitrixId =
            dealData[BxDealDataKeys.exchange_doc_email].bitrixId;
        //телефон контактного лица по документам
        const phoneFieldBitrixId =
            dealData[BxDealDataKeys.exchange_doc_phone].bitrixId;


        //филды связанные с документом
        const documentDealData = documentFields

        //комментарий для сотрудника ОДО
        const commentForEdoBitrixId =
            documentDealData[EnumDealDocumentFieldCode.COMMENT_FOR_OD].bitrixId as string;
        //номер документа
        const documentNumberBitrixId =
            documentDealData[EnumDealDocumentFieldCode.NUMBER_CURRENT_DOC].bitrixId as string;
        //префикс документа
        const documentPrefixBitrixId =
            documentDealData[EnumDealDocumentFieldCode.PREFIX_DYNAMIC].bitrixId as string;
        ///////////////////////////////////////////////////// //////////////////////



        return {
            nameBitrixId: nameFieldBitrixId,
            emailBitrixId: emailFieldBitrixId,
            phoneBitrixId: phoneFieldBitrixId,
            edoCommentBitrixId: commentForEdoBitrixId,
            documentNumberBitrixId: documentNumberBitrixId,
            documentPrefixBitrixId: documentPrefixBitrixId,
        };
    }


}

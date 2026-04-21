import { delay } from '@/lib';
import {  BitrixService, IBXTimelineComment } from '@/modules/bitrix';
import { documentFields, EnumDealDocumentFieldCode } from '@alfa/entities';

export class BxTimelineService {
    constructor(
        private readonly bitrix: BitrixService,
        private readonly userId: number,
        private readonly entityId: number,
    ) { }

    public async send(
        comment: string,
        type:
            | 'error'
            | 'success'
            | 'document'
            | 'pdf'
            | 'ppk'
            | 'email'
            | 'clock'
            | 'waiting',
        isWaiting: boolean = false,
    ) {
        let icon = '❌';

        if (type === 'success') {
            icon = '✅';
        } else if (type === 'document') {
            icon = '📜';
        } else if (type === 'pdf') {
            icon = '📄';
        } else if (type === 'ppk') {
            icon = '📄';
        }


        const timelieneData: IBXTimelineComment = {
            AUTHOR_ID: this.userId.toString(),
            COMMENT: `${comment}`,
            ENTITY_TYPE: 'deal',
            ENTITY_ID: this.entityId,
        };
        return await this.bitrix.timeline.addTimelineComment(timelieneData);
    }
    public async setTimelineDocumentPin(folderUrl: string) {

        const documentDealData = documentFields
        const pinedField = documentDealData[EnumDealDocumentFieldCode.TIMELINE_DOCUMENT_PIN];
        const pinedFieldBitrixId = pinedField.bitrixId;

        await delay(1300)
        const dealResponse = await this.bitrix.deal.get(this.entityId, [pinedFieldBitrixId]);
        const deal = dealResponse.result;
        const documentPin = deal[pinedFieldBitrixId];




        if (!documentPin) {
            const documentTimelineComment = await this.send(
                `📜 <a href="${folderUrl}">Документы</a>`,
                'success',
            );

            await delay(300)
            const timeLineItemId = Number(documentTimelineComment.result)




            await this.bitrix.timeline.pin({
                id: timeLineItemId,
                ownerTypeId: 2,
                ownerId: this.entityId,
            })
            await delay(500)
            await this.bitrix.deal.update(this.entityId, {
                [pinedFieldBitrixId]: timeLineItemId.toString(),
            });
        }




    }
}

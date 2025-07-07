import { IBXItem } from "@workspace/bitrix";
import { Bitrix } from "@bitrix/bitrix";
import { BitrixService } from "@bitrix/bitrix.service";
import { EntityTypeIdEnum, getParticipant, IAlfaParticipantSmartItem, IParticipant } from "@alfa/entities";
import { validateApiResponse } from "@/modules/app/lib/thunk-error-handler";


export class BxParticipantService {
    private bitrix: BitrixService
    constructor(
    ) {
        this.bitrix = Bitrix.getService()
    }

    public async getParticipantsComand(dealId: string) {

        this.bitrix.batch.item.list(
            'participants',
            EntityTypeIdEnum.PARTICIPANT as unknown as string,
            {
                parentId2: dealId
            },
            []
        )

        // Проверяем различные случаи ошибок с помощью утилиты
        // const validResponse = validateApiResponse(response, 'Ошибка получения участников: пустой ответ от сервера')
        // const validItems = validateApiResponse(validResponse.items, 'Ошибка получения участников: отсутствуют данные в ответе')

        // const typedParticipant = validItems.map((participant: IBXItem) => {
        //     return {
        //         ...participant,
        //         entityTypeId: EntityTypeIdEnum.PARTICIPANT as unknown as string
        //     } as unknown as IAlfaParticipantSmartItem
        // }) as IAlfaParticipantSmartItem[]

        // const participants = typedParticipant.map((participant: IAlfaParticipantSmartItem) => getParticipant(participant))
        // console.log("PARTICIPANTS ALFA", participants)


    }

    public getParticipantsFrommItems(smartItems: IBXItem[]): IParticipant[] {
        const validItems = validateApiResponse(smartItems, 'Ошибка получения участников: отсутствуют данные в ответе')

        const typedParticipant = validItems.map((participant: IBXItem) => {
            return {
                ...participant,
                entityTypeId: EntityTypeIdEnum.PARTICIPANT as unknown as string
            } as unknown as IAlfaParticipantSmartItem
        }) as IAlfaParticipantSmartItem[]

        const participants = typedParticipant.map((participant: IAlfaParticipantSmartItem) => getParticipant(participant))


        return participants;
    }
}




import {
    IAlfaParticipantSmartItem,
    IParticipant,
    SmartEntity,
} from '@alfa/entities';

export const getParticipantStageInfo = (participant: IParticipant) => {
    const smartService = new SmartEntity(
        participant as unknown as IAlfaParticipantSmartItem,
    );
    const stage = smartService.getStageInfo();
    return stage.stageType;
};

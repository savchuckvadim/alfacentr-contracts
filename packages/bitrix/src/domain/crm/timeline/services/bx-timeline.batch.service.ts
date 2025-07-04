
import { BxTimelineRepository } from "../repository/bx-timeline.repository";
import { IBXTimelineComment } from "../interface/bx-timeline.interface";
import { BitrixBaseApi } from "@bitrix/core";



export class BxTimelineBatchService {
    private repo!: BxTimelineRepository

    clone(api: BitrixBaseApi): BxTimelineBatchService {
        const instance = new BxTimelineBatchService();
        instance.init(api);
        return instance;
    }


    init(api: BitrixBaseApi) {
        this.repo = new BxTimelineRepository(api);
    }
    addTimelineComment(cmd: string, data: IBXTimelineComment) {
        return this.repo.addTimelineCommentBtch(cmd, data);
    }
}
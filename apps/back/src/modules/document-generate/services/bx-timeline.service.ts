import { BitrixService, IBXTimelineComment } from '@/modules/bitrix';

export class BxTimelineService {
    constructor(
        private readonly bitrix: BitrixService,
        private readonly userId: number,
        private readonly entityId: number,
    ) {}

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
    ): Promise<void> {
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
        void (await this.bitrix.timeline.addTimelineComment(timelieneData));
    }
}

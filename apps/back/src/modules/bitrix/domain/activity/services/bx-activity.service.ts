import { BxActivityRepository } from '../bx-activity.repository';
import { IBXActivity } from '../interfaces/bx-activity.interface';
import { BitrixBaseApi } from 'src/modules/bitrix/core/base/bitrix-base-api';

export class ActivityService {
    private repo: BxActivityRepository;

    clone(api: BitrixBaseApi): ActivityService {
        const instance = new ActivityService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxActivityRepository(api);
    }

    async createActivity(activity: IBXActivity) {
        return await this.repo.create(activity);
    }

    async updateActivity(id: number | string, activity: IBXActivity) {
        return await this.repo.update(id, activity);
    }

    async deleteActivity(id: number | string) {
        return await this.repo.delete(id);
    }
}

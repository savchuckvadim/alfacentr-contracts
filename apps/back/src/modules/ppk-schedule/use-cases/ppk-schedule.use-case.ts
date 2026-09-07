import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PBXService } from '@/modules/pbx';
import { TelegramService } from '@/modules/telegram/telegram.service';
import {
    PpkScheduleResult,
    PpkScheduleService,
} from '../services/ppk-schedule.service';

const DEFAULT_DOMAIN = 'alfacentr.bitrix24.ru';

/**
 * Ежедневная актуализация участников ППК: пересчет ближайшей даты обучения
 * и перевод в «Подтвержден» за две недели до начала.
 *
 * Первая запланированная задача в проекте, поэтому итог каждого прогона
 * уходит в служебный канал — чтобы не гадать, отработала она или нет
 */
@Injectable()
export class PpkScheduleUseCase {
    constructor(
        private readonly pbx: PBXService,
        private readonly telegram: TelegramService,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_3AM, { name: 'ppk-schedule' })
    async handleCron(): Promise<void> {
        try {
            const result = await this.run();
            //молчим, когда менять нечего: иначе канал зарастет пустыми отчетами
            if (result.dateUpdated || result.stageUpdated || result.errors.length) {
                await this.telegram.sendMessage(this.renderResult(result));
            }
        } catch (error) {
            const reason =
                error instanceof Error ? error.message : String(error);
            await this.telegram.sendMessage(
                `ALFA PPK SCHEDULE: прогон не выполнен — ${reason}`,
            );
        }
    }

    /** Тот же прогон, но вызываемый вручную — для проверки и отладки */
    async run(): Promise<PpkScheduleResult> {
        const { bitrix } = await this.pbx.init(DEFAULT_DOMAIN);
        const service = new PpkScheduleService(bitrix);
        return await service.run();
    }

    private renderResult(result: PpkScheduleResult): string {
        const lines = [
            'ALFA PPK SCHEDULE: прогон завершен',
            `- участников проверено: ${result.checked}`,
            `- обновлена дата следующего мероприятия: ${result.dateUpdated}`,
            `- переведено в «Подтвержден»: ${result.stageUpdated}`,
        ];

        if (result.errors.length) {
            lines.push(`- ошибок: ${result.errors.length}`);
            lines.push(...result.errors.slice(0, 10).map(e => `    ${e}`));
        }

        return lines.join('\n');
    }
}

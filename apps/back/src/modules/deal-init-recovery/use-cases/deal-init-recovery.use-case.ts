import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PBXService } from '@/modules/pbx';
import { TelegramService } from '@/modules/telegram/telegram.service';
import { OnDealInitUseCase } from '@/modules/on-deal-init/use-cases/on-deal-init.use-case';
import {
    DealInitRecoveryResult,
    DealInitRecoveryService,
} from '../services/deal-init-recovery.service';

const DEFAULT_DOMAIN = 'alfacentr.bitrix24.ru';

/**
 * Подстраховка приема заявок: если вебхук из бизнес-процесса не дошел
 * до сервера, сделка остается пустой, а флаг портала все равно встает —
 * БП #828 ставит «Заявка обработана» сразу после отправки, не дожидаясь
 * ответа. Крон раз в четверть часа сам находит такие сделки и прогоняет
 * их через ту же точку входа, что и вебхук
 */
@Injectable()
export class DealInitRecoveryUseCase {
    constructor(
        private readonly pbx: PBXService,
        private readonly telegram: TelegramService,
        private readonly onDealInit: OnDealInitUseCase,
    ) {}

    //в @nestjs/schedule нет готовой константы на четверть часа
    @Cron('0 */15 * * * *', { name: 'deal-init-recovery' })
    async handleCron(): Promise<void> {
        try {
            const result = await this.run();
            //молчим, если делать было нечего: иначе канал зарастет отчетами
            if (result.processed || result.markedOnly || result.errors.length) {
                await this.telegram.sendMessage(this.renderResult(result));
            }
        } catch (error) {
            const reason =
                error instanceof Error ? error.message : String(error);
            await this.telegram.sendMessage(
                `ALFA DEAL INIT RECOVERY: прогон не выполнен — ${reason}`,
            );
        }
    }

    /** Тот же прогон вручную — проверить, не дожидаясь расписания */
    async run(): Promise<DealInitRecoveryResult> {
        const { bitrix } = await this.pbx.init(DEFAULT_DOMAIN);
        const service = new DealInitRecoveryService(bitrix, (dealId) =>
            this.onDealInit.onDealCreate({
                auth: { domain: DEFAULT_DOMAIN },
                dealId,
            } as Parameters<OnDealInitUseCase['onDealCreate']>[0]),
        );
        return await service.run();
    }

    private renderResult(result: DealInitRecoveryResult): string {
        const lines = [
            'ALFA DEAL INIT RECOVERY: прогон завершен',
            `- кандидатов найдено: ${result.candidates}`,
            `- обработано заново: ${result.processed}${
                result.processedIds.length
                    ? ` (${result.processedIds.join(', ')})`
                    : ''
            }`,
            `- уже были не пустые, только помечены: ${result.markedOnly}`,
        ];

        if (result.errors.length) {
            lines.push(`- ошибок: ${result.errors.length}`);
            lines.push(...result.errors.slice(0, 10).map((e) => `    ${e}`));
        }

        return lines.join('\n');
    }
}

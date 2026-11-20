import {
    Controller,
    Post,
    Body,
    Param,
    ValidationPipe,
    HttpCode,
    HttpStatus,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BitrixHookDto } from '@/lib/dto';

import { FrontDealUseCase } from '../use-cases/front-deal.use-case';
import { toDealInitJobData } from '../services/deal-init-job.rules';
import { DealInitEnqueueService } from '../services/deal-init-enqueue.service';

@ApiTags('Alfa on deal init')
@Controller('seminar')
export class OnDealInitController {
    private readonly logger = new Logger(OnDealInitController.name);

    constructor(
        private readonly dealInitEnqueue: DealInitEnqueueService,
        private readonly frontDealUseCase: FrontDealUseCase,
    ) {}

    /**
     * Вебхук инициации заявки из бизнес-процесса #828.
     *
     * Отвечает сразу, не дожидаясь приёма: Битрикс рвёт соединение по
     * своему таймауту, и за две недели ноября 2026 так оборвалась четверть
     * вебхуков (65 из 242). Ответа он всё равно не читает — для него это
     * выстрел без ответа, — но оборванное соединение означало, что заявка
     * осталась пустой до прогона крона подхвата.
     *
     * Повторные вебхуки по одной сделке схлопываются по jobId: 16.11.2026
     * Битрикс прислал пять запросов по сделке 204098 за десять секунд, и
     * каждый запускал полный приём — задвоенные участники и гонка за номер.
     */
    @ApiOperation({ summary: 'On deal init' })
    @Post('create-deal/:dealId')
    @HttpCode(HttpStatus.ACCEPTED)
    async createDeal(
        @Body(ValidationPipe) body: BitrixHookDto,
        @Param('dealId') dealId: string,
    ) {
        const data = toDealInitJobData(dealId, body?.auth?.domain);
        if (!data) {
            throw new BadRequestException(
                'Нужны номер сделки и домен портала в auth.domain',
            );
        }

        //Bull при существующем jobId возвращает «успех» с id старой задачи,
        //поэтому по ответу add не понять, поставили мы заявку или нет —
        //решает сервис, он смотрит на состояние прежней задачи
        const { status } = await this.dealInitEnqueue.enqueue(data);
        const queued = status === 'queued' || status === 'revived';

        //время прихода пишем явно: вебхук портала доходит с задержкой от
        //секунд до минут (сделка 204296, 17.11.2026 — 7 минут от формы), и
        //по этой строке в логе видно задержку, не поднимая лог nginx
        const messages: Record<string, string> = {
            queued: 'поставлена в очередь',
            revived: 'прежний приём упал — поставлена заново',
            already: 'уже в работе или только что принята, повтор отброшен',
        };
        this.logger.log(
            `Вебхук БП: сделка ${data.dealId} ${messages[status] ?? status}`,
        );

        return { dealId: data.dealId, queued };
    }

    @ApiOperation({ summary: 'Get deal values' })
    @Post('get-deal-values/:dealId')
    async getDealValues(
        @Body(ValidationPipe) body: BitrixHookDto,
        @Param('dealId') dealId: string,
    ) {
        await this.frontDealUseCase.init(body.auth.domain);
        return this.frontDealUseCase.getDealValues(Number(dealId));
    }

    @ApiOperation({ summary: 'Get Fields Ids' })
    @Post('get-fields-data')
    async getFieldsIds(@Body(ValidationPipe) body: BitrixHookDto) {
        await this.frontDealUseCase.init(body.auth.domain);
        return this.frontDealUseCase.getFieldsIds();
    }
}

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
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { BitrixHookDto } from '@/lib/dto';
import { QueueNames } from '@/modules/queue/constants/queue-names.enum';
import { JobNames } from '@/modules/queue/constants/job-names.enum';

import { FrontDealUseCase } from '../use-cases/front-deal.use-case';
import {
    DEAL_INIT_JOB_ATTEMPTS,
    DEAL_INIT_JOB_KEEP_MS,
    getDealInitJobId,
    toDealInitJobData,
} from '../services/deal-init-job.rules';

@ApiTags('Alfa on deal init')
@Controller('seminar')
export class OnDealInitController {
    private readonly logger = new Logger(OnDealInitController.name);

    constructor(
        @InjectQueue(QueueNames.DEAL_INIT)
        private readonly dealInitQueue: Queue,
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

        const job = await this.dealInitQueue.add(JobNames.DEAL_INIT, data, {
            jobId: getDealInitJobId(data.dealId),
            attempts: DEAL_INIT_JOB_ATTEMPTS,
            removeOnComplete: {
                age: Math.round(DEAL_INIT_JOB_KEEP_MS / 1000),
            },
            removeOnFail: false,
        });

        //null — повтор по той же сделке: задача уже в очереди или только
        //что отработала, второй приём затёр бы её работу
        const queued = Boolean(job?.id);
        //время прихода пишем явно: вебхук портала доходит с задержкой от
        //секунд до минут (сделка 204296, 17.11.2026 — 7 минут от формы), и
        //по этой строке в логе видно задержку, не поднимая лог nginx
        this.logger.log(
            queued
                ? `Вебхук БП: сделка ${data.dealId} поставлена в очередь`
                : `Вебхук БП: сделка ${data.dealId} уже в работе, повтор отброшен`,
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

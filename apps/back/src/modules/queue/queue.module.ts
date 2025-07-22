import { BullModule } from '@nestjs/bull';
import { Module, Logger, forwardRef } from '@nestjs/common';

import { BitrixModule } from '../bitrix/bitrix.module';
import { RedisModule } from 'src/core/redis/redis.module';
import { ConfigService } from '@nestjs/config';
import { QueueDispatcherService } from './dispatch/queue-dispatcher.service';
import { QueueNames } from './constants/queue-names.enum';
import { SilentJobManagerService } from 'src/core/silence/silent-job-manager.service';
import { SilentJobProcessor } from './processors/silent-job.processor';
import { SilentJobHandlersModule } from 'src/core/silence/silent-job-handlers.module';

@Module({
    imports: [
        BullModule.forRootAsync({
            useFactory: (configService: ConfigService) => {
                const host = configService.get('REDIS_HOST') ?? 'redis';
                const port = parseInt(
                    configService.get('REDIS_PORT') ?? '6379',
                    10,
                );

                const logger = new Logger('BullModule');
                logger.log(
                    `BullModule Redis config: host=${host}, port=${port}`,
                );

                return {
                    redis: {
                        host,
                        port,
                    },
                };
            },
            inject: [ConfigService],
        }),
        BullModule.registerQueue(
            ...Object.values(QueueNames).map((name) => ({ name })),
        ),
        // BitrixModule,
        RedisModule,
        SilentJobHandlersModule,
        // forwardRef(() => KpiReportModule),
    ],
    providers: [
        // QueueService,
        // QueueProcessor,
        // RedisService,
        QueueDispatcherService,
        SilentJobManagerService,
        SilentJobProcessor,
        // SalesKpiReportQueueProcessor
    ],
    exports: [
        // QueueService,
        QueueDispatcherService,
        BullModule,
        SilentJobHandlersModule,
    ],
})
export class QueueModule {
    private readonly logger = new Logger(QueueModule.name);

    constructor() {
        this.logger.log('QueueModule initialized');
        this.logger.log('Registered queues:', Object.values(QueueNames));
    }
}

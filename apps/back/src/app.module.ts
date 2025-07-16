import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueueModule } from './modules/queue/queue.module';

import { ConfigModule } from '@nestjs/config';
import { TelegramModule } from './modules/telegram/telegram.module';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { RedisModule } from './core/redis/redis.module';
import { SilentJobHandlersModule } from './core/silence/silent-job-handlers.module';


import { HealthController } from './health.controller';
import { PBXModule } from './modules/pbx/pbx.module';
import { WsModule } from './core/ws/ws.module';
import { QueuePingModule } from './apps/queue-ping/queue-ping.module';
import { BitrixModule } from './modules/bitrix/bitrix.module';
import { PortalModule } from './modules/portal/portal.module';
import { AlfaActivityModule } from './modules/hooks/alfa/alfa-activity.module';
// import { EventServiceModule } from './apps/event-service/event-service.module';
// import { KonstructorModule } from './apps/konstructor/konstructor.module';
import { MetricsModule } from './core/metrics/metrics.module';
import { AlfaModule } from './apps/alfa/alfa.module';


import { StorageModule } from './core/storage/storage.module';
import { FileLinkModule } from './core/file-link/file-link.module';
import { BxDepartmentModule } from '@/modules/bx-department/bx-department.module';

import { HelperModule } from './modules/helper/helper.module';
import { ScheduleModule } from '@nestjs/schedule';

import { OnDealInitModule } from './modules/on-deal-init/on-deal-init.module';
import { AlfaProductsModule } from './modules/alfa-products';
import { AlfaFieldsModule } from './modules/alfa-fields';
import { FieldsModule } from './commands/fields/fields.module';
import { DocumentGenerateModule } from './modules/document-generate/document-generate.module';


@Module({
  imports: [

    // DevtoolsModule.register({
    //   http: process.env.NODE_ENV !== 'production'
    // }),

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: false,
      load: [() => ({
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
      })],
    }),
    ScheduleModule.forRoot(),

    MetricsModule,
    WsModule,
    QueueModule,

    //apps
 
    // HooksModule,
    AlfaActivityModule,
    BitrixModule,
    PortalModule,
    PBXModule,
    // PBXInstallModule,
    // PbxDomainModule,
    TelegramModule,
    RedisModule,
    SilentJobHandlersModule,
    // KpiReportModule,
    // EventSalesModule,


    QueuePingModule,
    // KonstructorModule,
    AlfaModule,
    // EventServiceModule
    OnDealInitModule,
    AlfaProductsModule,
    AlfaFieldsModule,


    //commands
    // GarantPricesModule,
    // GsrModule,
    FieldsModule,
    // CategoryModule,
    // ChangeDealCategoryModule,

    StorageModule,
    FileLinkModule,
    // GarantModule,
    // PortalKonstructorModule,


    BxDepartmentModule,
    DocumentGenerateModule,


 
    HelperModule
  ],
  controllers: [
    AppController,
    HealthController
  ],
  providers: [
    AppService,
    GlobalExceptionFilter,
  ],
})
export class AppModule { }

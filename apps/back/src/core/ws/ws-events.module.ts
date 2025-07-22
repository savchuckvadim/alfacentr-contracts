import { Module } from '@nestjs/common';
import { WsEventsService } from './ws-events.service';
import { WsModule } from './ws.module';

@Module({
    imports: [WsModule],
    providers: [WsEventsService],
    exports: [WsEventsService],
})
export class WsEventsModule {}

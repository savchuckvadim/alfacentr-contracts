import { Module } from '@nestjs/common';
import { AlfaActivityController } from './alfa-activity.controller';
import { AlfaActivityService } from './alfa-activity.service';
import { PBXModule } from '@/modules/pbx';

@Module({
    imports: [PBXModule],
    controllers: [AlfaActivityController],
    providers: [AlfaActivityService],
})
export class AlfaActivityCommandsModule {}

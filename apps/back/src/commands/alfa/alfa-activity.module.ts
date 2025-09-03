import { Module } from '@nestjs/common';
import { AlfaActivityController } from './alfa-activity.controller';
import { AlfaActivityService } from './alfa-activity.service';
import { PBXModule } from '@/modules/pbx';
import { AlfaCompanyController } from './alfa-company.controller';

@Module({
    imports: [PBXModule],
    controllers: [AlfaActivityController, AlfaCompanyController],
    providers: [AlfaActivityService],
})
export class AlfaActivityCommandsModule {}

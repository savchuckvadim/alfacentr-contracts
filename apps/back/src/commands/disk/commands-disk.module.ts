import { Module } from '@nestjs/common';
import { PBXModule } from '@/modules/pbx/pbx.module';
import { DiskFolderService } from './services/disk-folder.service';
import { DiskFolderController } from './controllers/disk-folder.controller';
import { DiskStorageService } from './services/disk-storage.service';
import { DiskFileService } from './services/disk-file.service';
import { DiskStorageController } from './controllers/disk-storage.controller';
import { DiskFileController } from './controllers/disk-file.controller';

@Module({
    imports: [PBXModule],
    controllers: [
        DiskFolderController,
        DiskStorageController,
        DiskFileController,
    ],
    providers: [DiskFolderService, DiskStorageService, DiskFileService],
})
export class DiskCommandsModule {}

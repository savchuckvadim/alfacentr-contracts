import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DiskStorageService } from '../services/disk-storage.service';
import {
    DiskStorageAddFolderDto,
    DiskStorageGetChildrenDto,
    DiskStorageGetDto,
    DiskStorageUploadFileDto,
} from '../dtos';

@ApiTags('BX Commands')
@Controller('disk-storage')
export class DiskStorageController {
    constructor(private readonly diskStorageService: DiskStorageService) {}

    @Post('gettypes')
    @ApiOperation({ summary: 'disk.storage.gettypes' })
    @ApiResponse({ status: 200, description: 'Storage types' })
    async getTypes() {
        return await this.diskStorageService.gettypes();
    }

    @Post('getlist')
    @ApiOperation({ summary: 'disk.storage.getlist' })
    @ApiResponse({ status: 200, description: 'Storage list' })
    async getList() {
        return await this.diskStorageService.getlist();
    }

    @Post('getchildren')
    @ApiOperation({ summary: 'disk.storage.getchildren' })
    @ApiResponse({ status: 200, description: 'Storage children list' })
    async getChildren(@Body() dto: DiskStorageGetChildrenDto) {
        return await this.diskStorageService.getchildren(dto);
    }

    @Post('get')
    @ApiOperation({ summary: 'disk.storage.get' })
    @ApiResponse({ status: 200, description: 'Storage data' })
    async get(@Body() dto: DiskStorageGetDto) {
        return await this.diskStorageService.get(dto.id);
    }

    @Post('uploadfile')
    @ApiOperation({ summary: 'disk.storage.uploadfile' })
    @ApiResponse({ status: 200, description: 'File uploaded to storage' })
    async uploadFile(@Body() dto: DiskStorageUploadFileDto) {
        return await this.diskStorageService.uploadfile(dto);
    }

    @Post('addfolder')
    @ApiOperation({ summary: 'disk.storage.addfolder' })
    @ApiResponse({ status: 200, description: 'Folder created in storage' })
    async addFolder(@Body() dto: DiskStorageAddFolderDto) {
        return await this.diskStorageService.addfolder(dto);
    }
}

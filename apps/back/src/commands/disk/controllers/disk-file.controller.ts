import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DiskFileService } from '../services/disk-file.service';
import {
    DiskFileCopyToDto,
    DiskFileDeleteDto,
    DiskFileGetDto,
    DiskFileGetFieldsDto,
    DiskFileGetExternalLinkDto,
    DiskFileGetVersionsDto,
    DiskFileMarkDeletedDto,
    DiskFileMoveToDto,
    DiskFileRenameDto,
    DiskFileRestoreDto,
    DiskFileRestoreFromVersionDto,
    DiskFileUploadVersionDto,
} from '../dtos';

@ApiTags('BX Commands')
@Controller('disk-file')
export class DiskFileController {
    constructor(private readonly diskFileService: DiskFileService) {}

    @Post('delete')
    @ApiOperation({ summary: 'disk.file.delete' })
    @ApiResponse({ status: 200, description: 'File deleted' })
    async delete(@Body() dto: DiskFileDeleteDto) {
        return await this.diskFileService.delete(dto);
    }

    @Post('moveto')
    @ApiOperation({ summary: 'disk.file.moveto' })
    @ApiResponse({ status: 200, description: 'File moved' })
    async moveTo(@Body() dto: DiskFileMoveToDto) {
        return await this.diskFileService.moveto(dto);
    }

    @Post('restore')
    @ApiOperation({ summary: 'disk.file.restore' })
    @ApiResponse({ status: 200, description: 'File restored' })
    async restore(@Body() dto: DiskFileRestoreDto) {
        return await this.diskFileService.restore(dto);
    }

    @Post('get')
    @ApiOperation({ summary: 'disk.file.get' })
    @ApiResponse({ status: 200, description: 'File data' })
    async get(@Body() dto: DiskFileGetDto) {
        return await this.diskFileService.get(dto);
    }

    @Post('getfields')
    @ApiOperation({ summary: 'disk.file.getfields' })
    @ApiResponse({ status: 200, description: 'File fields meta' })
    async getFields(@Body() _dto: DiskFileGetFieldsDto) {
        return await this.diskFileService.getfields();
    }

    @Post('get-versions')
    @ApiOperation({ summary: 'disk.file.getVersions' })
    @ApiResponse({ status: 200, description: 'File versions list' })
    async getVersions(@Body() dto: DiskFileGetVersionsDto) {
        return await this.diskFileService.getVersions(dto);
    }

    @Post('markdeleted')
    @ApiOperation({ summary: 'disk.file.markdeleted' })
    @ApiResponse({ status: 200, description: 'File moved to trash' })
    async markDeleted(@Body() dto: DiskFileMarkDeletedDto) {
        return await this.diskFileService.markdeleted(dto);
    }

    @Post('copyto')
    @ApiOperation({ summary: 'disk.file.copyto' })
    @ApiResponse({ status: 200, description: 'File copied' })
    async copyTo(@Body() dto: DiskFileCopyToDto) {
        return await this.diskFileService.copyto(dto);
    }

    @Post('getexternalLink')
    @ApiOperation({ summary: 'disk.file.getExternalLink' })
    @ApiResponse({ status: 200, description: 'External link' })
    async getExternalLink(@Body() dto: DiskFileGetExternalLinkDto) {
        return await this.diskFileService.getExternalLink(dto);
    }

    @Post('rename')
    @ApiOperation({ summary: 'disk.file.rename' })
    @ApiResponse({ status: 200, description: 'File renamed' })
    async rename(@Body() dto: DiskFileRenameDto) {
        return await this.diskFileService.rename(dto);
    }

    @Post('uploadversion')
    @ApiOperation({ summary: 'disk.file.uploadversion' })
    @ApiResponse({ status: 200, description: 'File version uploaded' })
    async uploadVersion(@Body() dto: DiskFileUploadVersionDto) {
        return await this.diskFileService.uploadversion(dto);
    }

    @Post('restorefromversion')
    @ApiOperation({ summary: 'disk.file.restoreFromVersion' })
    @ApiResponse({ status: 200, description: 'File restored from version' })
    async restoreFromVersion(@Body() dto: DiskFileRestoreFromVersionDto) {
        return await this.diskFileService.restoreFromVersion(dto);
    }
}

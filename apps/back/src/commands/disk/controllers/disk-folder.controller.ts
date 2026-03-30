import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DiskFolderService } from '../services/disk-folder.service';
import {
    DiskFolderAddSubfolderDto,
    DiskFolderCopyToDto,
    DiskFolderDeletetreeDto,
    DiskFolderGetDto,
    DiskFolderGetChildrenDto,
    DiskFolderGetExternalLinkDto,
    DiskFolderGetFieldsDto,
    DiskFolderMarkDeletedDto,
    DiskFolderMovetoDto,
    DiskFolderRenameDto,
    DiskFolderRestoreDto,
    DiskFolderShareToUserDto,
    DiskFolderUploadFileDto,
} from '../dtos';

@ApiTags('BX Commands')
@Controller('disk-folder')
export class DiskFolderController {
    constructor(private readonly diskFolderService: DiskFolderService) {}

    @Post('get')
    @ApiOperation({ summary: 'disk.folder.get' })
    @ApiResponse({ status: 200, description: 'Folder data' })
    async get(@Body() dto: DiskFolderGetDto) {
        return await this.diskFolderService.get(dto);
    }

    @Post('getchildren')
    @ApiOperation({ summary: 'disk.folder.getchildren' })
    @ApiResponse({ status: 200, description: 'Folder children data' })
    async getChildren(@Body() dto: DiskFolderGetChildrenDto) {
        return await this.diskFolderService.getchildren(dto);
    }

    @Post('getfields')
    @ApiOperation({ summary: 'disk.folder.getfields' })
    @ApiResponse({ status: 200, description: 'Folder fields meta' })
    async getFields(@Body() _dto: DiskFolderGetFieldsDto) {
        return await this.diskFolderService.getfields();
    }

    @Post('rename')
    @ApiOperation({ summary: 'disk.folder.rename' })
    @ApiResponse({ status: 200, description: 'Renamed folder data' })
    async rename(@Body() dto: DiskFolderRenameDto) {
        return await this.diskFolderService.rename(dto);
    }

    @Post('moveto')
    @ApiOperation({ summary: 'disk.folder.moveto' })
    @ApiResponse({ status: 200, description: 'Moved folder data' })
    async moveTo(@Body() dto: DiskFolderMovetoDto) {
        return await this.diskFolderService.moveto(dto);
    }

    @Post('copyto')
    @ApiOperation({ summary: 'disk.folder.copyto' })
    @ApiResponse({ status: 200, description: 'Copied folder data' })
    async copyTo(@Body() dto: DiskFolderCopyToDto) {
        return await this.diskFolderService.copyto(dto);
    }

    @Post('markdeleted')
    @ApiOperation({ summary: 'disk.folder.markdeleted' })
    @ApiResponse({ status: 200, description: 'Folder moved to trash' })
    async markDeleted(@Body() dto: DiskFolderMarkDeletedDto) {
        return await this.diskFolderService.markdeleted(dto);
    }

    @Post('restore')
    @ApiOperation({ summary: 'disk.folder.restore' })
    @ApiResponse({ status: 200, description: 'Folder restored from trash' })
    async restore(@Body() dto: DiskFolderRestoreDto) {
        return await this.diskFolderService.restore(dto);
    }

    @Post('deletetree')
    @ApiOperation({ summary: 'disk.folder.deletetree' })
    @ApiResponse({ status: 200, description: 'Folder tree deleted' })
    async deleteTree(@Body() dto: DiskFolderDeletetreeDto) {
        return await this.diskFolderService.deletetree(dto);
    }

    @Post('addsubfolder')
    @ApiOperation({ summary: 'disk.folder.addsubfolder' })
    @ApiResponse({ status: 200, description: 'Subfolder created' })
    async addSubfolder(@Body() dto: DiskFolderAddSubfolderDto) {
        return await this.diskFolderService.addsubfolder(dto);
    }

    @Post('sharetouser')
    @ApiOperation({ summary: 'disk.folder.sharetouser' })
    @ApiResponse({ status: 200, description: 'Folder permissions updated' })
    async shareToUser(@Body() dto: DiskFolderShareToUserDto) {
        return await this.diskFolderService.sharetouser(dto);
    }

    @Post('uploadfile')
    @ApiOperation({ summary: 'disk.folder.uploadfile' })
    @ApiResponse({ status: 200, description: 'File uploaded' })
    async uploadFile(@Body() dto: DiskFolderUploadFileDto) {
        return await this.diskFolderService.uploadfile(dto);
    }

    @Post('getexternallink')
    @ApiOperation({ summary: 'disk.folder.getexternallink' })
    @ApiResponse({ status: 200, description: 'Public external link' })
    async getExternalLink(@Body() dto: DiskFolderGetExternalLinkDto) {
        return await this.diskFolderService.getexternallink(dto);
    }
}

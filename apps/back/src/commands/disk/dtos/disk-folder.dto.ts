import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DiskAccessTaskNameDto {
    READ = 'disk_access_read',
    ADD = 'disk_access_add',
    EDIT = 'disk_access_edit',
    FULL = 'disk_access_full',
}

export class DiskAccessRuleDto {
    @ApiProperty({
        description: 'Access level identifier (TASK_ID)',
        example: 79,
    })
    @IsNumber()
    TASK_ID: number;

    @ApiProperty({
        description: 'Access code (ACCESS_CODE)',
        example: 'U1271',
    })
    @IsString()
    ACCESS_CODE: string;
}

export class DiskFolderGetDto {
    @ApiProperty({ example: 8930, description: 'Folder id' })
    @IsNumber()
    id: number;
}

export class DiskFolderGetChildrenDto {
    @ApiProperty({ example: 8930, description: 'Folder id' })
    @IsNumber()
    id: number;

    @ApiProperty({
        example: { NAME: '%test%' },
        description: 'Filter by fields from disk.folder.getfields',
        required: false,
    })
    @IsOptional()
    @IsObject()
    filter?: Record<string, unknown>;

    @ApiProperty({
        example: { NAME: 'DESC' },
        description: 'Sorting by fields (ASC/DESC)',
        required: false,
    })
    @IsOptional()
    @IsObject()
    order?: Record<string, 'ASC' | 'DESC'>;

    @ApiProperty({
        example: 50,
        description: 'Pagination start (start = (N-1)*50)',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    start?: number;
}

export class DiskFolderGetFieldsDto {}

export class DiskFolderRenameDto {
    @ApiProperty({ example: 8930, description: 'Folder id' })
    @IsNumber()
    id: number;

    @ApiProperty({ example: 'New name', description: 'New folder name' })
    @IsString()
    newName: string;
}

export class DiskFolderMovetoDto {
    @ApiProperty({ example: 8968, description: 'Source folder id' })
    @IsNumber()
    id: number;

    @ApiProperty({
        example: 8907,
        description: 'Target folder id',
    })
    @IsNumber()
    targetFolderId: number;
}

export class DiskFolderCopyToDto {
    @ApiProperty({ example: 8968, description: 'Source folder id' })
    @IsNumber()
    id: number;

    @ApiProperty({
        example: 8907,
        description: 'Target folder id',
    })
    @IsNumber()
    targetFolderId: number;
}

export class DiskFolderMarkDeletedDto {
    @ApiProperty({ example: 8930, description: 'Folder id' })
    @IsNumber()
    id: number;
}

export class DiskFolderRestoreDto {
    @ApiProperty({ example: 8996, description: 'Folder id in trash' })
    @IsNumber()
    id: number;
}

export class DiskFolderDeletetreeDto {
    @ApiProperty({
        example: 8942,
        description: 'Folder id (cannot delete storage root)',
    })
    @IsNumber()
    id: number;
}
class DiskFolderAddSubfolderDataDto {
    @ApiProperty({
        example: 'Folder in Folder',
        description: 'New subfolder name',
    })
    @IsString()
    NAME: string;
}
export class DiskFolderAddSubfolderDto {
    @ApiProperty({ example: 8907, description: 'Parent folder id' })
    @IsNumber()
    id: number;

    @ApiProperty({
        example: { NAME: 'Folder in Folder' },
        description: 'Subfolder payload',
    })
    @ValidateNested()
    @Type(() => DiskFolderAddSubfolderDataDto)
    data: DiskFolderAddSubfolderDataDto;
}

export class DiskFolderShareToUserDto {
    @ApiProperty({ example: 8994, description: 'Folder id' })
    @IsNumber()
    id: number;

    @ApiProperty({ example: 1271, description: 'User id' })
    @IsNumber()
    userId: number;

    @ApiProperty({
        example: DiskAccessTaskNameDto.READ,
        enum: DiskAccessTaskNameDto,
        enumName: 'DiskAccessTaskNameDto',
    })
    @IsEnum(DiskAccessTaskNameDto)
    taskName: DiskAccessTaskNameDto;
}
class DiskFolderUploadDataDto {
    @ApiProperty({ example: 'test.png', description: 'File name' })
    @IsString()
    NAME: string;
}

export class DiskFolderUploadFileDto {
    @ApiProperty({ example: 8930, description: 'Folder id' })
    @IsNumber()
    id: number;

    @ApiProperty({
        example: { NAME: 'test.png' },
        description: 'File metadata (NAME)',
    })
    @ValidateNested()
    @Type(() => DiskFolderUploadDataDto)
    data: DiskFolderUploadDataDto;

    @ApiProperty({
        example: ['test.png', 'iVBORw0KGgoAAAANSUhEUgAA...'],
        description: 'Optional file content tuple: [fileName, base64]',
        required: false,
        type: [String],
    })
    @IsOptional()
    @IsArray()
    fileContent?: [string, string];

    @ApiProperty({
        example: [{ TASK_ID: 75, ACCESS_CODE: 'U1271' }],
        description: 'Optional rights array',
        required: false,
        type: [DiskAccessRuleDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DiskAccessRuleDto)
    rights?: DiskAccessRuleDto[];

    @ApiProperty({
        example: true,
        description: 'Generate unique name if file exists',
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    generateUniqueName?: boolean;
}

export class DiskFolderGetExternalLinkDto {
    @ApiProperty({ example: 8930, description: 'Folder id' })
    @IsNumber()
    id: number;
}

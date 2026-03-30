import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DiskStorageAccessTaskNameDto {
    READ = 'disk_access_read',
    ADD = 'disk_access_add',
    EDIT = 'disk_access_edit',
    FULL = 'disk_access_full',
}

export class DiskStorageAccessRuleDto {
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

export class DiskStorageGetDto {
    @ApiProperty({ example: 1357, description: 'Storage id' })
    @IsNumber()
    id: number;
}

export class DiskStorageGetChildrenDto {
    @ApiProperty({ example: 1357, description: 'Storage id' })
    @IsNumber()
    id: number;

    @ApiProperty({
        example: { NAME: '%Папка%' },
        description: 'Filter by fields from disk.storage.getchildren',
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
class DiskStorageUploadDataDto {
    @ApiProperty({ example: 'picture.png', description: 'File name' })
    @IsString()
    NAME: string;
}
export class DiskStorageUploadFileDto {
    @ApiProperty({ example: 1357, description: 'Storage id' })
    @IsNumber()
    id: number;

    @ApiProperty({
        example: { NAME: 'picture.png' },
        description: 'File metadata (NAME)',
    })
    @ValidateNested()
    @Type(() => DiskStorageUploadDataDto)
    data: DiskStorageUploadDataDto;

    @ApiProperty({
        example: ['picture.png', 'iVBORw0KGgoAAAANSUhEUgAA...'],
        description: 'fileContent tuple: [fileName, base64]',
    })
    @IsArray()
    @ValidateNested({ each: true })
    fileContent: [string, string];

    @ApiProperty({
        example: [{ TASK_ID: 79, ACCESS_CODE: 'U1271' }],
        description: 'Optional file rights array',
        required: false,
        type: [DiskStorageAccessRuleDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DiskStorageAccessRuleDto)
    rights?: DiskStorageAccessRuleDto[];

    @ApiProperty({
        example: true,
        description: 'Generate unique file name if file exists',
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    generateUniqueName?: boolean;
}

class DiskStorageAddFolderDataDto {
    @ApiProperty({ example: 'Новая папка', description: 'New folder name' })
    @IsString()
    NAME: string;
}

export class DiskStorageAddFolderDto {
    @ApiProperty({ example: 1357, description: 'Storage id' })
    @IsNumber()
    id: number;

    @ApiProperty({
        example: { NAME: 'Новая папка' },
        description: 'Folder payload',
    })
    @ValidateNested()
    @Type(() => DiskStorageAddFolderDataDto)
    data: DiskStorageAddFolderDataDto;

    @ApiProperty({
        example: [{ TASK_ID: 71, ACCESS_CODE: 'U1271' }],
        description: 'Rights for new folder',
        type: [DiskStorageAccessRuleDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DiskStorageAccessRuleDto)
    rights: DiskStorageAccessRuleDto[];
}

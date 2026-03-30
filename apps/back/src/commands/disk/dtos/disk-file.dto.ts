import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
    IsNumber,
    ArrayMinSize,
    ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DiskFileDeleteDto {
    @ApiProperty({ example: 9037, description: 'File id' })
    @IsNumber()
    id: number;
}

export class DiskFileMoveToDto {
    @ApiProperty({ example: 9035, description: 'File id' })
    @IsNumber()
    id: number;

    @ApiProperty({ example: 8930, description: 'Target folder id' })
    @IsNumber()
    targetFolderId: number;
}

export class DiskFileRestoreDto {
    @ApiProperty({ example: 9037, description: 'File id in trash' })
    @IsNumber()
    id: number;
}

export class DiskFileGetDto {
    @ApiProperty({ example: 9037, description: 'File id' })
    @IsNumber()
    id: number;
}

export class DiskFileGetFieldsDto {}

export class DiskFileGetVersionsDto {
    @ApiProperty({ example: 9043, description: 'File id' })
    @IsNumber()
    id: number;

    @ApiProperty({
        example: { NAME: '%test%' },
        description: 'Filter by fields',
        required: false,
    })
    @IsOptional()
    @IsObject()
    filter?: Record<string, unknown>;
}

export class DiskFileMarkDeletedDto {
    @ApiProperty({ example: 9037, description: 'File id' })
    @IsNumber()
    id: number;
}

export class DiskFileCopyToDto {
    @ApiProperty({ example: 9035, description: 'File id' })
    @IsNumber()
    id: number;

    @ApiProperty({ example: 8930, description: 'Target folder id' })
    @IsNumber()
    targetFolderId: number;
}

export class DiskFileGetExternalLinkDto {
    @ApiProperty({ example: 8964, description: 'File id' })
    @IsNumber()
    id: number;
}

export class DiskFileRenameDto {
    @ApiProperty({ example: 8964, description: 'File id' })
    @IsNumber()
    id: number;

    @ApiProperty({
        example: 'New File Name.png',
        description: 'New file name with extension',
    })
    @IsString()
    newName: string;
}

export class DiskFileUploadVersionDto {
    @ApiProperty({ example: 9043, description: 'File id' })
    @IsNumber()
    id: number;

    @ApiProperty({
        example: ['Test #2.docx', 'UEsDBBQ...'],
        description: 'fileContent tuple: [fileName, base64]',
        type: [String],
    })
    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @ValidateNested({ each: true })
    @Type(() => String)
    fileContent: [string, string];
}

export class DiskFileRestoreFromVersionDto {
    @ApiProperty({ example: 9043, description: 'File id' })
    @IsNumber()
    id: number;

    @ApiProperty({ example: 7199, description: 'Version id' })
    @IsNumber()
    versionId: number;
}

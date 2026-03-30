import { BitrixService } from '@/modules/bitrix';
import { IBitrixResponse } from '@/modules/bitrix/core/interface/bitrix-api.intterface';
import { PBXService } from '@/modules/pbx';
import { Injectable } from '@nestjs/common';

export interface IDiskFile {
    ID?: string;
    NAME?: string;
    CODE?: string | null;
    STORAGE_ID?: string;
    TYPE?: string;
    PARENT_ID?: string;
    DELETED_TYPE?: string | number;
    GLOBAL_CONTENT_VERSION?: string | number;
    FILE_ID?: string | number;
    SIZE?: string | number;
    CREATE_TIME?: string;
    UPDATE_TIME?: string;
    DELETE_TIME?: string | null;
    CREATED_BY?: string | number;
    UPDATED_BY?: string | number;
    DELETED_BY?: string | number | null;
    DOWNLOAD_URL?: string;
    DETAIL_URL?: string;

    // Bitrix может возвращать дополнительные поля.
    [key: string]: unknown;
}

export interface IDiskFileVersion {
    ID?: string;
    OBJECT_ID?: string;
    SIZE?: string | number;
    NAME?: string;
    GLOBAL_CONTENT_VERSION?: string | number;
    CREATE_TIME?: string;
    CREATED_BY?: string | number;
    DOWNLOAD_URL?: string;

    [key: string]: unknown;
}

export interface IDiskFileFieldInfo {
    TYPE?: string;
    USE_IN_FILTER?: boolean;
    USE_IN_SHOW?: boolean;
    [key: string]: unknown;
}

export interface IDiskFileDeleteRequest {
    id: number;
}

export interface IDiskFileMoveToRequest {
    id: number;
    targetFolderId: number;
}

export interface IDiskFileRestoreRequest {
    id: number;
}

export interface IDiskFileGetRequest {
    id: number;
}

export interface IDiskFileGetVersionsRequest {
    id: number;
    filter?: Record<string, unknown>;
}

export interface IDiskFileMarkDeletedRequest {
    id: number;
}

export interface IDiskFileCopyToRequest {
    id: number;
    targetFolderId: number;
}

export interface IDiskFileGetExternalLinkRequest {
    id: number;
}

export interface IDiskFileRenameRequest {
    id: number;
    newName: string;
}

export interface IDiskFileUploadVersionRequest {
    id: number;
    fileContent: [string, string]; // [fileName, base64]
}

export interface IDiskFileRestoreFromVersionRequest {
    id: number;
    versionId: number;
}
@Injectable()
export class DiskFileService {
    private bitrix: BitrixService;

    constructor(private readonly pbx: PBXService) {}

    async init() {
        const domain = process.env.BITRIX_DOMAIN;
        if (!domain) {
            throw new Error('BITRIX_DOMAIN is not set');
        }

        const { bitrix } = await this.pbx.init(domain);
        this.bitrix = bitrix;
    }

    async delete(request: IDiskFileDeleteRequest): Promise<boolean> {
        const response = (await this.bitrix.api.call(
            'disk.file.delete',
            request,
        )) as IBitrixResponse<boolean>;

        return response.result;
    }

    async moveto(request: IDiskFileMoveToRequest): Promise<IDiskFile> {
        const response = (await this.bitrix.api.call(
            'disk.file.moveto',
            request,
        )) as IBitrixResponse<IDiskFile>;

        return response.result;
    }

    async restore(request: IDiskFileRestoreRequest): Promise<IDiskFile> {
        const response = (await this.bitrix.api.call(
            'disk.file.restore',
            request,
        )) as IBitrixResponse<IDiskFile>;

        return response.result;
    }

    async get(request: IDiskFileGetRequest): Promise<IDiskFile> {
        const response = (await this.bitrix.api.call(
            'disk.file.get',
            request,
        )) as IBitrixResponse<IDiskFile>;

        return response.result;
    }

    async getfields(): Promise<Record<string, IDiskFileFieldInfo>> {
        const response = (await this.bitrix.api.call(
            'disk.file.getfields',
            {},
        )) as IBitrixResponse<Record<string, IDiskFileFieldInfo>>;

        return response.result;
    }

    async getVersions(
        request: IDiskFileGetVersionsRequest,
    ): Promise<IDiskFileVersion[]> {
        const response = (await this.bitrix.api.call(
            'disk.file.getVersions',
            request,
        )) as IBitrixResponse<IDiskFileVersion[]>;

        return response.result;
    }

    async markdeleted(
        request: IDiskFileMarkDeletedRequest,
    ): Promise<IDiskFile> {
        const response = (await this.bitrix.api.call(
            'disk.file.markdeleted',
            request,
        )) as IBitrixResponse<IDiskFile>;

        return response.result;
    }

    async copyto(request: IDiskFileCopyToRequest): Promise<IDiskFile> {
        const response = (await this.bitrix.api.call(
            'disk.file.copyto',
            request,
        )) as IBitrixResponse<IDiskFile>;

        return response.result;
    }

    async getExternalLink(
        request: IDiskFileGetExternalLinkRequest,
    ): Promise<string> {
        const response = (await this.bitrix.api.call(
            'disk.file.getExternalLink',
            request,
        )) as IBitrixResponse<string>;

        return response.result;
    }

    async rename(request: IDiskFileRenameRequest): Promise<IDiskFile> {
        const response = (await this.bitrix.api.call(
            'disk.file.rename',
            request,
        )) as IBitrixResponse<IDiskFile>;

        return response.result;
    }

    async uploadversion(
        request: IDiskFileUploadVersionRequest,
    ): Promise<IDiskFile> {
        const response = (await this.bitrix.api.call(
            'disk.file.uploadversion',
            request,
        )) as IBitrixResponse<IDiskFile>;

        return response.result;
    }

    async restoreFromVersion(
        request: IDiskFileRestoreFromVersionRequest,
    ): Promise<IDiskFile> {
        const response = (await this.bitrix.api.call(
            'disk.file.restoreFromVersion',
            request,
        )) as IBitrixResponse<IDiskFile>;

        return response.result;
    }
}

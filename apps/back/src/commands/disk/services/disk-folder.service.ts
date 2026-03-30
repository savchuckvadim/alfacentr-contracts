import { BitrixService } from '@/modules/bitrix';
import { IBitrixResponse } from '@/modules/bitrix/core/interface/bitrix-api.intterface';
import { PBXService } from '@/modules/pbx';
import { Injectable } from '@nestjs/common';

export interface IDiskFolderItem {
    ID?: string;
    NAME?: string;
    CODE?: string | null;
    STORAGE_ID?: string;
    TYPE?: string;
    REAL_OBJECT_ID?: string;
    PARENT_ID?: string;
    DELETED_TYPE?: string | number;
    CREATE_TIME?: string;
    UPDATE_TIME?: string;
    DELETE_TIME?: string | null;
    CREATED_BY?: string | number;
    UPDATED_BY?: string | number;
    DELETED_BY?: string | number | null;
    DETAIL_URL?: string;

    // Для файлов, которые могут возвращаться в `getchildren` / `uploadfile`.
    DOWNLOAD_URL?: string;
    GLOBAL_CONTENT_VERSION?: string | number;
    FILE_ID?: string | number;
    SIZE?: string | number;

    [key: string]: unknown;
}

export type IDiskStorageType = string;

export interface IDiskAccessRule {
    TASK_ID: number;
    ACCESS_CODE: string;
}

export interface IDiskFolderGetRequest {
    id: number;
}

export interface IDiskFolderRenameRequest {
    id: number;
    newName: string;
}

export interface IDiskFolderMoveToRequest {
    id: number;
    targetFolderId: number;
}

export interface IDiskFolderMarkDeletedRequest {
    id: number;
}

export interface IDiskFolderRestoreRequest {
    id: number;
}

export interface IDiskFolderDeleteTreeRequest {
    id: number;
}

export interface IDiskFolderAddSubfolderRequest {
    id: number;
    data: {
        NAME: string;
    };
}

export type DiskAccessTaskName =
    | 'disk_access_read'
    | 'disk_access_add'
    | 'disk_access_edit'
    | 'disk_access_full';

export interface IDiskFolderShareToUserRequest {
    id: number;
    userId: number;
    taskName: DiskAccessTaskName;
}

export interface IDiskFolderGetChildrenRequest {
    id?: number;
    filter?: Record<string, unknown>;
    order?: Record<string, 'ASC' | 'DESC'>;
    start?: number;
}

export interface IDiskFolderFieldsInfo {
    TYPE?: string;
    USE_IN_FILTER?: boolean;
    USE_IN_SHOW?: boolean;
    [key: string]: unknown;
}

export interface IDiskFolderUploadFileRequest {
    id: number;
    data: {
        NAME: string;
    };
    fileContent?: [string, string]; // [fileName, base64]
    rights?: IDiskAccessRule[];
    generateUniqueName?: boolean;
}

export interface IDiskFolderGetExternalLinkRequest {
    id: number;
}
@Injectable()
export class DiskFolderService {
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

    async get(request: IDiskFolderGetRequest): Promise<IDiskFolderItem> {
        const response = (await this.bitrix.api.call(
            'disk.folder.get',
            request,
        )) as IBitrixResponse<IDiskFolderItem>;

        return response.result;
    }

    async getchildren(
        request: IDiskFolderGetChildrenRequest,
    ): Promise<IDiskFolderItem[]> {
        const response = (await this.bitrix.api.call(
            'disk.folder.getchildren',
            request,
        )) as IBitrixResponse<IDiskFolderItem[]>;

        return response.result;
    }

    async getfields(): Promise<Record<string, IDiskFolderFieldsInfo>> {
        const response = (await this.bitrix.api.call(
            'disk.folder.getfields',
            {},
        )) as IBitrixResponse<Record<string, IDiskFolderFieldsInfo>>;

        return response.result;
    }

    async rename(request: IDiskFolderRenameRequest): Promise<IDiskFolderItem> {
        const response = (await this.bitrix.api.call(
            'disk.folder.rename',
            request,
        )) as IBitrixResponse<IDiskFolderItem>;

        return response.result;
    }

    async moveto(
        request: IDiskFolderMoveToRequest,
    ): Promise<IDiskFolderItem | false> {
        const response = (await this.bitrix.api.call(
            'disk.folder.moveto',
            request,
        )) as IBitrixResponse<IDiskFolderItem | false>;

        return response.result;
    }

    async copyto(
        request: IDiskFolderMoveToRequest,
    ): Promise<IDiskFolderItem | false> {
        const response = (await this.bitrix.api.call(
            'disk.folder.copyto',
            request,
        )) as IBitrixResponse<IDiskFolderItem | false>;

        return response.result;
    }

    async markdeleted(
        request: IDiskFolderMarkDeletedRequest,
    ): Promise<IDiskFolderItem> {
        const response = (await this.bitrix.api.call(
            'disk.folder.markdeleted',
            request,
        )) as IBitrixResponse<IDiskFolderItem>;

        return response.result;
    }

    async restore(
        request: IDiskFolderRestoreRequest,
    ): Promise<IDiskFolderItem> {
        const response = (await this.bitrix.api.call(
            'disk.folder.restore',
            request,
        )) as IBitrixResponse<IDiskFolderItem>;

        return response.result;
    }

    async deletetree(request: IDiskFolderDeleteTreeRequest): Promise<boolean> {
        const response = (await this.bitrix.api.call(
            'disk.folder.deletetree',
            request,
        )) as IBitrixResponse<boolean>;

        return response.result;
    }

    async addsubfolder(
        request: IDiskFolderAddSubfolderRequest,
    ): Promise<IDiskFolderItem> {
        const response = (await this.bitrix.api.call(
            'disk.folder.addsubfolder',
            request,
        )) as IBitrixResponse<IDiskFolderItem>;

        return response.result;
    }

    async sharetouser(
        request: IDiskFolderShareToUserRequest,
    ): Promise<boolean> {
        const response = (await this.bitrix.api.call(
            'disk.folder.sharetouser',
            request,
        )) as IBitrixResponse<boolean>;

        return response.result;
    }

    async uploadfile(
        request: IDiskFolderUploadFileRequest,
    ): Promise<IDiskFolderItem> {
        const response = (await this.bitrix.api.call(
            'disk.folder.uploadfile',
            request,
        )) as IBitrixResponse<IDiskFolderItem>;

        return response.result;
    }

    async getexternallink(
        request: IDiskFolderGetExternalLinkRequest,
    ): Promise<string> {
        const response = (await this.bitrix.api.call(
            'disk.folder.getexternallink',
            request,
        )) as IBitrixResponse<string>;

        return response.result;
    }
}

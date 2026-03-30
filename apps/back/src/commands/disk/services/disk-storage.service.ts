import { BitrixService } from '@/modules/bitrix';
import { IBitrixResponse } from '@/modules/bitrix/core/interface/bitrix-api.intterface';
import { PBXService } from '@/modules/pbx';
import { Injectable } from '@nestjs/common';

export interface IBXStorage {
    ID: string;
    NAME: string;
    CODE: string | null;
    MODULE_ID: string;
    ENTITY_TYPE: string;
    ENTITY_ID: string;
    ROOT_OBJECT_ID: string;
}

export type IDiskStorageType = string;

export interface IDiskAccessRule {
    TASK_ID: number;
    ACCESS_CODE: string;
}

export interface IDiskChildItem {
    ID: string;
    NAME: string;
    CODE: string | null;
    STORAGE_ID: string;
    TYPE: string;
    REAL_OBJECT_ID: string;
    PARENT_ID: string;
    DELETED_TYPE: string | number;
    DETAIL_URL?: string;

    // Bitrix возвращает много дополнительных полей.
    // Оставляем возможность не описывать всё заранее.
    [key: string]: unknown;
}

export interface IDiskUploadFileRequest {
    id: number;
    data: {
        NAME: string;
    };
    fileContent: [string, string]; // [fileName, base64]
    rights?: IDiskAccessRule[];
    generateUniqueName?: boolean;
}

export interface IDiskAddFolderRequest {
    id: number;
    data: {
        NAME: string;
    };
    rights: IDiskAccessRule[];
}

export interface IDiskGetChildrenRequest {
    id: number;
    filter?: Record<string, unknown>;
    order?: Record<string, 'ASC' | 'DESC'>;
    start?: number;
}
@Injectable()
export class DiskStorageService {
    private bitrix: BitrixService;
    constructor(private readonly pbx: PBXService) {
        this.init().catch((error) => {
            console.error(error);
            throw error;
        });
    }

    async init() {
        const domain = process.env.BITRIX_DOMAIN;
        if (!domain) {
            throw new Error('BITRIX_DOMAIN is not set');
        }
        const { bitrix } = await this.pbx.init(domain);
        this.bitrix = bitrix;
    }

    async getlist(): Promise<IBXStorage[]> {
        const response = (await this.bitrix.api.call(
            'disk.storage.getlist',
            {},
        )) as IBitrixResponse<IBXStorage[]>;
        return response.result;
    }

    async gettypes(): Promise<IDiskStorageType[]> {
        const response = (await this.bitrix.api.call(
            'disk.storage.gettypes',
            {},
        )) as IBitrixResponse<IDiskStorageType[]>;
        return response.result;
    }

    async get(id: number): Promise<IBXStorage> {
        const response = (await this.bitrix.api.call('disk.storage.get', {
            id,
        })) as IBitrixResponse<IBXStorage>;
        return response.result;
    }

    async uploadfile(request: IDiskUploadFileRequest): Promise<IDiskChildItem> {
        const response = (await this.bitrix.api.call(
            'disk.storage.uploadfile',
            request,
        )) as IBitrixResponse<IDiskChildItem>;
        return response.result;
    }

    async addfolder(request: IDiskAddFolderRequest): Promise<IDiskChildItem> {
        const response = (await this.bitrix.api.call(
            'disk.storage.addfolder',
            request,
        )) as IBitrixResponse<IDiskChildItem>;
        return response.result;
    }

    async getchildren(
        request: IDiskGetChildrenRequest,
    ): Promise<IDiskChildItem[]> {
        const response = (await this.bitrix.api.call(
            'disk.storage.getchildren',
            request,
        )) as IBitrixResponse<IDiskChildItem[]>;
        return response.result;
    }
}

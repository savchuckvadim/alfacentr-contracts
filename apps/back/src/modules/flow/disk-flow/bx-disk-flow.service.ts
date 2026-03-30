import { delay } from '@/lib';
import { BitrixService, IBXDiskFolderItem, IBXDiskStorageChildItem } from '@/modules/bitrix';
import { ConfigService } from '@nestjs/config';


export class BxDiskFlowService {
    private storageId: string;
    constructor(
        private readonly bitrix: BitrixService,
        private readonly dealId: number,
    ) {
        const configService = new ConfigService();
        const storageId = configService.get<string>('BX_STORAGE_ID');


        if (!storageId) {
            throw new Error('Storage ID is not set');
        }
        this.storageId = storageId;
    }

    public async upload(files: [string, string][]): Promise<{
        uploadedFiles: IBXDiskFolderItem[],
        folderUrl: string | undefined,
    }> {
        const existingStoragefolder = await this.getExistingFolder();
        const newStoragefolder = await this.refreshExistingFolder(existingStoragefolder);
        if (!newStoragefolder || !newStoragefolder.ID ) {
            throw new Error('New storage folder ID is not set');
        }
        const folderId = Number(newStoragefolder.ID);
        const uploadedFiles = await this.uploadFiles(folderId, files);
        return {uploadedFiles, folderUrl: newStoragefolder.DETAIL_URL};

    }

    public async get(): Promise<{ files: [string, string][] }> {
        const storagefolder = await this.getExistingFolder();
        if (!storagefolder) {
            throw new Error('Storage folder is not found');
        }
        const folderId = Number(storagefolder.ID);
        const filesFromFolder = await this.getFiles(folderId);

        const files: [string, string][] = [];
        for (const fileFromFolder of filesFromFolder) {
            const file = await this.bitrix.file.downloadBitrixFileAndConvertToBase64(
                fileFromFolder.DOWNLOAD_URL || '',
            );
            files.push(file);
            await delay(700);
        }


        return { files };

    }

    private async getExistingFolder(): Promise<IBXDiskStorageChildItem | null> {
        const storagefoldersResponse =
            await this.bitrix.disk.storage.getchildren({
                id: this.storageId,
                filter: {
                    TYPE: 'folder',
                    NAME: this.dealId.toString(),
                },
            });

        const storagefolder = storagefoldersResponse.result?.length
            ? storagefoldersResponse.result[0]
            : null;

        return storagefolder;
    }

    private async refreshExistingFolder(existingStoragefolder: IBXDiskStorageChildItem | null): Promise<IBXDiskStorageChildItem | null> {
        if (existingStoragefolder) {
            //если папка существует, то удаляем ее
            void (await this.bitrix.disk.folder.deletetree({
                id: Number(existingStoragefolder.ID),
            }));

        }


        const storagefoldersResponse =
            await this.bitrix.disk.storage.addfolder({
                id: Number(this.storageId),
                data: {
                    NAME: this.dealId.toString(),
                },
                rights: [],
            });
        const newStoragefolder = storagefoldersResponse.result;
        return newStoragefolder;
    }

    private async uploadFiles(folderId: number, files: [string, string][]): Promise<IBXDiskFolderItem[]> {
        const results: IBXDiskFolderItem[] = [];
        for (const file of files) {
            const response = await this.bitrix.disk.folder.uploadfile({
                id: folderId,
                data: {
                    NAME: file[0],
                },
                fileContent: file,
            });
            results.push(response.result);
            await delay(1000);
        }
        return results;
    }

    private async getFiles(folderId: number): Promise<IBXDiskFolderItem[]> {
        const filesResponse = await this.bitrix.disk.folder.getchildren({
            id: folderId,
            filter: {
                TYPE: 'file',
            },
        });
        return filesResponse.result;
    }

}

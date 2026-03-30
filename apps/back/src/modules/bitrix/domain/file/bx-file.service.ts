import { Injectable, Logger } from '@nestjs/common';
import { BxFileRepository } from './bx-file.repository';
import axios, { AxiosError } from 'axios';
import { BitrixBaseApi } from '../../core';

@Injectable()
export class BxFileService {
    private readonly logger = new Logger(BxFileService.name);
    private repo: BxFileRepository;
    clone(api: BitrixBaseApi): BxFileService {
        const instance = new BxFileService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxFileRepository(api);
    }

    public async getFile(id: number) {
        try {
            return await this.repo.get(id);
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    public async downloadBitrixFileAndConvertToBase64(
        url: string,
        name?: string,
    ): Promise<[string, string]> {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer', // 👈 обязательно!
            });
            const contentDisposition = response.headers[
                'content-disposition'
            ] as string | undefined;
            const filename =
                this.getFilenameFromDisposition(contentDisposition) ||
                `${name}.docx`;

            const fileBuffer = Buffer.from(response.data);

            const base64 = fileBuffer.toString('base64');

            return [filename, base64];
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    private getFilenameFromDisposition(header?: string): string | undefined {
        if (!header) {
            return undefined;
        }
        // Пробуем сначала filename*=utf-8''
        const utf8Match = header.match(/filename\*=utf-8''([^;]+)/i);
        if (utf8Match) {
            return decodeURIComponent(utf8Match[1]);
        }

        // Иначе обычный filename="..."
        const asciiMatch = header.match(/filename="([^"]+)"/i);
        if (asciiMatch) {
            return asciiMatch[1];
        }

        return undefined;
    }

    private handleError(error: unknown) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<unknown>;
            const status = axiosError.response?.status;
            const statusText = axiosError.response?.statusText;
            const method = axiosError.config?.method?.toUpperCase();
            const requestUrl = axiosError.config?.url ?? 'unknown';
            const responseData =
                typeof axiosError.response?.data === 'string'
                    ? axiosError.response.data
                    : JSON.stringify(axiosError.response?.data ?? null);

            this.logger.error(
                `Bitrix file failed: ${method ?? 'GET'} ${requestUrl} -> ${status ?? 'NO_STATUS'} ${statusText ?? ''}`.trim(),
            );
            this.logger.error(`Bitrix response payload: ${responseData}`);

            throw new Error(
                `Bitrix file  failed (${status ?? 'NO_STATUS'}) for ${requestUrl}`,
            );
        }
    }
}

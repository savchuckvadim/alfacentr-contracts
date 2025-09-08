import { Injectable } from '@nestjs/common';
import { BxFileRepository } from './bx-file.repository';
import axios from 'axios';
import { BitrixBaseApi } from '../../core';

@Injectable()
export class BxFileService {
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
        return await this.repo.get(id);
    }

    public async downloadBitrixFileAndConvertToBase64(
        url: string,
        name?: string,
    ): Promise<[string, string]> {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer', // 👈 обязательно!
            });
            const contentDisposition = response.headers['content-disposition'];
            const filename =
                this.getFilenameFromDisposition(contentDisposition) ||
                `${name}.docx`;

            const fileBuffer = Buffer.from(response.data);

            const base64 = fileBuffer.toString('base64');

            return [filename, base64];
        } catch (error) {
            console.log('error');
            console.log(error);
            throw error;
        }
    }

    private getFilenameFromDisposition(header: string): string | undefined {
        // Пробуем сначала filename*=utf-8''
        const utf8Match = header.match(/filename\*\=utf-8''([^;]+)/i);
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
}

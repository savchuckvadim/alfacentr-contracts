import { Injectable } from '@nestjs/common';
import { NameUtil } from '@/lib/utils/name';

@Injectable()
export class CaseService {
    /**
     * Склоняет текст по словам
     * @param value - текст для склонения
     * @returns склоненный текст
     */
    declineText(value: string): string {
        if (!value || value.trim() === '') {
            return '';
        }

        const words: string = value.trim();

        const declinedWord = NameUtil.declineWord(words);
        return declinedWord;
    }
}

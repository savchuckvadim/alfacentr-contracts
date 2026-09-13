import { Injectable } from '@nestjs/common';

/** Заголовок задачи в Битриксе не должен быть простынёй */
const TITLE_LIMIT = 90;
/** В карточке оператору полный текст не нужен, нужен смысл */
const CARD_LIMIT = 700;

/**
 * Правила превращения сообщения из чата в задачу и в карточку.
 *
 * Вынесено в отдельный сервис, потому что это единственное место, где текст
 * человека превращается в служебные строки, и правила будут меняться.
 */
@Injectable()
export class BotRequestTextService {
    /**
     * Чистит текст сообщения от разметки Битрикса.
     *
     * В сообщениях живут BB-коды: упоминания вида [USER=502]Вадим[/USER],
     * ссылки [URL=...]текст[/URL], выделения. В заголовке задачи они выглядят
     * мусором, а упоминание бота вообще не несёт смысла.
     */
    clean(text: string): string {
        return String(text ?? '')
            .replace(/\[USER=\d+\](.*?)\[\/USER\]/gi, '')
            .replace(/\[URL=([^\]]+)\](.*?)\[\/URL\]/gi, '$2')
            .replace(/\[\/?[A-Z][^\]]*\]/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /** Заголовок задачи: первое предложение, обрезанное по слову */
    taskTitle(text: string): string {
        const cleaned = this.clean(text);
        if (!cleaned) return 'Обращение из чата без текста';

        const firstSentence = cleaned.split(/(?<=[.!?])\s/)[0] || cleaned;
        const candidate = firstSentence.length > 20 ? firstSentence : cleaned;
        return this.cut(candidate, TITLE_LIMIT);
    }

    /** Текст для карточки оператору */
    cardText(text: string): string {
        return this.cut(this.clean(text), CARD_LIMIT) || 'сообщение без текста';
    }

    /**
     * Считать ли сообщение обращением.
     *
     * В групповом чате событие и так приходит только при упоминании бота,
     * но приходит и на пустые сообщения, и на одни смайлики — из них задача
     * бессмысленна.
     */
    isRequest(text: string): boolean {
        return this.clean(text).length >= 3;
    }

    private cut(text: string, limit: number): string {
        if (text.length <= limit) return text;
        const head = text.slice(0, limit);
        const lastSpace = head.lastIndexOf(' ');
        return (lastSpace > limit * 0.6 ? head.slice(0, lastSpace) : head).trimEnd() + '…';
    }
}

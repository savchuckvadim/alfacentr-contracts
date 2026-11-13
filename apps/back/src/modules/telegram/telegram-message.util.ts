/**
 * Примитивы отправки: троттлинг-окно и подготовка текста. Лежат отдельно
 * от сервиса, чтобы их можно было гонять в jest как чистые функции.
 */

/** Максимум сообщений в минуту */
export const TELEGRAM_MAX_MESSAGES_PER_MINUTE = 20;

/** Скользящее окно троттлинга, мс */
export const TELEGRAM_THROTTLE_WINDOW_MS = 60_000;

/**
 * Лимит Telegram — 4096 символов; берём с запасом под префиксы, которые
 * сервисы дописывают спереди («NEST alfacentr: » и т.п.)
 */
export const TELEGRAM_MAX_MESSAGE_LENGTH = 4000;

/**
 * Скользящее окно «не больше N отправок в минуту» на уровне сервиса:
 * накрывает все входы разом. Без потолка зацикленный крон или ошибка в
 * цикле упирают бота в лимиты Telegram (429), и настоящие тревоги
 * перестают доходить.
 */
export class TelegramSendWindow {
    private sentAt: number[] = [];

    constructor(
        private readonly maxPerMinute: number = TELEGRAM_MAX_MESSAGES_PER_MINUTE,
    ) {}

    /** true — отправка разрешена и учтена; false — лимит окна исчерпан */
    tryConsume(now: number = Date.now(), count: number = 1): boolean {
        this.sentAt = this.sentAt.filter(
            (ts) => now - ts < TELEGRAM_THROTTLE_WINDOW_MS,
        );
        if (this.sentAt.length + count > this.maxPerMinute) return false;
        for (let i = 0; i < count; i += 1) this.sentAt.push(now);
        return true;
    }
}

/**
 * Текст → безопасный для `parse_mode: 'Markdown'` (legacy v1) + обрезка.
 *
 * Экранируются ТОЛЬКО четыре символа, открывающие сущности Markdown v1
 * (`_`, `*`, `` ` ``, `[`) — ровно те, из-за которых Telegram отвечает 400
 * «can't parse entities» и сообщение теряется. Прежняя реализация
 * экранировала в два прохода и «всё подряд»: в чат приезжал частокол
 * обратных слешей, потому что v1 не понимает экранирование прочего.
 */
export const toTelegramMarkdownText = (text: string): string =>
    String(text ?? '')
        .replace(/[_*[`]/g, (symbol) => `\\${symbol}`)
        .slice(0, TELEGRAM_MAX_MESSAGE_LENGTH);

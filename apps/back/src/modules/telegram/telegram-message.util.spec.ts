import {
    TELEGRAM_MAX_MESSAGE_LENGTH,
    TelegramSendWindow,
    toTelegramMarkdownText,
} from './telegram-message.util';

describe('toTelegramMarkdownText', () => {
    it('экранирует только символы разметки Markdown v1', () => {
        expect(toTelegramMarkdownText('a_b*c`d[e')).toBe('a\\_b\\*c\\`d\\[e');
    });

    it('точки и скобки не трогает: v1 их экранирование не понимает', () => {
        expect(toTelegramMarkdownText('сделка 203940. (крон)')).toBe(
            'сделка 203940. (крон)',
        );
    });

    it('экранирует в один проход, без частокола слешей', () => {
        expect(toTelegramMarkdownText('a_b')).toBe('a\\_b');
    });

    it('длинный текст обрезается до лимита', () => {
        const text = 'я'.repeat(TELEGRAM_MAX_MESSAGE_LENGTH + 500);
        expect(toTelegramMarkdownText(text)).toHaveLength(
            TELEGRAM_MAX_MESSAGE_LENGTH,
        );
    });

    it('пустое и нестроковое значение не роняют отправку', () => {
        expect(toTelegramMarkdownText('')).toBe('');
        expect(toTelegramMarkdownText(undefined as unknown as string)).toBe('');
    });
});

describe('TelegramSendWindow', () => {
    it('пропускает до лимита и отбивает лишнее', () => {
        const window = new TelegramSendWindow(2);
        expect(window.tryConsume(1000)).toBe(true);
        expect(window.tryConsume(1000)).toBe(true);
        expect(window.tryConsume(1000)).toBe(false);
    });

    it('через минуту окно освобождается', () => {
        const window = new TelegramSendWindow(1);
        expect(window.tryConsume(1000)).toBe(true);
        expect(window.tryConsume(30_000)).toBe(false);
        expect(window.tryConsume(62_000)).toBe(true);
    });

    it('резерв нескольких сообщений — всё или ничего', () => {
        const window = new TelegramSendWindow(3);
        expect(window.tryConsume(1000, 4)).toBe(false);
        //неудачный резерв не занял места
        expect(window.tryConsume(1000, 3)).toBe(true);
    });
});

import {
    buildBitrixErrorMessage,
    describeError,
    extractEntityId,
    MAX_PAYLOAD_LENGTH,
    summarizePayload,
} from './bitrix-error-message.util';

const domain = 'alfacentr.bitrix24.ru';

describe('extractEntityId', () => {
    it('находит номер сделки', () => {
        expect(extractEntityId({ ID: 204296, fields: {} })).toBe('ID=204296');
    });

    it('находит идентификатор внутри fields у crm.item', () => {
        expect(extractEntityId({ entityTypeId: 1036, fields: { id: 2372 } })).toBe(
            'fields.id=2372',
        );
    });

    it('молчит, когда опознать нечего', () => {
        expect(extractEntityId({ EMAIL: [{ VALUE: 'a@b.c' }] })).toBe('');
        expect(extractEntityId(null)).toBe('');
        expect(extractEntityId('строка')).toBe('');
    });
});

describe('summarizePayload', () => {
    it('длинный запрос режется', () => {
        const long = { items: 'х'.repeat(MAX_PAYLOAD_LENGTH * 2) };
        const result = summarizePayload(long);

        expect(result.length).toBeLessThanOrEqual(MAX_PAYLOAD_LENGTH + 1);
        expect(result.endsWith('…')).toBe(true);
    });

    it('пустые данные не показываем', () => {
        expect(summarizePayload({})).toBe('');
        expect(summarizePayload(undefined)).toBe('');
        expect(summarizePayload(null)).toBe('');
    });

    it('циклическая ссылка не роняет отправку', () => {
        const cyclic: Record<string, unknown> = { a: 1 };
        cyclic.self = cyclic;

        expect(summarizePayload(cyclic)).toBe('');
    });
});

describe('describeError', () => {
    it('берёт тело ответа портала', () => {
        const error = {
            response: {
                data: {
                    error: 'ERROR_CORE',
                    error_description: 'Поле "Рабочий e-mail" некорректно',
                },
            },
        };

        expect(describeError(error)).toContain('ERROR_CORE');
    });

    it('без ответа берёт текст ошибки', () => {
        expect(describeError(new Error('socket hang up'))).toBe(
            'socket hang up',
        );
    });
});

describe('buildBitrixErrorMessage', () => {
    it('в сообщении есть метод, портал, сущность и ответ', () => {
        const message = buildBitrixErrorMessage(
            {
                method: 'crm.deal.update',
                domain,
                data: { ID: 204296, fields: { TITLE: 'Семинар' } },
            },
            {
                response: {
                    data: { error_description: 'Поле некорректно' },
                },
            },
        );

        expect(message).toContain('crm.deal.update');
        expect(message).toContain(domain);
        expect(message).toContain('ID=204296');
        expect(message).toContain('Поле некорректно');
    });

    it('сообщение собирается и без данных запроса', () => {
        const message = buildBitrixErrorMessage(
            { method: 'crm.contact.add', domain },
            new Error('socket hang up'),
        );

        expect(message).toContain('crm.contact.add');
        expect(message).toContain('socket hang up');
    });
});

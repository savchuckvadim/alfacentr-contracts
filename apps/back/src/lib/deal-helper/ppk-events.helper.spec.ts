import {
    getInvalidPpkEvents,
    getNextPpkEventDate,
    IPpkEvent,
    isPpkEventDatesValid,
    mergePpkEventsWithTopics,
    parsePpkEvents,
    serializePpkEvents,
} from '@alfa/entities';

const event = (
    topic: string,
    dateFrom = '',
    dateTo = '',
): IPpkEvent => ({ topic, dateFrom, dateTo });

describe('parsePpkEvents', () => {
    it('разбирает сохраненное значение', () => {
        const raw = serializePpkEvents([
            event('Программа А', '2026-06-01', '2026-08-31'),
        ]);

        expect(parsePpkEvents(raw)).toEqual([
            event('Программа А', '2026-06-01', '2026-08-31'),
        ]);
    });

    it('пустое значение — пустой список', () => {
        expect(parsePpkEvents('')).toEqual([]);
        expect(parsePpkEvents(null)).toEqual([]);
        expect(parsePpkEvents(undefined)).toEqual([]);
    });

    it('битый json не роняет обработку заявки', () => {
        expect(parsePpkEvents('{не json')).toEqual([]);
        expect(parsePpkEvents('{"v":1}')).toEqual([]);
    });

    it('записи без темы отбрасываются: без ключа связи они бесполезны', () => {
        const raw = JSON.stringify({
            v: 1,
            events: [{ topic: '', dateFrom: '2026-01-01', dateTo: '2026-02-01' }],
        });

        expect(parsePpkEvents(raw)).toEqual([]);
    });
});

describe('serializePpkEvents', () => {
    it('пустой список пишется пустой строкой, а не пустым json', () => {
        expect(serializePpkEvents([])).toBe('');
    });

    it('данные переживают полный цикл записи и чтения', () => {
        const events = [
            event('Программа А', '2026-06-01', '2026-08-31'),
            event('Программа Б'),
        ];

        expect(parsePpkEvents(serializePpkEvents(events))).toEqual(events);
    });
});

describe('mergePpkEventsWithTopics', () => {
    it('сохраненные даты подставляются к своим программам', () => {
        const { events } = mergePpkEventsWithTopics(
            [event('Программа А', '2026-06-01', '2026-08-31')],
            ['Программа А'],
        );

        expect(events).toEqual([
            event('Программа А', '2026-06-01', '2026-08-31'),
        ]);
    });

    it('новая программа появляется с пустыми датами', () => {
        const { events } = mergePpkEventsWithTopics(
            [event('Программа А', '2026-06-01', '2026-08-31')],
            ['Программа А', 'Программа Б'],
        );

        expect(events).toHaveLength(2);
        expect(events[1]).toEqual(event('Программа Б'));
    });

    it('снятая программа уходит в orphaned, а не пропадает молча', () => {
        const { events, orphanedEvents } = mergePpkEventsWithTopics(
            [
                event('Программа А', '2026-06-01', '2026-08-31'),
                event('Переименованная', '2026-05-01', '2026-05-30'),
            ],
            ['Программа А'],
        );

        expect(events).toHaveLength(1);
        expect(orphanedEvents).toEqual([
            event('Переименованная', '2026-05-01', '2026-05-30'),
        ]);
    });

    it('дубли программ схлопываются', () => {
        const { events } = mergePpkEventsWithTopics(
            [],
            ['Программа А', 'Программа А'],
        );

        expect(events).toHaveLength(1);
    });

    it('пустой ввод не ломает мердж', () => {
        expect(mergePpkEventsWithTopics([], [])).toEqual({
            events: [],
            orphanedEvents: [],
        });
    });
});

describe('isPpkEventDatesValid / getInvalidPpkEvents', () => {
    it('обе даты заполнены и начало не позже окончания', () => {
        expect(
            isPpkEventDatesValid(event('А', '2026-06-01', '2026-08-31')),
        ).toBe(true);
    });

    it('одна дата в один день — допустимо', () => {
        expect(
            isPpkEventDatesValid(event('А', '2026-06-01', '2026-06-01')),
        ).toBe(true);
    });

    it('начало позже окончания — ошибка', () => {
        expect(
            isPpkEventDatesValid(event('А', '2026-09-01', '2026-06-01')),
        ).toBe(false);
    });

    it('незаполненные даты — ошибка', () => {
        expect(isPpkEventDatesValid(event('А', '', '2026-06-01'))).toBe(false);
        expect(isPpkEventDatesValid(event('А', '2026-06-01', ''))).toBe(false);
    });

    it('список невалидных собирается для подсветки в модалке', () => {
        const invalid = getInvalidPpkEvents([
            event('А', '2026-06-01', '2026-08-31'),
            event('Б'),
            event('В', '2026-09-01', '2026-06-01'),
        ]);

        expect(invalid.map((e) => e.topic)).toEqual(['Б', 'В']);
    });
});

describe('getNextPpkEventDate', () => {
    it('берет ближайшую дату начала, которая еще не прошла', () => {
        const events = [
            event('А', '2026-08-01', '2026-08-31'),
            event('Б', '2026-06-01', '2026-06-30'),
        ];

        expect(getNextPpkEventDate(events, '2026-05-01')).toBe('2026-06-01');
    });

    it('прошедшие даты не учитываются', () => {
        const events = [
            event('А', '2026-01-01', '2026-02-01'),
            event('Б', '2026-08-01', '2026-08-31'),
        ];

        expect(getNextPpkEventDate(events, '2026-07-01')).toBe('2026-08-01');
    });

    it('мероприятие сегодня считается предстоящим', () => {
        expect(
            getNextPpkEventDate([event('А', '2026-07-01', '2026-07-05')], '2026-07-01'),
        ).toBe('2026-07-01');
    });

    it('все мероприятия прошли — витрину нужно очистить', () => {
        expect(
            getNextPpkEventDate([event('А', '2026-01-01', '2026-02-01')], '2026-07-01'),
        ).toBe('');
    });

    it('пустые даты игнорируются', () => {
        expect(getNextPpkEventDate([event('А')], '2026-07-01')).toBe('');
    });
});

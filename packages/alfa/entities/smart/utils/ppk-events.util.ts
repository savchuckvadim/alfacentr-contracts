/**
 * Даты участия по каждой программе ППК.
 *
 * У одного участника может быть несколько программ, и по каждой — свои даты
 * обучения. Даты произвольные: двое на одной программе вполне могут учиться
 * в разные периоды. Храним их одним JSON-полем смарта участника, где ключ
 * связи с программой — текст «Названия в заявке» (тот же, которым связаны
 * распределение, товары и приложение ППК).
 *
 * Почему не пары множественных полей: программы участника размазаны по пяти
 * разным множественным полям, единого упорядоченного списка нет, и связь
 * по индексу развалилась бы при первом же редактировании.
 */

/** Даты участия по одной программе */
export interface IPpkEvent {
    /** «Название в заявке» программы — ключ связи */
    topic: string;
    /** дата начала обучения, ISO YYYY-MM-DD */
    dateFrom: string;
    /** дата окончания обучения, ISO YYYY-MM-DD */
    dateTo: string;
}

interface IPpkEventsPayload {
    v: number;
    events: IPpkEvent[];
}

/** Текущая версия формата — на случай будущей миграции */
export const PPK_EVENTS_FORMAT_VERSION = 1;

const isFilledString = (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0;

/**
 * Разбирает значение поля. Никогда не бросает: битый JSON, пустая строка
 * и старый формат дают пустой список — участник просто окажется без дат
 */
export const parsePpkEvents = (raw?: string | null): IPpkEvent[] => {
    if (!isFilledString(raw)) return [];

    try {
        const parsed = JSON.parse(raw) as Partial<IPpkEventsPayload>;
        if (!parsed || !Array.isArray(parsed.events)) return [];

        return parsed.events
            .filter((event) => event && isFilledString(event.topic))
            .map((event) => ({
                topic: event.topic.trim(),
                dateFrom: isFilledString(event.dateFrom)
                    ? event.dateFrom.trim()
                    : '',
                dateTo: isFilledString(event.dateTo) ? event.dateTo.trim() : '',
            }));
    } catch {
        return [];
    }
};

/** Собирает значение поля. Пустой список пишем пустой строкой, а не «{}» */
export const serializePpkEvents = (events: IPpkEvent[]): string => {
    const filled = (events || []).filter((event) =>
        isFilledString(event?.topic),
    );
    if (!filled.length) return '';

    const payload: IPpkEventsPayload = {
        v: PPK_EVENTS_FORMAT_VERSION,
        events: filled.map((event) => ({
            topic: event.topic.trim(),
            dateFrom: event.dateFrom || '',
            dateTo: event.dateTo || '',
        })),
    };

    return JSON.stringify(payload);
};

export interface IPpkEventsMergeResult {
    /** список под актуальные программы участника — его и показываем */
    events: IPpkEvent[];
    /**
     * темы, для которых даты сохранены, но самой программы у участника
     * больше нет: переименовали «Название в заявке» или сняли программу.
     * Не выбрасываем молча — показываем менеджеру, чтобы даты не потерялись
     */
    orphanedEvents: IPpkEvent[];
}

/**
 * Сводит сохраненные даты с актуальным набором программ участника.
 * Новая программа появляется с пустыми датами, снятая уходит в orphaned
 */
export const mergePpkEventsWithTopics = (
    saved: IPpkEvent[],
    topics: string[],
): IPpkEventsMergeResult => {
    const savedByTopic = new Map<string, IPpkEvent>();
    for (const event of saved || []) {
        if (isFilledString(event?.topic)) {
            savedByTopic.set(event.topic.trim(), event);
        }
    }

    const seen = new Set<string>();
    const events: IPpkEvent[] = [];

    for (const rawTopic of topics || []) {
        if (!isFilledString(rawTopic)) continue;

        const topic = rawTopic.trim();
        //одна и та же программа не должна попасть в список дважды
        if (seen.has(topic)) continue;
        seen.add(topic);

        const savedEvent = savedByTopic.get(topic);
        events.push({
            topic,
            dateFrom: savedEvent?.dateFrom || '',
            dateTo: savedEvent?.dateTo || '',
        });
    }

    const orphanedEvents = (saved || []).filter(
        (event) =>
            isFilledString(event?.topic) && !seen.has(event.topic.trim()),
    );

    return { events, orphanedEvents };
};

/** Заполнены ли обе даты и не позже ли начало окончания */
export const isPpkEventDatesValid = (event: IPpkEvent): boolean => {
    if (!isFilledString(event?.dateFrom) || !isFilledString(event?.dateTo)) {
        return false;
    }
    return event.dateFrom <= event.dateTo;
};

/** Программы, у которых даты не заполнены или заполнены неверно */
export const getInvalidPpkEvents = (events: IPpkEvent[]): IPpkEvent[] =>
    (events || []).filter((event) => !isPpkEventDatesValid(event));

/**
 * Ближайшая дата начала, которая еще не прошла — витрина для CRM.
 * Пусто, если все мероприятия участника уже начались
 */
export const getNextPpkEventDate = (
    events: IPpkEvent[],
    today: string,
): string => {
    const upcoming = (events || [])
        .map((event) => event?.dateFrom)
        .filter((date): date is string => isFilledString(date) && date >= today)
        .sort();

    return upcoming[0] || '';
};

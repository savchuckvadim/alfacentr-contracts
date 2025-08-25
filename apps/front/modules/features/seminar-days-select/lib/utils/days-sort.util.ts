import { parse, compareAsc } from 'date-fns';
import { ru } from 'date-fns/locale';

// функция извлечения даты
export function extractDate(str: string) {
    const match = str.match(
        /(\d{1,2})(?:-(\d{1,2}))?\s+([А-Яа-яё]+)\s+(\d{4})/,
    );
    if (!match) return null;

    const [, day1, , monthName, year] = match;

    // "26 сентября 2025"
    const dateString = `${day1} ${monthName} ${year}`;
    try {
        return parse(dateString, 'd MMMM yyyy', new Date(), { locale: ru });
    } catch {
        return null;
    }
}

export function getSortedDays(events: string[]) {
    const sorted = [...events].sort((a, b) => {
        const da = extractDate(a);
        const db = extractDate(b);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return compareAsc(da, db);
    });

    return sorted;
}

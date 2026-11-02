/**
 * Фамилия с инициалами для подписей в документах: «Иванов А. А.».
 *
 * Лежит в общем пакете, а не во фронте: подпись печатается в договоре, и
 * правило должно быть одно на все приложения, с тестами. До 02.11.2026
 * логика жила приватным методом в apps/front (bx-client-rq.service.ts),
 * где её нельзя было покрыть тестом — и правка от 21.04.2026 полгода
 * печатала клиентам «Иванов А.» вместо «Иванов А. А.», потеряв отчество.
 */

export interface FioParts {
    last: string | null;
    first: string | null;
    middle: string | null;
}

/** ФИО приходит одной строкой: «Фамилия Имя Отчество» через любые пробелы */
export const splitFullName = (fullName: unknown): FioParts => {
    const text = typeof fullName === 'string' ? fullName.trim() : '';
    const parts = text ? text.split(/\s+/) : [];

    return {
        last: parts[0] || null,
        first: parts[1] || null,
        middle: parts[2] || null,
    };
};

/**
 * «Иванов Алексей Петрович» → «Иванов А. П.»
 *
 * Каждый инициал добавляется отдельно, если он есть: без отчества выходит
 * «Иванов А.» без лишней точки, из одной фамилии — просто «Иванов».
 */
export const getInitialsByFullName = (fullName: unknown): string => {
    const person = splitFullName(fullName);

    const initials = [person.first, person.middle]
        .map(part => part?.[0]?.toUpperCase())
        .filter(Boolean)
        .map(letter => `${letter}.`);

    return [person.last, ...initials].filter(Boolean).join(' ');
};

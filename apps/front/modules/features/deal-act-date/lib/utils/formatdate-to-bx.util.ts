export const formatDateToBx = (date: Date) => {
    //DD.MM.YYYY
    // DD.MM.YYYY HH:MI:SS
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        // hour: '2-digit',
        // minute: '2-digit',
        // second: '2-digit'
    });
};

export const toLocalIsoDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const normalizeDealActDate = (raw: string): string => {
    if (!raw) return '';
    const trimmed = raw.trim();

    // Already normalized
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
    }

    // Bitrix ISO with timezone, e.g. 2026-02-18T03:00:00+03:00
    if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
        return trimmed.slice(0, 10);
    }

    // Russian format DD.MM.YYYY
    const ruMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (ruMatch) {
        const [, dd, mm, yyyy] = ruMatch;
        return `${yyyy}-${mm}-${dd}`;
    }

    return trimmed;
};

/**
 * Проект живет по новосибирскому времени: и заказчик, и участники семинаров.
 *
 * Контейнер при этом запускается без переменной TZ, то есть в UTC. Разница
 * в семь часов означает, что с полуночи до семи утра по Новосибирску
 * «сегодня» по системным часам — это еще вчера. Поэтому календарную дату
 * везде, где от нее зависит бизнес-правило, считаем по этому поясу явно,
 * а не через локальное время процесса
 */
export const PROJECT_TIME_ZONE = 'Asia/Novosibirsk';

/**
 * Календарная дата проекта в виде YYYY-MM-DD.
 *
 * Через Intl, а не через getFullYear: Node берет пояс из ICU, который
 * встроен в сборку, поэтому результат не зависит ни от TZ контейнера,
 * ни от наличия системного tzdata
 */
export const getProjectDate = (date: Date = new Date()): string => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: PROJECT_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);

    const get = (type: string): string =>
        parts.find((part) => part.type === type)?.value || '';

    return `${get('year')}-${get('month')}-${get('day')}`;
};

/**
 * Сдвиг календарной даты на N дней.
 *
 * Арифметика в UTC: она не зависит от пояса запуска и не спотыкается
 * о переходы на летнее время. На вход и выход — тот же YYYY-MM-DD
 */
export const addDaysToProjectDate = (isoDate: string, days: number): string => {
    const base = new Date(`${isoDate}T00:00:00Z`);
    //битую дату не превращаем в NaN-строку, отдаем как пришла
    if (Number.isNaN(base.getTime())) return isoDate;

    base.setUTCDate(base.getUTCDate() + days);
    return base.toISOString().slice(0, 10);
};

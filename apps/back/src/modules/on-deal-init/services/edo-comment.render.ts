/**
 * Комментарий для сотрудника ОДО в таймлайне сделки.
 *
 * В блок «💡 Информация» он не попадает: тот собирается из dealValues по
 * шаблону TDealData (bx-data.ts), а это поле объявлено отдельно, среди
 * полей документа (bx-document-deal-fields.ts). Поэтому пишем его своим
 * комментарием.
 *
 * Несмотря на префикс UF_CRM_8_, поле живёт на сделке: сервис писем
 * читает его через crm.deal.get и это работает.
 */

/** Поле «Комментарий для сотрудника ОДО», bx-document-deal-fields.ts */
export const EDO_COMMENT_BITRIX_ID = 'UF_CRM_8_1724421715';

/**
 * Длинный комментарий в таймлайне не режем.
 *
 * Это не служебная строка, а текст, который сотрудник ОДО должен
 * прочитать целиком: обрезанный на середине он хуже отсутствующего,
 * потому что выглядит полным.
 */
export const renderEdoCommentForTimeline = (comment: string): string =>
    [
        '📝 [B]Комментарий для сотрудника ОДО[/B]',
        String(comment ?? '').trim(),
    ].join(' \n');

/**
 * Значение поля со сделки. Портал отдаёт незаполненное поле по-разному —
 * пустой строкой, null или отсутствующим ключом
 */
export const extractEdoComment = (
    deal: Record<string, unknown> | null | undefined,
): string => {
    const value = deal?.[EDO_COMMENT_BITRIX_ID];
    return typeof value === 'string' ? value.trim() : '';
};

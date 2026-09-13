import { AlfaParticipantSmartItemUserFieldsEnum } from '@alfa/entities';
import { normalizeEmail, normalizePhone } from '@/modules/shared';

/**
 * Какие поля участника чистим перед записью в CRM.
 *
 * Email и телефон менеджеры вставляют копипастом из писем, word и
 * мессенджеров, и вместе со значением прилетают неразрывные пробелы, переносы
 * и невидимые символы. В карточке это не видно, а дальше значение уходит в
 * приложение ППК и в проверку — где ломается.
 */
const NORMALIZERS: Partial<Record<string, (value: string) => string>> = {
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Email]: normalizeEmail,
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Phone]: normalizePhone,
};

const applyToValue = (
    value: unknown,
    normalize: (value: string) => string,
): unknown => {
    if (typeof value === 'string') return normalize(value);
    //поле в портале бывает множественным — приходит массивом строк
    if (Array.isArray(value)) {
        return value.map(item =>
            typeof item === 'string' ? normalize(item) : item,
        );
    }
    return value;
};

/**
 * Чистит email и телефон в наборе полей участника.
 *
 * Вызывается на границе записи, а не в каждом поле ввода: так под чистку
 * попадают все пути сразу — карточка участника, окно подтверждения и таб
 * «Приложение ППК» — и менеджер при этом видит в поле то, что набрал.
 */
export const normalizeParticipantFields = <T extends Record<string, unknown>>(
    fields: T,
): T => {
    let changed = false;
    const result: Record<string, unknown> = { ...fields };

    for (const [bitrixId, value] of Object.entries(fields)) {
        const normalize = NORMALIZERS[bitrixId];
        if (!normalize) continue;

        const next = applyToValue(value, normalize);
        if (next !== value) {
            result[bitrixId] = next;
            changed = true;
        }
    }

    return changed ? (result as T) : fields;
};

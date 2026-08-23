import {
    BxParticipantsDataKeys,
    isPpkProgramCode,
    NEW_SEMINAR_DAY_FIELD_CODES,
} from '@alfa/entities';
import { DealValue } from './deal-values-helper.service';
import { DealValueListItem } from '../../modules/on-deal-init/type/deal-field.type';

/**
 * Достает номер участника из имени поля сделки.
 * Работает с обоими вариантами именования:
 *   «Участник 10 Дни участия»            -> 10
 *   «Выберите семинар НСК Участник 1»    -> 1
 * Ограничитель (?!\d) не дает прочитать «Участник 10» как «Участник 1»
 */
export const getParticipantIndexFromFieldName = (
    name: string,
): number | null => {
    const match = /Участник\s+(\d{1,2})(?!\d)/.exec(name || '');
    if (!match) return null;

    const index = Number(match[1]);
    return Number.isFinite(index) && index > 0 ? index : null;
};

const isNewSeminarDayCode = (code: string): boolean =>
    (NEW_SEMINAR_DAY_FIELD_CODES as string[]).includes(code);

const toArray = <T>(value: T | T[] | undefined): T[] => {
    if (value === undefined || value === null) return [];
    return Array.isArray(value) ? value : [value];
};

const hasValue = (value: DealValue['value']): boolean =>
    Array.isArray(value) ? value.length > 0 : !!value;

/**
 * Схлопывает значения новых полей «Выберите семинар {Отдел} Участник {N}»
 * в одно синтетическое значение с легаси-кодом days.
 *
 * Зачем: ниже по потоку (резолв товаров, сборка смарт-участников, текст заявки)
 * все написано под единственное поле дней участника. Нормализуя один раз здесь,
 * мы не трогаем всю цепочку.
 *
 * Объединяем, а не берем первое непустое: в норме у участника заполнено одно поле
 * (заявка приходит из одной формы), но если заполнены поля разных отделов,
 * объединение ничего не теряет. Смешанная сделка — допустимый сценарий.
 */
export const normalizeSeminarDayValues = (
    dealValues: DealValue[],
): DealValue[] => {
    //собираем выбранные семинары по номеру участника
    const mergedByParticipant = new Map<number, DealValue>();

    for (const value of dealValues) {
        if (!isNewSeminarDayCode(value.code) || !hasValue(value.value)) {
            continue;
        }

        const participantIndex = getParticipantIndexFromFieldName(value.name);
        if (!participantIndex) continue;

        const names = toArray(value.value as string | string[]).map(String);
        const listItems: DealValueListItem[] = toArray(value.listItem);

        const merged = mergedByParticipant.get(participantIndex);
        if (!merged) {
            mergedByParticipant.set(participantIndex, {
                code: BxParticipantsDataKeys.days,
                bitrixId: value.bitrixId,
                name: `Участник ${participantIndex} Дни участия`,
                value: names,
                listItem: listItems,
            });
            continue;
        }

        //дедуп: один и тот же семинар не должен попасть в сделку дважды
        const mergedNames = merged.value as string[];
        for (const name of names) {
            if (!mergedNames.includes(name)) mergedNames.push(name);
        }

        const mergedItems = merged.listItem as DealValueListItem[];
        for (const item of listItems) {
            if (!mergedItems.some((it) => it.bitrixId === item.bitrixId)) {
                mergedItems.push(item);
            }
        }
    }

    if (!mergedByParticipant.size) {
        //новых полей нет — заявка со старой формы, отдаем как есть
        return dealValues;
    }

    const emittedParticipants = new Set<number>();
    const result: DealValue[] = [];

    for (const value of dealValues) {
        const participantIndex = getParticipantIndexFromFieldName(value.name);
        const merged = participantIndex
            ? mergedByParticipant.get(participantIndex)
            : undefined;

        if (isNewSeminarDayCode(value.code)) {
            //синтетическое значение отдаем на месте первого из новых полей,
            //чтобы дни остались на своем месте в тексте заявки
            if (
                merged &&
                participantIndex &&
                !emittedParticipants.has(participantIndex)
            ) {
                emittedParticipants.add(participantIndex);
                result.push(merged);
            }
            continue;
        }

        //переходный режим: легаси-поле участвует, только если новые пусты
        if (value.code === BxParticipantsDataKeys.days && merged) {
            continue;
        }

        result.push(value);
    }

    return result;
};

/**
 * Есть ли в заявке хоть что-то, из чего можно собрать товары:
 * выбранные дни семинаров ИЛИ программы повышения квалификации.
 *
 * Заявка без единого дня — это штатная чистая ППК-заявка, а не ошибка.
 * Тревожить менеджера нужно, только если не выбрано вообще ничего.
 *
 * Вызывать ПОСЛЕ normalizeSeminarDayValues: до нормализации дни лежат
 * в трех отдельных полях с другими кодами
 */
export const hasParticipantProductSelection = (
    dealValues: DealValue[],
): boolean =>
    dealValues.some((value) => {
        if (value.code === BxParticipantsDataKeys.days) {
            return hasValue(value.value);
        }
        return isPpkProgramCode(value.code) && hasValue(value.value);
    });

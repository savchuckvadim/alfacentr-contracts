import { BxParticipantsDataKeys } from '@alfa/entities';
import {
    getParticipantIndexFromFieldName,
    hasParticipantProductSelection,
    normalizeSeminarDayValues,
} from './normalize-seminar-days.helper';
import { DealValue } from './deal-values-helper.service';

const newDayValue = (
    code: BxParticipantsDataKeys,
    department: string,
    participant: number,
    names: string[],
): DealValue => ({
    code,
    bitrixId: `UF_${code}_${participant}`,
    name: `Выберите семинар ${department} Участник ${participant}`,
    value: names,
    //id элементов списков в битриксе глобально уникальны между полями —
    //в фикстуре тоже делаем их уникальными, иначе дедуп схлопнет разные семинары
    listItem: names.map((name, i) => ({
        name,
        bitrixId: `${code}-${participant}-${i}`,
    })),
});

const legacyDayValue = (participant: number, names: string[]): DealValue => ({
    code: BxParticipantsDataKeys.days,
    bitrixId: `UF_LEGACY_${participant}`,
    name: `Участник ${participant} Дни участия`,
    value: names,
    listItem: names.map((name, i) => ({
        name,
        bitrixId: `l${participant}${i}`,
    })),
});

const fio = (participant: number): DealValue => ({
    code: BxParticipantsDataKeys.name,
    bitrixId: `UF_FIO_${participant}`,
    name: `Участник ${participant} ФИО`,
    value: `Иванов ${participant}`,
});

const daysOf = (values: DealValue[], participant: number) =>
    values.find(
        (v) =>
            v.code === BxParticipantsDataKeys.days &&
            v.name === `Участник ${participant} Дни участия`,
    );

describe('getParticipantIndexFromFieldName', () => {
    it('читает номер из легаси-имени', () => {
        expect(getParticipantIndexFromFieldName('Участник 1 Дни участия')).toBe(
            1,
        );
    });

    it('не путает участника 10 с участником 1', () => {
        expect(
            getParticipantIndexFromFieldName('Участник 10 Дни участия'),
        ).toBe(10);
    });

    it('читает номер из нового имени, где «Участник N» в конце', () => {
        expect(
            getParticipantIndexFromFieldName('Выберите семинар НСК Участник 4'),
        ).toBe(4);
    });

    it('возвращает null, если номера нет', () => {
        expect(getParticipantIndexFromFieldName('ИНН')).toBeNull();
    });
});

describe('normalizeSeminarDayValues', () => {
    it('заполнен один отдел — значение получает легаси-код и легаси-имя', () => {
        const result = normalizeSeminarDayValues([
            fio(1),
            newDayValue(BxParticipantsDataKeys.days_nsk, 'НСК', 1, [
                'Семинар А',
            ]),
        ]);

        const days = daysOf(result, 1);
        expect(days).toBeDefined();
        expect(days?.value).toEqual(['Семинар А']);
        //новые коды не должны утечь дальше
        expect(
            result.some((v) => v.code === BxParticipantsDataKeys.days_nsk),
        ).toBe(false);
    });

    it('заполнены два отдела — объединяет и ничего не теряет (смешанная сделка)', () => {
        const result = normalizeSeminarDayValues([
            fio(1),
            newDayValue(BxParticipantsDataKeys.days_nsk, 'НСК', 1, [
                'Семинар А',
            ]),
            newDayValue(BxParticipantsDataKeys.days_region, 'Регион', 1, [
                'Семинар Б',
            ]),
        ]);

        expect(daysOf(result, 1)?.value).toEqual(['Семинар А', 'Семинар Б']);
        expect(daysOf(result, 1)?.listItem).toHaveLength(2);
    });

    it('дедуп: одинаковый семинар в двух полях не задваивается', () => {
        const result = normalizeSeminarDayValues([
            newDayValue(BxParticipantsDataKeys.days_nsk, 'НСК', 2, [
                'Семинар А',
            ]),
            newDayValue(BxParticipantsDataKeys.days_west, 'Запад', 2, [
                'Семинар А',
            ]),
        ]);

        expect(daysOf(result, 2)?.value).toEqual(['Семинар А']);
    });

    it('новые поля пусты — легаси-поле выживает (переходный режим)', () => {
        const values = [fio(1), legacyDayValue(1, ['Старый семинар'])];
        const result = normalizeSeminarDayValues(values);

        expect(daysOf(result, 1)?.value).toEqual(['Старый семинар']);
        expect(result).toEqual(values);
    });

    it('заполнены и новые, и легаси — легаси отбрасывается, товары не задваиваются', () => {
        const result = normalizeSeminarDayValues([
            legacyDayValue(1, ['Старый семинар']),
            newDayValue(BxParticipantsDataKeys.days_nsk, 'НСК', 1, [
                'Новый семинар',
            ]),
        ]);

        expect(daysOf(result, 1)?.value).toEqual(['Новый семинар']);
        expect(
            result.filter((v) => v.code === BxParticipantsDataKeys.days),
        ).toHaveLength(1);
    });

    it('не объединяет между участниками — количество товаров считается по каждому', () => {
        const result = normalizeSeminarDayValues([
            newDayValue(BxParticipantsDataKeys.days_nsk, 'НСК', 1, [
                'Семинар А',
            ]),
            newDayValue(BxParticipantsDataKeys.days_nsk, 'НСК', 2, [
                'Семинар А',
            ]),
        ]);

        expect(daysOf(result, 1)?.value).toEqual(['Семинар А']);
        expect(daysOf(result, 2)?.value).toEqual(['Семинар А']);
    });

    it('ничего не выбрано — массив возвращается как есть', () => {
        const values = [fio(1)];
        expect(normalizeSeminarDayValues(values)).toEqual(values);
    });

    it('пустые новые поля не создают синтетическое значение', () => {
        const values = [
            fio(1),
            newDayValue(BxParticipantsDataKeys.days_nsk, 'НСК', 1, []),
        ];
        const result = normalizeSeminarDayValues(values);

        expect(daysOf(result, 1)).toBeUndefined();
    });
});

describe('hasParticipantProductSelection', () => {
    const ppkValue = (participant: number, program: string): DealValue => ({
        code: BxParticipantsDataKeys.zakupki,
        bitrixId: `UF_PPK_${participant}`,
        name: `Участник ${participant} Программы повышения квалификации для специалистов по закупкам`,
        value: program,
    });

    it('выбраны дни семинаров — есть из чего собирать товары', () => {
        expect(
            hasParticipantProductSelection([
                fio(1),
                legacyDayValue(1, ['Семинар А']),
            ]),
        ).toBe(true);
    });

    it('чистая ППК-заявка: дней нет, но выбрана программа — это НЕ ошибка', () => {
        expect(
            hasParticipantProductSelection([
                fio(1),
                ppkValue(1, 'Программа по закупкам, 120 часов'),
            ]),
        ).toBe(true);
    });

    it('заявка пустая: ни дней, ни программ — вот тогда тревога', () => {
        expect(hasParticipantProductSelection([fio(1)])).toBe(false);
    });

    it('пустые значения не считаются выбором', () => {
        expect(
            hasParticipantProductSelection([
                fio(1),
                legacyDayValue(1, []),
                ppkValue(1, ''),
            ]),
        ).toBe(false);
    });

    it('после нормализации новые поля семинаров тоже считаются выбором', () => {
        const normalized = normalizeSeminarDayValues([
            fio(1),
            newDayValue(BxParticipantsDataKeys.days_west, 'Запад', 1, [
                'Семинар З',
            ]),
        ]);

        expect(hasParticipantProductSelection(normalized)).toBe(true);
    });
});

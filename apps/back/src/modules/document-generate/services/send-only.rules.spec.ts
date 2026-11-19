import {
    canSendOnly,
    renderMissingForManager,
    toMissingList,
} from './send-only.rules';

const field = (name: string, bitrixId = 'UF_CRM_8_X') =>
    ({
        code: 'current_contract_without_pt',
        name,
        bitrixId,
    }) as never;

/** Для семинара обязательны 4 документа + тема письма */
const SEMINAR_TOTAL = 5;

describe('canSendOnly', () => {
    it('полный комплект — отправляем', () => {
        expect(canSendOnly([], SEMINAR_TOTAL)).toBe(true);
        expect(canSendOnly(null, SEMINAR_TOTAL)).toBe(true);
    });

    it('часть документов есть — отправку не блокируем, решает менеджер', () => {
        //нет приложения ППК, но договор, счета и УПД на месте
        expect(canSendOnly([field('Текущее приложение ППК')], 6)).toBe(true);
    });

    it('не сформировано вообще ничего — не отправляем', () => {
        const nothing = [
            field('Текущий договор без печати'),
            field('Текущий акт'),
            field('Текущий счет с печатью'),
            field('Текущий счет без печати'),
            field('Тема письма'),
        ];

        expect(canSendOnly(nothing, SEMINAR_TOTAL)).toBe(false);
    });

    it('один документ из пяти — уже есть что отправить', () => {
        const almostNothing = [
            field('Текущий акт'),
            field('Текущий счет с печатью'),
            field('Текущий счет без печати'),
            field('Тема письма'),
        ];

        expect(canSendOnly(almostNothing, SEMINAR_TOTAL)).toBe(true);
    });
});

describe('toMissingList', () => {
    it('отдаёт имя и код поля', () => {
        expect(
            toMissingList([field('Текущий счёт с печатью', 'UF_CRM_8_INV')]),
        ).toEqual([
            { name: 'Текущий счёт с печатью', bitrixId: 'UF_CRM_8_INV' },
        ]);
    });

    it('пустой список не ломает', () => {
        expect(toMissingList(null)).toEqual([]);
        expect(toMissingList([])).toEqual([]);
    });
});

describe('renderMissingForManager', () => {
    it('один документ — единственное число', () => {
        expect(renderMissingForManager([field('Текущий акт')])).toBe(
            'Не сформирован документ: Текущий акт',
        );
    });

    it('несколько — перечисляем поимённо', () => {
        const text = renderMissingForManager([
            field('Текущий договор без печати'),
            field('Текущее приложение ППК'),
        ]);

        expect(text).toContain('Текущий договор без печати');
        expect(text).toContain('Текущее приложение ППК');
    });

    it('когда всё на месте — текста нет', () => {
        expect(renderMissingForManager([])).toBe('');
        expect(renderMissingForManager(null)).toBe('');
    });
});

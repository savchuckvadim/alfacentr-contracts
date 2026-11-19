import {
    canSendOnly,
    renderMissingForManager,
    toMissingList,
} from './send-only.rules';

const field = (name: string, bitrixId = 'UF_CRM_8_X') => ({
    code: 'current_contract_without_pt',
    name,
    bitrixId,
}) as never;

describe('canSendOnly', () => {
    it('полный пакет — отправляем', () => {
        expect(canSendOnly([])).toBe(true);
        expect(canSendOnly(null)).toBe(true);
        expect(canSendOnly(undefined)).toBe(true);
    });

    it('не хватает хотя бы одного документа — не отправляем', () => {
        expect(canSendOnly([field('Текущий договор')])).toBe(false);
    });

    it('нет приложения ППК — не отправляем', () => {
        expect(canSendOnly([field('Текущее приложение ППК')])).toBe(false);
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
            field('Текущий договор'),
            field('Текущее приложение ППК'),
        ]);

        expect(text).toContain('Текущий договор');
        expect(text).toContain('Текущее приложение ППК');
    });

    it('когда всё на месте — текста нет', () => {
        expect(renderMissingForManager([])).toBe('');
        expect(renderMissingForManager(null)).toBe('');
    });
});

import {
    hasExactEmail,
    hasWorkEmail,
    isContactLast,
    pickContactByEmail,
    putContactLast,
} from './deal-contact.rules';

const contact = (id: number, emails: { VALUE: string; VALUE_TYPE?: string }[]) => ({
    ID: String(id),
    EMAIL: emails,
});

const target = 'sontrck@yandex.ru';

describe('hasExactEmail', () => {
    it('находит адрес независимо от регистра и пробелов', () => {
        expect(
            hasExactEmail(contact(1, [{ VALUE: ' SonTrck@Yandex.ru ' }]), target),
        ).toBe(true);
    });

    it('похожий адрес не считается тем же', () => {
        expect(
            hasExactEmail(contact(1, [{ VALUE: 'sontrck@mail.ru' }]), target),
        ).toBe(false);
        expect(
            hasExactEmail(contact(1, [{ VALUE: 'xsontrck@yandex.ru' }]), target),
        ).toBe(false);
    });

    it('контакт без почты не ломает проверку', () => {
        expect(hasExactEmail({ ID: '1' }, target)).toBe(false);
        expect(hasExactEmail({ ID: '1', EMAIL: null }, target)).toBe(false);
    });
});

describe('hasWorkEmail', () => {
    it('различает рабочий адрес и прочие', () => {
        expect(
            hasWorkEmail(
                contact(1, [{ VALUE: target, VALUE_TYPE: 'WORK' }]),
                target,
            ),
        ).toBe(true);

        expect(
            hasWorkEmail(
                contact(1, [{ VALUE: target, VALUE_TYPE: 'MAILING' }]),
                target,
            ),
        ).toBe(false);
    });
});

describe('pickContactByEmail', () => {
    it('выбирает контакт с рабочим адресом, а не первый из выдачи', () => {
        //так выглядит нестрогая выдача портала: посторонние идут первыми
        const found = [
            contact(101, [{ VALUE: 'ogbuz.trck@mail.ru', VALUE_TYPE: 'WORK' }]),
            contact(102, [{ VALUE: 'margov@List.ru', VALUE_TYPE: 'WORK' }]),
            contact(141916, [{ VALUE: target, VALUE_TYPE: 'WORK' }]),
        ];

        const { exact, needsWorkType } = pickContactByEmail(found, target);

        expect(exact?.ID).toBe('141916');
        expect(needsWorkType).toBe(false);
    });

    it('адрес есть, но не рабочий — просим проставить тип', () => {
        const found = [contact(55, [{ VALUE: target, VALUE_TYPE: 'MAILING' }])];

        const { exact, needsWorkType } = pickContactByEmail(found, target);

        expect(exact?.ID).toBe('55');
        expect(needsWorkType).toBe(true);
    });

    it('точного совпадения нет — не подсовываем чужой контакт', () => {
        const found = [
            contact(101, [{ VALUE: 'ogbuz.trck@mail.ru', VALUE_TYPE: 'WORK' }]),
            contact(102, [{ VALUE: 'margov@List.ru', VALUE_TYPE: 'WORK' }]),
        ];

        expect(pickContactByEmail(found, target).exact).toBeNull();
        expect(pickContactByEmail([], target).exact).toBeNull();
        expect(pickContactByEmail(null, target).exact).toBeNull();
    });
});

describe('putContactLast', () => {
    it('наш контакт становится последним, остальные остаются', () => {
        expect(putContactLast([101, 102, 103], 141916)).toEqual([
            101, 102, 103, 141916,
        ]);
    });

    it('если он уже в списке — переносим в конец, не дублируя', () => {
        expect(putContactLast([141916, 101, 102], 141916)).toEqual([
            101, 102, 141916,
        ]);
    });

    it('пустая сделка — только наш контакт', () => {
        expect(putContactLast([], 141916)).toEqual([141916]);
        expect(putContactLast(null, 141916)).toEqual([141916]);
    });

    it('мусор в списке отбрасывается', () => {
        expect(putContactLast([0, -5, 'abc' as never, 101], 141916)).toEqual([
            101, 141916,
        ]);
    });

    it('без контакта ничего не возвращаем — сделку не трогаем', () => {
        expect(putContactLast([101], 0)).toEqual([]);
        expect(putContactLast([101], NaN)).toEqual([]);
    });
});

describe('isContactLast', () => {
    it('узнаёт, что наш контакт уже последний', () => {
        expect(isContactLast([101, 102, 141916], 141916)).toBe(true);
        expect(isContactLast(['101', '141916'], 141916)).toBe(true);
    });

    it('не последний — надо переставить', () => {
        expect(isContactLast([141916, 101], 141916)).toBe(false);
        expect(isContactLast([101, 102], 141916)).toBe(false);
        expect(isContactLast([], 141916)).toBe(false);
    });
});

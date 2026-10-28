import { EContractType, RQ_TYPE } from '@alfa/entities';
import { DocumentGenerateFieldTemplateCode } from '@alfa/entities';
import {
    DocumentContractFieldsService,
    HANDWRITTEN_PLACEHOLDER,
} from './document-contract-fields.service';

/**
 * Количество участников в договоре «Семинар».
 *
 * Клиентский случай 28.10.2026: в пункт договора уходило число товарных
 * позиций сделки, а не участников. Фронт исправлен, а здесь закреплён
 * контракт бэка: присланное значение попадает в шаблон как есть, пустое
 * печатается линией под ручное заполнение, а не нулём.
 */
describe('getContractFields: количество участников семинара', () => {
    const service = new DocumentContractFieldsService();

    const getParticipantsField = (count: string) => {
        const { fields } = service.getContractFields(
            RQ_TYPE.ORGANIZATION,
            EContractType.seminar,
            'Заголовок',
            [],
            'Итого',
            [],
            'Подпись',
            'СН2110И-15',
            '15',
            'client@example.com',
            count,
        );
        return fields[DocumentGenerateFieldTemplateCode.DocumentParticipantsCount];
    };

    it('присланное число уходит в шаблон как есть', () => {
        expect(getParticipantsField('7')).toBe('7');
    });

    it('пустая строка печатается линией под ручное заполнение', () => {
        expect(getParticipantsField('')).toBe(HANDWRITTEN_PLACEHOLDER);
    });

    it('линия — это подчёркивания, а не ноль и не пустота', () => {
        expect(HANDWRITTEN_PLACEHOLDER).toMatch(/^_{10,}$/);
    });
});

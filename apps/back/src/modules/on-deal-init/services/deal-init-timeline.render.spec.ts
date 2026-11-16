import { IAlfaParticipantSmartItem } from '@alfa/entities';

import {
    MAX_PARTICIPANTS_IN_COMMENT,
    renderParticipantsForTimeline,
} from './deal-init-timeline.render';

const participant = (
    fields: Partial<IAlfaParticipantSmartItem> = {},
): IAlfaParticipantSmartItem => ({ ...fields }) as IAlfaParticipantSmartItem;

describe('renderParticipantsForTimeline', () => {
    it('показывает количество и имена', () => {
        const comment = renderParticipantsForTimeline([
            participant({ ufCrm12Name: 'Иванов Алексей Петрович' }),
            participant({ ufCrm12Name: 'Петрова Мария' }),
        ]);

        expect(comment).toContain('Заведены участники: 2');
        expect(comment).toContain('Иванов Алексей Петрович');
        expect(comment).toContain('Петрова Мария');
    });

    it('дописывает почту, телефон, число дней и признак ППК', () => {
        const comment = renderParticipantsForTimeline([
            participant({
                ufCrm12Name: 'Иванов',
                ufCrm12Email: 'ivanov@example.ru',
                ufCrm12Phone: '89001234567',
                ufCrm12Days: ['день 1', 'день 2'],
                ufCrm12IsPpk: 'Y',
            }),
        ]);

        expect(comment).toContain('ivanov@example.ru');
        expect(comment).toContain('89001234567');
        expect(comment).toContain('дней: 2');
        expect(comment).toContain('ППК');
    });

    it('участник без имени показывается по порядковому номеру', () => {
        expect(renderParticipantsForTimeline([participant()])).toContain(
            'Участник 1',
        );
    });

    it('берет title, если своего имени нет', () => {
        expect(
            renderParticipantsForTimeline([participant({ title: 'Смирнов' })]),
        ).toContain('Смирнов');
    });

    it('длинный список обрезается с указанием остатка', () => {
        const many = Array.from(
            { length: MAX_PARTICIPANTS_IN_COMMENT + 3 },
            (_, i) => participant({ ufCrm12Name: `Участник ${i + 1}` }),
        );

        const comment = renderParticipantsForTimeline(many);

        expect(comment).toContain(
            `Заведены участники: ${MAX_PARTICIPANTS_IN_COMMENT + 3}`,
        );
        expect(comment).toContain('и ещё 3');
    });

    it('пустые значения полей не дают висящих разделителей', () => {
        const comment = renderParticipantsForTimeline([
            participant({ ufCrm12Name: 'Иванов', ufCrm12Email: '  ' }),
        ]);

        expect(comment).toContain('• Иванов');
        expect(comment).not.toContain('—');
    });
});

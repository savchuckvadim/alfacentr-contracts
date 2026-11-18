import {
    extractContactSyncReason,
    renderContactSyncIssue,
} from './contact-sync-issue.render';

//реальный ответ портала 18.11.2026
const portalError = {
    response: {
        data: {
            error: 'ERROR_CORE',
            error_description:
                'Поле "Рабочий e-mail" содержит некорректный адрес.<br>',
        },
    },
};

describe('extractContactSyncReason', () => {
    it('берёт человекочитаемую причину портала', () => {
        expect(extractContactSyncReason(portalError)).toContain(
            'Рабочий e-mail',
        );
    });

    it('без ответа портала берёт текст ошибки', () => {
        expect(extractContactSyncReason(new Error('socket hang up'))).toBe(
            'socket hang up',
        );
    });

    it('на неопознанном возвращает общую формулировку', () => {
        expect(extractContactSyncReason(undefined)).toBe(
            'портал не принял данные',
        );
        expect(extractContactSyncReason({})).toBe('портал не принял данные');
    });
});

describe('renderContactSyncIssue', () => {
    it('в комментарии есть адрес, причина и что делать', () => {
        const comment = renderContactSyncIssue('bad@@mail', portalError);

        expect(comment).toContain('bad@@mail');
        expect(comment).toContain('Рабочий e-mail');
        expect(comment).toContain('вручную');
    });

    it('теги портала не попадают в комментарий', () => {
        expect(renderContactSyncIssue('a@b.c', portalError)).not.toContain(
            '<br>',
        );
    });

    it('пустой адрес не притворяется заполненным', () => {
        expect(renderContactSyncIssue('', portalError)).toContain(
            'не указан',
        );
    });
});

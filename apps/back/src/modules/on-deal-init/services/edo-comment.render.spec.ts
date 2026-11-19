import {
    EDO_COMMENT_BITRIX_ID,
    extractEdoComment,
    renderEdoCommentForTimeline,
} from './edo-comment.render';

describe('extractEdoComment', () => {
    it('берёт значение поля со сделки', () => {
        expect(
            extractEdoComment({
                ID: 204296,
                [EDO_COMMENT_BITRIX_ID]: 'Счёт выставить на головную организацию',
            }),
        ).toBe('Счёт выставить на головную организацию');
    });

    it('незаполненное поле во всех его видах даёт пустую строку', () => {
        expect(extractEdoComment({ [EDO_COMMENT_BITRIX_ID]: '' })).toBe('');
        expect(extractEdoComment({ [EDO_COMMENT_BITRIX_ID]: null })).toBe('');
        expect(extractEdoComment({ ID: 204296 })).toBe('');
        expect(extractEdoComment(null)).toBe('');
        expect(extractEdoComment(undefined)).toBe('');
    });

    it('пробелы по краям срезаются', () => {
        expect(
            extractEdoComment({ [EDO_COMMENT_BITRIX_ID]: '  текст  ' }),
        ).toBe('текст');
    });
});

describe('renderEdoCommentForTimeline', () => {
    it('в комментарии есть заголовок и сам текст', () => {
        const comment = renderEdoCommentForTimeline('Оплата после 15 декабря');

        expect(comment).toContain('Комментарий для сотрудника ОДО');
        expect(comment).toContain('Оплата после 15 декабря');
    });

    it('длинный текст не режется', () => {
        const long = 'я'.repeat(2000);

        expect(renderEdoCommentForTimeline(long)).toContain(long);
    });

    it('переносы строк сохраняются', () => {
        const text = 'Первая строка\nВторая строка';

        expect(renderEdoCommentForTimeline(text)).toContain(text);
    });
});

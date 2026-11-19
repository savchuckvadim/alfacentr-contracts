import { DealInitTimelineService } from './deal-init-timeline.service';

/**
 * Портал отвергает комментарий без текста: «Empty comment message».
 * 19.11.2026 на тестовых сделках 204820 и 204822 заявка была почти
 * пустой, и блок «Информация» свёлся к одному переводу строки — обычная
 * проверка на непустоту такую строку пропускает.
 */
describe('DealInitTimelineService: пустые комментарии', () => {
    const makeService = () => {
        const addTimelineComment =
            jest.fn<Promise<unknown>, [{ COMMENT: string }]>();
        addTimelineComment.mockResolvedValue({});
        const bitrix = {
            timeline: { addTimelineComment },
        } as never;

        return {
            service: new DealInitTimelineService(bitrix),
            addTimelineComment,
        };
    };

    it('комментарий из одних переводов строки в портал не уходит', async () => {
        const { service, addTimelineComment } = makeService();

        await service.bidInfo(204820, [] as never);
        expect(addTimelineComment).not.toHaveBeenCalled();
    });

    it('пустой комментарий ОДО не создаёт пустого заголовка', async () => {
        const { service, addTimelineComment } = makeService();

        await service.edoComment(204820, { UF_CRM_8_1724421715: '   ' });
        await service.edoComment(204820, {});

        expect(addTimelineComment).not.toHaveBeenCalled();
    });

    it('заполненный комментарий уходит', async () => {
        const { service, addTimelineComment } = makeService();

        await service.edoComment(204820, {
            UF_CRM_8_1724421715: 'Счёт на головную организацию',
        });

        expect(addTimelineComment).toHaveBeenCalledTimes(1);
        expect(addTimelineComment.mock.calls[0]?.[0].COMMENT).toContain(
            'Счёт на головную организацию',
        );
    });

    it('участников без движения не показываем', async () => {
        const { service, addTimelineComment } = makeService();

        await service.participants(204820, [], 0);
        expect(addTimelineComment).not.toHaveBeenCalled();
    });
});

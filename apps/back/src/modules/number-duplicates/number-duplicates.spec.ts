// Сервисы портала, Redis и Telegram в тестах не нужны, а их импорт тянет за
// собой половину приложения. Подменяются пустышками: use-case'у от них нужны
// только методы, которые подставляются в тестах.
jest.mock('@/modules/pbx', () => ({ PBXService: class PBXService {} }));
jest.mock('@/core/redis/redis.service', () => ({
    RedisService: class RedisService {},
}));
jest.mock('@/modules/telegram/telegram.service', () => ({
    TelegramService: class TelegramService {},
}));

import {
    DEAL_NUMBER_CURRENT_DOC_FIELD,
    DEAL_NUMBER_DOC_FIELD,
    DEAL_PREFIX_FIELD,
    NumberDuplicatesService,
    findCollisions,
    normalizeNumber,
    normalizePrefix,
    toDealHolder,
    toSmartHolder,
} from './services/number-duplicates.service';
import {
    NumberDuplicatesUseCase,
    REPORTED_SET_KEY,
} from './use-cases/number-duplicates.use-case';

const smart = (id: number, prefix: string, doc: string, cur = '') =>
    toSmartHolder({
        id,
        ufCrm8Prefix: prefix,
        ufCrm8NumberDoc: doc,
        ufCrm8NumberCurrentDoc: cur,
    });
const deal = (id: number, prefix: string, cur: string, doc = '') =>
    toDealHolder({
        ID: String(id),
        [DEAL_PREFIX_FIELD]: prefix,
        [DEAL_NUMBER_CURRENT_DOC_FIELD]: cur,
        [DEAL_NUMBER_DOC_FIELD]: doc,
    });

describe('нормализация', () => {
    it('регистр и пробелы в префиксе не прячут повтор', () => {
        expect(normalizePrefix('  сн1910и ')).toBe('СН1910И');
    });

    it('«01» и «1» — один номер, нечисловое остаётся как есть', () => {
        expect(normalizeNumber('01')).toBe('1');
        expect(normalizeNumber(' 14 ')).toBe('14');
        expect(normalizeNumber('А-5')).toBe('А-5');
        expect(normalizeNumber(null)).toBe('');
    });
});

describe('откуда берётся номер записи', () => {
    it('смарт: «Номер документа» главнее «Номера текущего договора»', () => {
        expect(smart(1, 'СН1910И', '13', '1').number).toBe('13');
    });

    it('смарт: пустой «Номер документа» — берём текущий', () => {
        expect(smart(1, 'СН1910И', '', '7').number).toBe('7');
    });

    it('сделка: номер лежит в «Номере текущего договора», а не в «Номере документа»', () => {
        //из-за этого первая проверка по сделкам ничего не нашла: у всех
        //306 сделок «Номер документа» пустой
        expect(deal(5, 'СН1910И', '4').number).toBe('4');
        expect(deal(5, 'СН1910И', '', '9').number).toBe('9');
    });
});

describe('findCollisions', () => {
    const recent = (...refs: string[]) => new Set(refs);

    it('находит повтор между карточкой смарта и сделкой — случай СН1910И-1', () => {
        const result = findCollisions(
            [
                smart(20192, 'СН1910И', '1', '1'),
                smart(20194, 'СН1910И', '14', '14'),
                deal(187716, 'СН1910И', '1'),
                deal(188178, 'СН1910И', '2'),
            ],
            recent('smart:20192'),
        );

        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('СН1910И-1');
        //смарт идёт первым, внутри вида — по возрастанию id
        expect(result[0].holders.map((h) => `${h.kind}:${h.id}`)).toEqual([
            'smart:20192',
            'deal:187716',
        ]);
    });

    it('находит повтор между двумя сделками', () => {
        const result = findCollisions(
            [deal(10, 'СР2810В', '5'), deal(11, 'СР2810В', '5')],
            recent('deal:11'),
        );
        expect(result.map((c) => c.key)).toEqual(['СР2810В-5']);
    });

    it('старый повтор, которого давно никто не касался, не попадает в отчёт', () => {
        const result = findCollisions(
            [smart(1282, 'УПР24-1', '1'), smart(1284, 'УПР24-1', '1')],
            recent('smart:99999'),
        );
        expect(result).toEqual([]);
    });

    it('один и тот же номер в разных префиксах — не повтор', () => {
        const result = findCollisions(
            [smart(1, 'СН1910И', '1'), smart(2, 'СН1510О', '1')],
            recent('smart:1', 'smart:2'),
        );
        expect(result).toEqual([]);
    });

    it('«01» и «1» в одном префиксе считаются повтором', () => {
        const result = findCollisions(
            [smart(1, 'СН1910И', '01'), deal(2, 'сн1910и ', '1')],
            recent('smart:1'),
        );
        expect(result).toHaveLength(1);
    });

    it('запись без номера или без префикса пропускается', () => {
        const result = findCollisions(
            [
                smart(1, 'СН1910И', ''),
                smart(2, 'СН1910И', ''),
                smart(3, '', '5'),
                smart(4, '', '5'),
            ],
            recent('smart:1', 'smart:2', 'smart:3', 'smart:4'),
        );
        expect(result).toEqual([]);
    });

    it('одна запись, загруженная дважды, не создаёт повтор сама с собой', () => {
        const result = findCollisions(
            [smart(1, 'СН1910И', '3'), smart(1, 'СН1910И', '3')],
            recent('smart:1'),
        );
        expect(result).toEqual([]);
    });

    it('третья запись с тем же номером попадает в ту же группу', () => {
        const result = findCollisions(
            [
                smart(1, 'УПР24', '1'),
                smart(2, 'УПР24', '1'),
                deal(3, 'УПР24', '1'),
            ],
            recent('deal:3'),
        );
        expect(result).toHaveLength(1);
        expect(result[0].holders).toHaveLength(3);
    });
});

describe('NumberDuplicatesService', () => {
    type Call = { method: string; params: Record<string, unknown> };

    /** Поддельный Битрикс: отвечает по таблице и запоминает вызовы */
    const makeBitrix = (
        handler: (method: string, params: Record<string, unknown>) => unknown,
    ) => {
        const calls: Call[] = [];
        return {
            calls,
            client: {
                api: {
                    call: (method: string, params: Record<string, unknown>) => {
                        calls.push({ method, params });
                        return Promise.resolve(handler(method, params));
                    },
                },
            },
        };
    };

    const NOW = new Date('2026-10-01T05:00:00.000Z');

    it('грузит историю только по префиксам недавно изменённых записей', async () => {
        const { client, calls } = makeBitrix((method, params) => {
            const filter = params.filter as Record<string, unknown>;
            if (method === 'crm.item.list') {
                if (filter['>=updatedTime']) {
                    return {
                        result: {
                            items: [
                                {
                                    id: 20192,
                                    ufCrm8Prefix: 'СН1910И',
                                    ufCrm8NumberDoc: '1',
                                },
                            ],
                        },
                    };
                }
                return {
                    result: {
                        items: [
                            {
                                id: 20192,
                                ufCrm8Prefix: 'СН1910И',
                                ufCrm8NumberDoc: '1',
                            },
                            {
                                id: 20194,
                                ufCrm8Prefix: 'СН1910И',
                                ufCrm8NumberDoc: '14',
                            },
                        ],
                    },
                };
            }
            if (filter['>=DATE_MODIFY']) return { result: [] };
            return {
                result: [
                    {
                        ID: '187716',
                        [DEAL_PREFIX_FIELD]: 'СН1910И',
                        [DEAL_NUMBER_CURRENT_DOC_FIELD]: '1',
                    },
                    {
                        ID: '188178',
                        [DEAL_PREFIX_FIELD]: 'СН1910И',
                        [DEAL_NUMBER_CURRENT_DOC_FIELD]: '2',
                    },
                ],
            };
        });

        const result = await new NumberDuplicatesService(client, 72).run(NOW);

        expect(result.errors).toEqual([]);
        expect(result.recentChecked).toBe(1);
        expect(result.prefixesChecked).toBe(1);
        expect(result.collisions.map((c) => c.key)).toEqual(['СН1910И-1']);
        //два запроса за недавними и по два на каждый префикс — не обход всего портала
        expect(calls).toHaveLength(4);
    });

    it('окно по времени уходит в фильтр в ISO и считается от переданного «сейчас»', async () => {
        const { client, calls } = makeBitrix(() => ({ result: { items: [] } }));
        await new NumberDuplicatesService(client, 72).run(NOW);

        const smartCall = calls.find((c) => c.method === 'crm.item.list');
        expect(
            (smartCall?.params.filter as Record<string, unknown>)[
                '>=updatedTime'
            ],
        ).toBe('2026-09-28T05:00:00.000Z');
    });

    it('обходит страницы: хвост списка не теряется', async () => {
        const { client, calls } = makeBitrix((method, params) => {
            const filter = params.filter as Record<string, unknown>;
            if (method === 'crm.deal.list') return { result: [] };
            if (filter['>=updatedTime']) {
                return {
                    result: {
                        items: [
                            {
                                id: 3,
                                ufCrm8Prefix: 'УПН26',
                                ufCrm8NumberDoc: '9',
                            },
                        ],
                    },
                };
            }
            //история префикса: две страницы, повтор на второй
            if (params.start === 0) {
                return {
                    result: {
                        items: [
                            {
                                id: 1,
                                ufCrm8Prefix: 'УПН26',
                                ufCrm8NumberDoc: '9',
                            },
                        ],
                    },
                    next: 50,
                };
            }
            return {
                result: {
                    items: [
                        { id: 3, ufCrm8Prefix: 'УПН26', ufCrm8NumberDoc: '9' },
                    ],
                },
            };
        });

        const result = await new NumberDuplicatesService(client).run(NOW);

        expect(result.collisions.map((c) => c.key)).toEqual(['УПН26-9']);
        expect(
            calls.filter(
                (c) => c.method === 'crm.item.list' && c.params.start === 50,
            ),
        ).toHaveLength(1);
    });

    it('не зацикливается, если Битрикс вернул то же смещение', async () => {
        let smartCalls = 0;
        const { client } = makeBitrix((method) => {
            if (method === 'crm.deal.list') return { result: [] };
            smartCalls++;
            return { result: { items: [] }, next: 0 };
        });
        await new NumberDuplicatesService(client).run(NOW);
        expect(smartCalls).toBeLessThan(5);
    });

    it('сбой по одному префиксу не прячет остальные', async () => {
        const { client } = makeBitrix((method, params) => {
            const filter = params.filter as Record<string, unknown>;
            if (method === 'crm.deal.list') {
                if (filter['>=DATE_MODIFY']) return { result: [] };
                return { result: [] };
            }
            if (filter['>=updatedTime']) {
                return {
                    result: {
                        items: [
                            {
                                id: 1,
                                ufCrm8Prefix: 'ПЛОХОЙ',
                                ufCrm8NumberDoc: '1',
                            },
                            {
                                id: 2,
                                ufCrm8Prefix: 'ХОРОШИЙ',
                                ufCrm8NumberDoc: '1',
                            },
                        ],
                    },
                };
            }
            if (filter.ufCrm8Prefix === 'ПЛОХОЙ') throw new Error('сеть упала');
            return {
                result: {
                    items: [
                        {
                            id: 2,
                            ufCrm8Prefix: 'ХОРОШИЙ',
                            ufCrm8NumberDoc: '1',
                        },
                        {
                            id: 7,
                            ufCrm8Prefix: 'ХОРОШИЙ',
                            ufCrm8NumberDoc: '1',
                        },
                    ],
                },
            };
        });

        const result = await new NumberDuplicatesService(client).run(NOW);

        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('ПЛОХОЙ');
        expect(result.collisions.map((c) => c.key)).toEqual(['ХОРОШИЙ-1']);
    });
});

describe('NumberDuplicatesUseCase: уведомления', () => {
    const collision = (key: string, ...ids: number[]) => ({
        key,
        holders: ids.map((id, i) => ({
            kind: (i === 0 ? 'smart' : 'deal') as 'smart' | 'deal',
            id,
            prefix: key.split('-')[0],
            number: key.split('-')[1],
        })),
    });
    const result = (
        collisions: ReturnType<typeof collision>[],
        errors: string[] = [],
    ) => ({
        recentChecked: 9,
        prefixesChecked: 3,
        collisions,
        errors,
    });

    const make = (opts: { redisFails?: boolean } = {}) => {
        const stored = new Set<string>();
        const sent: string[] = [];
        const redis = {
            getClient: () => {
                if (opts.redisFails) throw new Error('redis лёг');
                return {
                    sadd: (_key: string, value: string) => {
                        const isNew = !stored.has(value);
                        stored.add(value);
                        return Promise.resolve(isNew ? 1 : 0);
                    },
                    expire: () => Promise.resolve(1),
                };
            },
        };
        const telegram = {
            sendMessage: (text: string) => {
                sent.push(text);
                return Promise.resolve();
            },
        };
        const useCase = new NumberDuplicatesUseCase(
            {} as never,
            telegram as never,
            redis as never,
        );
        return { useCase, sent, stored };
    };

    it('молчит, когда повторов нет', async () => {
        const { useCase, sent } = make();
        await useCase.report(result([]));
        expect(sent).toEqual([]);
    });

    it('называет новый повтор со ссылками на обе записи', async () => {
        const { useCase, sent } = make();
        await useCase.report(result([collision('СН1910И-1', 20192, 187716)]));

        expect(sent).toHaveLength(1);
        expect(sent[0]).toContain('СН1910И-1');
        expect(sent[0]).toContain('/crm/type/159/details/20192/');
        expect(sent[0]).toContain('/crm/deal/details/187716/');
    });

    it('один и тот же повтор при следующем прогоне не звучит снова', async () => {
        const { useCase, sent } = make();
        const same = result([collision('СН1910И-1', 20192, 187716)]);

        await useCase.report(same);
        await useCase.report(same);
        await useCase.report(same);

        expect(sent).toHaveLength(1);
    });

    it('когда к повтору добавилась третья запись, это снова новость', async () => {
        const { useCase, sent } = make();
        await useCase.report(result([collision('УПР24-1', 1282, 1284)]));
        await useCase.report(result([collision('УПР24-1', 1282, 1284, 1286)]));
        expect(sent).toHaveLength(2);
    });

    it('в сообщение попадают только новые повторы, а не вся пачка', async () => {
        const { useCase, sent } = make();
        await useCase.report(result([collision('А-1', 1, 2)]));
        await useCase.report(
            result([collision('А-1', 1, 2), collision('Б-2', 3, 4)]),
        );

        expect(sent[1]).toContain('Б-2');
        expect(sent[1]).not.toContain('А-1');
    });

    it('недоступный Redis не заглушает отчёт', async () => {
        const { useCase, sent } = make({ redisFails: true });
        const fresh = await useCase.report(
            result([collision('СН1910И-1', 20192, 187716)]),
        );

        expect(fresh).toHaveLength(1);
        expect(sent).toHaveLength(1);
    });

    it('ошибки прогона уходят в чат, даже если повторов нет', async () => {
        const { useCase, sent } = make();
        await useCase.report(result([], ['префикс «Х»: сеть упала']));

        expect(sent).toHaveLength(1);
        expect(sent[0]).toContain('с ошибками');
        expect(sent[0]).toContain('сеть упала');
    });

    it('длинный список режется, чтобы влезть в сообщение Telegram', async () => {
        const { useCase, sent } = make();
        const many = Array.from({ length: 30 }, (_, i) =>
            collision(`П-${i + 1}`, i * 2 + 1, i * 2 + 2),
        );
        await useCase.report(result(many));

        expect(sent[0].length).toBeLessThan(4096);
        expect(sent[0]).toContain('…и ещё 18');
    });

    it('подпись хранится под одним ключом Redis', () => {
        expect(REPORTED_SET_KEY).toBe('number-duplicates:reported');
    });
});

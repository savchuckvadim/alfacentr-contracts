/**
 * Сквозные тесты нумерации на подменённом Битриксе.
 *
 * Закрепляют разбор дубля СН1910И-1 от 28.09.2026. Приложение тогда выдало
 * карточке смарта верный номер 13, но записало его в «Номер текущего
 * договора», а договор печатается из «Номер документа» — там осталась
 * единица, которую поставил нумератор в БП.
 */

// Сами сервисы портала и Redis в тестах не нужны, а их импорт тянет за собой
// половину приложения. Классы подменяются пустышками: use-case'ам от них
// нужны только методы, которые подставляются ниже.
jest.mock('@/modules/pbx/pbx.servise', () => ({
    PBXService: class PBXService {},
}));
jest.mock('@/core/redis/redis.service', () => ({
    RedisService: class RedisService {},
}));

import { Logger } from '@nestjs/common';
import type { RedisService } from '@/core/redis/redis.service';
import type { PBXService } from '@/modules/pbx/pbx.servise';
import type { DocumentNumberByPrefixDto } from '../dto/document-number.dto';
import { DocumentCounterService } from '../services/document-counter.service';
import { DocumentNumberByPrefixUseCase } from './document-number-by-prefix.use-case';
import { HealCounterDuplicateUseCase } from './heal-counter-duplicate.use-case';

type Card = Record<string, unknown> & { id: number };
type ListElement = {
    ID: string;
    NAME: string;
    PROPERTY_188: Record<string, string>;
    PROPERTY_190: Record<string, string>;
};

/** Параметры вызовов Битрикса, которые делает нумерация */
interface CallParams {
    id?: number | string;
    filter?: Record<string, unknown>;
    fields?: Record<string, unknown>;
    ELEMENT_ID?: number | string;
    FILTER?: { NAME?: string };
    FIELDS?: {
        NAME: string;
        PROPERTY_188: string | number;
        PROPERTY_190: string | number;
    };
}

const ACTIVE_YES = '156';
const ACTIVE_NO = '158';

/** Битрикс в памяти: ровно те методы, которыми пользуется нумерация */
class FakeBitrix {
    readonly cards = new Map<number, Card>();
    readonly elements = new Map<number, ListElement>();
    readonly calls: { method: string; params: CallParams }[] = [];
    private nextElementId = 500000;

    readonly api = {
        call: (method: string, params: unknown): Promise<unknown> =>
            Promise.resolve(this.handle(method, params as CallParams)),
    };

    addElement(id: number, name: string, counter: number, active = ACTIVE_YES) {
        this.elements.set(id, {
            ID: String(id),
            NAME: name,
            PROPERTY_188: { 1: active },
            PROPERTY_190: { 2: String(counter) },
        });
    }

    addCard(card: Card) {
        this.cards.set(card.id, { ...card });
    }

    card(id: number): Card {
        const card = this.cards.get(id);
        if (!card) throw new Error(`Карточки ${id} нет`);
        return card;
    }

    element(id: number): ListElement {
        const element = this.elements.get(id);
        if (!element) throw new Error(`Элемента списка ${id} нет`);
        return element;
    }

    counterOf(id: number): number {
        return Number(Object.values(this.element(id).PROPERTY_190)[0]);
    }

    activeOf(id: number): string {
        return Object.values(this.element(id).PROPERTY_188)[0];
    }

    count(method: string): number {
        return this.calls.filter((call) => call.method === method).length;
    }

    private handle(method: string, params: CallParams): unknown {
        this.calls.push({ method, params });

        switch (method) {
            case 'crm.item.get':
                return {
                    result: { item: { ...this.card(Number(params.id)) } },
                };

            case 'crm.item.list': {
                const prefix = params.filter?.ufCrm8Prefix;
                const items = [...this.cards.values()]
                    .filter(
                        (card) =>
                            card.ufCrm8Prefix === prefix && !!card.ufCrm8ListId,
                    )
                    .sort((a, b) => a.id - b.id)
                    .map((card) => ({ ...card }));
                return { result: { items } };
            }

            case 'crm.item.update':
                Object.assign(this.card(Number(params.id)), params.fields);
                return { result: { item: { id: params.id } } };

            case 'crm.item.add': {
                const id = 90000 + this.cards.size;
                this.addCard({ ...params.fields, id });
                return { result: { item: { id } } };
            }

            case 'lists.element.get': {
                if (params.ELEMENT_ID) {
                    const element = this.elements.get(
                        Number(params.ELEMENT_ID),
                    );
                    return { result: element ? [{ ...element }] : [] };
                }
                const name = params.FILTER?.NAME;
                return {
                    result: [...this.elements.values()]
                        .filter((element) => element.NAME === name)
                        .map((element) => ({ ...element })),
                };
            }

            case 'lists.element.update': {
                const element = this.element(Number(params.ELEMENT_ID));
                if (!params.FIELDS) throw new Error('Нет FIELDS');
                element.NAME = params.FIELDS.NAME;
                element.PROPERTY_188 = {
                    1: String(params.FIELDS.PROPERTY_188),
                };
                element.PROPERTY_190 = {
                    2: String(params.FIELDS.PROPERTY_190),
                };
                return { result: true };
            }

            case 'lists.element.add': {
                if (!params.FIELDS) throw new Error('Нет FIELDS');
                const id = this.nextElementId++;
                this.addElement(
                    id,
                    params.FIELDS.NAME,
                    Number(params.FIELDS.PROPERTY_190),
                    String(params.FIELDS.PROPERTY_188),
                );
                return { result: id };
            }

            default:
                throw new Error(`Метод ${method} в тесте не описан`);
        }
    }
}

/** Перепроверка без реального ожидания */
class HealWithoutWaiting extends HealCounterDuplicateUseCase {
    protected verifyDelaysMs = [0, 0];
}

const PREFIX = 'СН1910И';
/** Счётчик, который завело приложение: сделки дошли до №12 */
const CANONICAL = 391950;
/** Счётчик, который только что завёл БП, с единицей */
const DUPLICATE = 403456;
const SMART_ID = 20192;

const CONTRACT_FILE = { id: 4232834, url: 'https://example.test/file' };

function setup() {
    const bitrix = new FakeBitrix();
    const redis = {
        getClient: () => ({
            set: () => Promise.resolve('OK'),
            eval: () => Promise.resolve(1),
        }),
    } as unknown as RedisService;
    const pbx = {
        init: () => Promise.resolve({ bitrix }),
    } as unknown as PBXService;

    const counters = new DocumentCounterService(redis);
    const heal = new HealWithoutWaiting(pbx, counters);
    const issue = new DocumentNumberByPrefixUseCase(pbx, counters);

    return { bitrix, heal, issue };
}

/**
 * Состояние портала в момент, когда БП зовёт вебхук: приложение выдало
 * сделкам номера до 12, менеджер создал первую карточку смарта по этому
 * префиксу, БП не нашёл соседей, завёл свой счётчик и поставил единицу.
 */
function afterBpCreatedDuplicate(bitrix: FakeBitrix, card: Partial<Card> = {}) {
    bitrix.addElement(CANONICAL, PREFIX, 12);
    bitrix.addElement(DUPLICATE, PREFIX, 1);
    bitrix.addCard({
        id: SMART_ID,
        ufCrm8Prefix: PREFIX,
        ufCrm8ListId: DUPLICATE,
        ufCrm8NumberDoc: '1',
        ufCrm8NumberCurrentDoc: '',
        ...card,
    });
}

/** То, что пишет шаг «Изменение документа» в ветке «Таких семинаров нет» */
function bpWritesItsOwn(bitrix: FakeBitrix) {
    Object.assign(bitrix.card(SMART_ID), {
        ufCrm8ListId: DUPLICATE,
        ufCrm8NumberDoc: '1',
    });
}

const webhook = {
    smartId: String(SMART_ID),
    elementId: String(DUPLICATE),
    prefix: PREFIX,
};

beforeAll(() => {
    Logger.overrideLogger(false);
});

describe('починка счётчика, который завёл БП', () => {
    it('пишет выданный номер в «Номер документа» — из него печатается договор', async () => {
        const { bitrix, heal } = setup();
        afterBpCreatedDuplicate(bitrix);

        const result = await heal.execute(webhook);
        await heal.whenVerified();

        expect(result).toMatchObject({
            action: 'healed',
            counter: 13,
            canonicalElementId: CANONICAL,
            duplicateElementId: DUPLICATE,
            numberWritten: true,
        });
        expect(bitrix.card(SMART_ID)).toMatchObject({
            ufCrm8NumberDoc: '13',
            ufCrm8NumberCurrentDoc: '13',
            ufCrm8ListId: CANONICAL,
        });
    });

    it('доводит рабочий счётчик и гасит лишний', async () => {
        const { bitrix, heal } = setup();
        afterBpCreatedDuplicate(bitrix);

        await heal.execute(webhook);
        await heal.whenVerified();

        expect(bitrix.counterOf(CANONICAL)).toBe(13);
        expect(bitrix.activeOf(CANONICAL)).toBe(ACTIVE_YES);
        expect(bitrix.counterOf(DUPLICATE)).toBe(1);
        expect(bitrix.activeOf(DUPLICATE)).toBe(ACTIVE_NO);
    });

    it('не меняет номер, если документы уже сформированы', async () => {
        const { bitrix, heal } = setup();
        afterBpCreatedDuplicate(bitrix, {
            ufCrm8DocxCurrentContractNotPt: CONTRACT_FILE,
        });

        const result = await heal.execute(webhook);
        await heal.whenVerified();

        expect(result).toMatchObject({
            action: 'repointed-only',
            numberWritten: false,
            documentsAlreadyBuilt: true,
        });
        expect(bitrix.card(SMART_ID)).toMatchObject({
            ufCrm8NumberDoc: '1',
            ufCrm8ListId: CANONICAL,
        });
    });

    it('единственный счётчик на префикс не трогает', async () => {
        const { bitrix, heal } = setup();
        bitrix.addElement(DUPLICATE, PREFIX, 1);
        bitrix.addCard({
            id: SMART_ID,
            ufCrm8Prefix: PREFIX,
            ufCrm8ListId: DUPLICATE,
            ufCrm8NumberDoc: '1',
        });

        const result = await heal.execute(webhook);
        await heal.whenVerified();

        expect(result.action).toBe('nothing-to-heal');
        expect(bitrix.count('crm.item.update')).toBe(0);
        expect(bitrix.activeOf(DUPLICATE)).toBe(ACTIVE_YES);
        expect(bitrix.card(SMART_ID).ufCrm8NumberDoc).toBe('1');
    });
});

describe('перепроверка после починки', () => {
    it('повторяет запись, если БП вернул свой счётчик и единицу', async () => {
        const { bitrix, heal } = setup();
        afterBpCreatedDuplicate(bitrix);

        await heal.execute(webhook);
        //вебхук дошёл раньше, чем БП выполнил свой шаг записи
        bpWritesItsOwn(bitrix);
        await heal.whenVerified();

        expect(bitrix.card(SMART_ID)).toMatchObject({
            ufCrm8NumberDoc: '13',
            ufCrm8NumberCurrentDoc: '13',
            ufCrm8ListId: CANONICAL,
        });
        //номер тот же: повторная запись счётчик не двигает
        expect(bitrix.counterOf(CANONICAL)).toBe(13);
    });

    it('ничего не пишет, если карточка осталась как была', async () => {
        const { bitrix, heal } = setup();
        afterBpCreatedDuplicate(bitrix);

        await heal.execute(webhook);
        const updatesAfterHeal = bitrix.count('crm.item.update');
        await heal.whenVerified();

        expect(bitrix.count('crm.item.update')).toBe(updatesAfterHeal);
    });

    it('не затирает номер, который позже выдал кто-то другой', async () => {
        const { bitrix, heal } = setup();
        afterBpCreatedDuplicate(bitrix);

        await heal.execute(webhook);
        //например, следующий вебхук по этой же карточке выдал ей 14
        Object.assign(bitrix.card(SMART_ID), {
            ufCrm8NumberDoc: '14',
            ufCrm8NumberCurrentDoc: '14',
        });
        await heal.whenVerified();

        expect(bitrix.card(SMART_ID)).toMatchObject({
            ufCrm8NumberDoc: '14',
            ufCrm8NumberCurrentDoc: '14',
            ufCrm8ListId: CANONICAL,
        });
    });

    it('не меняет номер, если БП вернул своё и документы уже сформированы', async () => {
        const { bitrix, heal } = setup();
        afterBpCreatedDuplicate(bitrix);

        await heal.execute(webhook);
        bpWritesItsOwn(bitrix);
        bitrix.card(SMART_ID).ufCrm8DocxCurrentContractNotPt = CONTRACT_FILE;
        await heal.whenVerified();

        //номер уже в договоре — его не трогаем, но следующие карточки
        //должны находить рабочий счётчик, а не погашенный
        expect(bitrix.card(SMART_ID)).toMatchObject({
            ufCrm8NumberDoc: '1',
            ufCrm8ListId: CANONICAL,
        });
    });

    it('возвращает ссылку на рабочий счётчик и там, где номер не писали', async () => {
        const { bitrix, heal } = setup();
        afterBpCreatedDuplicate(bitrix, {
            ufCrm8DocxCurrentContractNotPt: CONTRACT_FILE,
        });

        await heal.execute(webhook);
        bpWritesItsOwn(bitrix);
        await heal.whenVerified();

        expect(bitrix.card(SMART_ID)).toMatchObject({
            ufCrm8NumberDoc: '1',
            ufCrm8ListId: CANONICAL,
        });
    });
});

describe('выдача номера сделке', () => {
    const request = (prefix: string): DocumentNumberByPrefixDto => ({
        dealId: 187716,
        prefix,
        dinamycPrefix: prefix,
        socketId: 'socket',
    });

    it('для нового префикса заводит счётчик и не создаёт карточек в смарте', async () => {
        const { bitrix, issue } = setup();

        const result = await issue.execute(request(PREFIX));

        expect(result).toMatchObject({
            prefix: PREFIX,
            counter: 1,
            source: 'created',
        });
        expect(bitrix.counterOf(result.elementId)).toBe(1);
        expect(bitrix.count('crm.item.add')).toBe(0);
        expect(bitrix.cards.size).toBe(0);
    });

    it('продолжает счётчик, на который ссылается карточка смарта', async () => {
        const { bitrix, issue } = setup();
        bitrix.addElement(CANONICAL, PREFIX, 13);
        bitrix.addElement(DUPLICATE, PREFIX, 1, ACTIVE_NO);
        bitrix.addCard({
            id: SMART_ID,
            ufCrm8Prefix: PREFIX,
            ufCrm8ListId: CANONICAL,
        });

        const result = await issue.execute(request(PREFIX));

        expect(result).toMatchObject({
            counter: 14,
            elementId: CANONICAL,
            source: 'smart-anchor',
        });
        expect(bitrix.counterOf(CANONICAL)).toBe(14);
    });

    it('после починки сделка получает следующий номер из того же счётчика', async () => {
        const { bitrix, heal, issue } = setup();
        afterBpCreatedDuplicate(bitrix);

        const healed = await heal.execute(webhook);
        await heal.whenVerified();
        const next = await issue.execute(request(PREFIX));

        expect(healed.counter).toBe(13);
        expect(next.counter).toBe(14);
        expect(next.elementId).toBe(CANONICAL);
    });
});

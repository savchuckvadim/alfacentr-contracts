import { AlfaParticipantSmartItemUserFieldsEnum as F } from '@alfa/entities';
import {
    getParticipantFingerprint,
    splitParticipantsToCreate,
} from './participant-fingerprint.rules';

const NBSP = String.fromCharCode(0x00a0);
const ZERO_WIDTH = String.fromCharCode(0x200b);

const participant = (over: Record<string, unknown> = {}) => ({
    [F.ufCrm12Name]: 'Лапченко Юлия Александровна',
    [F.ufCrm12Email]: 'ylapchenko79@mail.ru',
    [F.ufCrm12Phone]: '+79130806311',
    [F.ufCrm12Format]: '1234',
    [F.ufCrm12IsPpk]: '1',
    [F.ufCrm12Days]: ['Барнаул, 23-24 ноября 2026г'],
    ...over,
});

describe('getParticipantFingerprint', () => {
    it('у одинаковых участников отпечаток совпадает', () => {
        expect(getParticipantFingerprint(participant())).toBe(
            getParticipantFingerprint(participant()),
        );
    });

    it('служебные поля на отпечаток не влияют', () => {
        const withService = participant({
            id: 2372,
            stageId: 'DT1036_26:NEW',
            assignedById: 502,
            createdTime: '2026-11-17T16:28:00+07:00',
            parentId2: 204296,
            ufCrm12DealId: '204296',
        });

        expect(getParticipantFingerprint(withService)).toBe(
            getParticipantFingerprint(participant()),
        );
    });

    it('правка любого значимого поля меняет отпечаток', () => {
        const base = getParticipantFingerprint(participant());

        const changed = [
            { [F.ufCrm12Name]: 'Лапченко Юлия Алексеевна' },
            { [F.ufCrm12Email]: 'other@mail.ru' },
            { [F.ufCrm12Phone]: '+79130806312' },
            { [F.ufCrm12Format]: '1235' },
            { [F.ufCrm12IsPpk]: '0' },
            { [F.ufCrm12Days]: ['Новосибирск, 8-9 декабря 2026г'] },
            { [F.ufCrm12AccountantGos]: ['код С'] },
            { [F.ufCrm12AddressForUdost]: 'Барнаул, ул. Ленина 1' },
            { [F.ufCrm12Comment]: 'оплата по счету' },
        ];

        for (const over of changed) {
            expect(getParticipantFingerprint(participant(over))).not.toBe(base);
        }
    });

    it('исправленный регистр ФИО считается правкой', () => {
        expect(
            getParticipantFingerprint(
                participant({ [F.ufCrm12Name]: 'лапченко юлия александровна' }),
            ),
        ).not.toBe(getParticipantFingerprint(participant()));
    });

    it('порядок дней участия не влияет', () => {
        const days = ['Барнаул, 23-24 ноября', 'Новосибирск, 8-9 декабря'];

        expect(
            getParticipantFingerprint(
                participant({ [F.ufCrm12Days]: [...days].reverse() }),
            ),
        ).toBe(
            getParticipantFingerprint(participant({ [F.ufCrm12Days]: days })),
        );
    });

    it('невидимый мусор в email и телефоне не создает нового участника', () => {
        const dirty = participant({
            [F.ufCrm12Email]: ` ylapchenko79${ZERO_WIDTH}@mail.ru `,
            [F.ufCrm12Phone]: `+7${NBSP}913 080 63 11`,
        });
        const clean = participant({
            [F.ufCrm12Phone]: '+7 913 080 63 11',
        });

        expect(getParticipantFingerprint(dirty)).toBe(
            getParticipantFingerprint(clean),
        );
    });

    it('число и строка с тем же значением не различаются', () => {
        expect(
            getParticipantFingerprint(participant({ [F.ufCrm12IsPpk]: 1 })),
        ).toBe(
            getParticipantFingerprint(participant({ [F.ufCrm12IsPpk]: '1' })),
        );
    });

    it('пустое поле и отсутствующее — одно и то же', () => {
        expect(
            getParticipantFingerprint(participant({ [F.ufCrm12Comment]: '' })),
        ).toBe(getParticipantFingerprint(participant()));

        expect(
            getParticipantFingerprint(participant({ [F.ufCrm12Days]: [] })),
        ).toBe(
            getParticipantFingerprint(
                participant({ [F.ufCrm12Days]: undefined }),
            ),
        );
    });
});

describe('splitParticipantsToCreate', () => {
    it('повторный прием той же заявки никого не создает', () => {
        const fromBid = [participant()];
        const existing = [participant()];

        const { toCreate, skipped } = splitParticipantsToCreate(
            fromBid,
            existing,
        );

        expect(toCreate).toHaveLength(0);
        expect(skipped).toHaveLength(1);
    });

    it('первый прием создает всех', () => {
        const fromBid = [
            participant(),
            participant({ [F.ufCrm12Name]: 'Иванов Иван Иванович' }),
        ];

        const { toCreate, skipped } = splitParticipantsToCreate(fromBid, []);

        expect(toCreate).toHaveLength(2);
        expect(skipped).toHaveLength(0);
    });

    it('после правки участник создается заново, прежний не трогаем', () => {
        const existing = [participant({ [F.ufCrm12Phone]: '+79130806300' })];
        const fromBid = [participant()];

        const { toCreate, skipped } = splitParticipantsToCreate(
            fromBid,
            existing,
        );

        expect(toCreate).toHaveLength(1);
        expect(skipped).toHaveLength(0);
    });

    it('дописали второго участника — создается только он', () => {
        const first = participant();
        const second = participant({
            [F.ufCrm12Name]: 'Иванов Иван Иванович',
            [F.ufCrm12Email]: 'ivanov@mail.ru',
        });

        const { toCreate, skipped } = splitParticipantsToCreate(
            [first, second],
            [first],
        );

        expect(toCreate).toEqual([second]);
        expect(skipped).toEqual([first]);
    });

    it('полные близнецы внутри одной заявки создаются оба', () => {
        const { toCreate } = splitParticipantsToCreate(
            [participant(), participant()],
            [],
        );

        expect(toCreate).toHaveLength(2);
    });

    it('участника убрали из заявки — в сделке он остается', () => {
        const existing = [
            participant(),
            participant({ [F.ufCrm12Name]: 'Иванов Иван Иванович' }),
        ];

        const { toCreate, skipped } = splitParticipantsToCreate(
            [participant()],
            existing,
        );

        expect(toCreate).toHaveLength(0);
        expect(skipped).toHaveLength(1);
    });
});

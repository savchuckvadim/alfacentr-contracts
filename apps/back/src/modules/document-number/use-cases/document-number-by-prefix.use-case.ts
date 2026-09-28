import { PBXService } from '@/modules/pbx/pbx.servise';
import { Injectable, Logger } from '@nestjs/common';
import { normalizePrefix } from '@alfa/entities';
import { DocumentNumberByPrefixDto } from '../dto/document-number.dto';
import {
    BitrixApiClient,
    DocumentCounterService,
} from '../services/document-counter.service';

/**
 * Откуда взяли элемент-счётчик — нужно для диагностики расхождений.
 * smart-anchor — по карточке смарта с тем же префиксом, как это делает БП.
 */
export type CounterSource = 'smart-anchor' | 'list-by-name' | 'created';

export interface DocumentNumberByPrefixResult {
    prefix: string;
    counter: number;
    elementId: number;
    source: CounterSource;
}

@Injectable()
export class DocumentNumberByPrefixUseCase {
    private readonly logger = new Logger(DocumentNumberByPrefixUseCase.name);

    constructor(
        private readonly pbxService: PBXService,
        private readonly counters: DocumentCounterService,
    ) {}

    async execute(
        dto: DocumentNumberByPrefixDto,
    ): Promise<DocumentNumberByPrefixResult> {
        const prefix = normalizePrefix(dto.prefix || dto.dinamycPrefix);
        if (!prefix) {
            throw new Error(
                `Пустой префикс, номер выдать нельзя. dealId=${dto.dealId}`,
            );
        }

        return await this.counters.withLock(prefix, () =>
            this.issueNumber(prefix, dto.dealId),
        );
    }

    private async issueNumber(
        prefix: string,
        dealId: number,
    ): Promise<DocumentNumberByPrefixResult> {
        const { bitrix } = await this.pbxService.init('alfacentr.bitrix24.ru');

        const found = await this.resolveCounterElement(bitrix, prefix);

        if (!found) {
            /**
             * Для нового префикса заводим только счётчик.
             *
             * Раньше вместе с ним создавалась служебная карточка смарта
             * «Счётчик нумерации …» с префиксом и LIST_ID — чтобы нумератор
             * в БП нашёл наш счётчик и не завёл свой. Это не работало: БП
             * запускается на любую новую карточку, стирает у неё префикс и
             * вычисляет заново из названий товаров. У служебной карточки
             * товаров нет, префикс оставался пустым, и по префиксу она не
             * находилась. Побочно БП создавал ей пустую сделку.
             *
             * Поэтому первая карточка смарта по такому префиксу всё равно
             * заведёт лишний счётчик с единицей — и тут же сообщит об этом
             * вебхуком. Расхождение закрывает HealCounterDuplicateUseCase:
             * выдаёт карточке следующий номер из нашего счётчика.
             */
            const elementId = await this.counters.createElement(bitrix, prefix);
            this.logger.log(
                `Создан счётчик для префикса «${prefix}»: элемент ${elementId}, номер 1 (сделка ${dealId})`,
            );
            return { prefix, counter: 1, elementId, source: 'created' };
        }

        const counter = found.counter + 1;
        await this.counters.writeCounter(
            bitrix,
            found.elementId,
            prefix,
            counter,
        );

        this.logger.log(
            `Префикс «${prefix}»: номер ${counter}, элемент ${found.elementId}, источник ${found.source} (сделка ${dealId})`,
        );

        return {
            prefix,
            counter,
            elementId: found.elementId,
            source: found.source,
        };
    }

    /**
     * Порядок важен:
     * 1. Карточка смарта 159 с этим префиксом и заполненным LIST_ID. Именно
     *    по ней БП находит счётчик, и если она есть, брать надо тот же
     *    элемент — иначе приложение и БП считают каждый от своего.
     * 2. Элемент списка 46 по названию — счётчик, который мы завели сами,
     *    когда карточек смарта с таким префиксом ещё не было.
     */
    private async resolveCounterElement(
        bitrix: BitrixApiClient,
        prefix: string,
    ): Promise<{
        elementId: number;
        counter: number;
        source: CounterSource;
    } | null> {
        const anchorId = await this.counters.findAnchorElementId(
            bitrix,
            prefix,
        );
        if (anchorId) {
            const counter = await this.counters.readCounter(
                bitrix,
                anchorId,
                prefix,
            );
            if (counter !== null) {
                return { elementId: anchorId, counter, source: 'smart-anchor' };
            }
            this.logger.warn(
                `Префикс «${prefix}»: карточка смарта ссылается на элемент ${anchorId}, но его нет в списке счётчиков`,
            );
        }

        const elements = await this.counters.findElementsByName(bitrix, prefix);
        const best = this.counters.pickBest(elements, prefix);
        return best ? { ...best, source: 'list-by-name' } : null;
    }
}

import { PBXService } from '@/modules/pbx/pbx.servise';
import { Injectable } from '@nestjs/common';
import { DocumentNumberByPrefixDto } from '../dto/document-number.dto';
import {
    CounterAddBxListDto,
    CounterGetBxListDto,
} from '../dto/add-counter-bx-list.dto';
import { ICounterGetBxList } from '../type/counter-bx-list.type';

@Injectable()
export class DocumentNumberByPrefixUseCase {
    constructor(private readonly pbxService: PBXService) {}

    async execute(dto: DocumentNumberByPrefixDto) {
        // try {

        const { bitrix, PortalModel } = await this.pbxService.init(
            'alfacentr.bitrix24.ru',
        );
        const listId = 46;
        const listResponse = await bitrix.list.getList(undefined, listId);

        const list = listResponse.result;
        const listCode = list.CODE;
        const prefix = dto.prefix;
        let counter = 0;
        const elementResponse = await bitrix.api.call('lists.element.get', {
            IBLOCK_TYPE_ID: 'lists',
            IBLOCK_ID: listId,
            // ELEMENT_CODE//
            FILTER: {
                NAME: prefix,
            },
        });

        const addData: CounterAddBxListDto = {
            IBLOCK_TYPE_ID: 'lists',

            ELEMENT_CODE: this.transliterate(prefix),
            IBLOCK_ID: 46,

            FIELDS: {
                CREATED_BY: 514,
                NAME: prefix,
                PROPERTY_190: 7,
                PROPERTY_188: '156',
            },
        };
        const get = elementResponse.result[0] as
            | CounterGetBxListDto
            | undefined;
        let add = 0;
        let updated = 0;
        if (!get) {
            const elementAddResponse = await bitrix.api.call(
                'lists.element.add',
                addData,
            );
            add = elementAddResponse.result;
            counter = 1;
        } else {
            counter = this.getCounter(get);
            const elementUpdateResponse = await bitrix.api.call(
                'lists.element.update',
                {
                    ...addData,
                    FIELDS: {
                        ...get,
                        PROPERTY_190: counter,
                    },
                },
            );
            updated = elementUpdateResponse.result;
        }

        return { get, add, updated, prefix, counter };
        // } catch (error) {
        //     return { error: error.message }
        // }
    }
    private getCounter(dto: CounterGetBxListDto) {
        let counter = 0;
        for (const key in dto.PROPERTY_190) {
            counter = Number(dto.PROPERTY_190[key]);
        }
        counter += 1;
        return counter;
    }
    private transliterate(text: string): string {
        const map: Record<string, string> = {
            а: 'a',
            б: 'b',
            в: 'v',
            г: 'g',
            д: 'd',
            е: 'e',
            ё: 'e',
            ж: 'zh',
            з: 'z',
            и: 'i',
            й: 'y',
            к: 'k',
            л: 'l',
            м: 'm',
            н: 'n',
            о: 'o',
            п: 'p',
            р: 'r',
            с: 's',
            т: 't',
            у: 'u',
            ф: 'f',
            х: 'h',
            ц: 'ts',
            ч: 'ch',
            ш: 'sh',
            щ: 'sch',
            ъ: '',
            ы: 'y',
            ь: '',
            э: 'e',
            ю: 'yu',
            я: 'ya',
        };

        return text
            .toLowerCase()
            .split('')
            .map((char) => map[char] ?? char)
            .join('');
    }
}

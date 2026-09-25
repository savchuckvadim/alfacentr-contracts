import { ReactNode } from 'react';
import { CalendarDaysIcon, CheckCircle, Package, Users } from 'lucide-react';
import { ParticipantsTableWidget } from '@/modules/widgetes/Participant/ParticipantsTable/ParticipantsTableWidget';
import {
    ContractPreview,
    PpkApplicationTableWidget,
    ProductsTableWidget,
    TPpkApplicationLive,
} from '@/modules/widgetes';

/**
 * Всё, от чего зависит показ виджетов главной страницы.
 *
 * Вычисляется один раз в MainPageContent и раздаётся реестру: условия показа
 * не лезут в стор сами, поэтому один и тот же виджет на главном табе и в
 * своём табе решает «показывать или нет» по одним и тем же данным.
 */
export interface IMainPageWidgetContext {
    /** Договор УП: участников в нём нет */
    isUp: boolean;
    /** ППК-договор и хотя бы одна пара «участник — программа» */
    withPpkApplication: boolean;
    /** Состояние приложения ППК — одно на главный таб и на свой таб */
    ppk: TPpkApplicationLive;
}

export interface IMainPageWidget {
    /** Значение таба; порядок табов задаёт порядок в реестре */
    value: string;
    label: string;
    icon: ReactNode;
    /** Глобальное условие показа: действует и на таб, и на карточку на главном */
    isVisible: (ctx: IMainPageWidgetContext) => boolean;
    render: (ctx: IMainPageWidgetContext) => ReactNode;
    /**
     * Карточка на табе «Основные данные». Нет поля — виджет живёт только
     * в своём табе. Порядок на главном свой, он не совпадает с порядком табов:
     * то, что надо подготовить заранее, поднимается наверх.
     */
    main?: {
        order: number;
        title?: string;
    };
}

/**
 * Реестр виджетов главной страницы.
 *
 * Условие показа и место появления задаются здесь один раз. Раньше главный
 * таб и отдельные табы собирались руками в двух местах, и каждое условие
 * приходилось повторять дважды — при добавлении виджета одно из мест
 * неизбежно забывалось.
 */
export const MAIN_PAGE_WIDGETS: IMainPageWidget[] = [
    {
        value: 'products',
        label: 'Товары',
        icon: <Package />,
        isVisible: () => true,
        render: () => <ProductsTableWidget />,
        main: { order: 10, title: 'Товары' },
    },
    {
        value: 'participants',
        label: 'Участники',
        icon: <Users />,
        isVisible: ctx => !ctx.isUp,
        render: () => <ParticipantsTableWidget />,
        //заголовок рисует сам виджет вместе с кнопкой добавления
        main: { order: 20 },
    },
    {
        value: 'ppk-application',
        label: 'Приложение ППК',
        icon: <CalendarDaysIcon />,
        isVisible: ctx => ctx.withPpkApplication,
        render: ctx => <PpkApplicationTableWidget ppk={ctx.ppk} />,
        //наверху главного: даты готовят заранее, до окна отправки
        main: { order: 0, title: 'Приложение ППК' },
    },
    {
        value: 'contract',
        label: 'Что будет в договоре',
        icon: <CheckCircle />,
        isVisible: () => true,
        render: () => <ContractPreview />,
        main: { order: 30, title: 'Договор' },
    },
];

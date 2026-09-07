import { useAppDispatch, useAppSelector } from '@/modules/app/';
import {
    AlfaParticipantSmartItemUserFieldsEnum,
    IPpkEvent,
    isPpkEventDatesValid,
    parsePpkEvents,
    serializePpkEvents,
} from '@alfa/entities';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { CalendarIcon } from 'lucide-react';
import { FC } from 'react';
import { upsertEditableField } from '@/modules/entities/participant/model/ParticipantSlice';

export interface ParticipantPpkEventDatesProps {
    /** «Название в заявке» программы — ключ, по которому хранятся даты */
    topic: string;
}

/**
 * Даты обучения по одной программе ППК.
 *
 * Даты у каждого участника свои: двое на одной программе могут учиться
 * в разные периоды, поэтому они живут не у товара, а у участника —
 * в служебном поле со списком пар «программа — даты».
 */
export const ParticipantPpkEventDates: FC<ParticipantPpkEventDatesProps> = ({
    topic,
}) => {
    const dispatch = useAppDispatch();
    const editable = useAppSelector(state => state.participant.editable);

    const normalizedTopic = (topic || '').trim();

    const rawEvents = editable?.fields.find(
        field =>
            field.bitrixId ===
            AlfaParticipantSmartItemUserFieldsEnum.ufCrm12PpkEvents,
    )?.value;

    const events = parsePpkEvents(rawEvents as string);
    const current = events.find(event => event.topic === normalizedTopic);

    const dateFrom = current?.dateFrom || '';
    const dateTo = current?.dateTo || '';

    const isInvalid =
        !!normalizedTopic &&
        !isPpkEventDatesValid({ topic: normalizedTopic, dateFrom, dateTo });

    const saveDates = (nextFrom: string, nextTo: string) => {
        if (!normalizedTopic) return;

        const rest = events.filter(event => event.topic !== normalizedTopic);
        const next: IPpkEvent[] = [
            ...rest,
            { topic: normalizedTopic, dateFrom: nextFrom, dateTo: nextTo },
        ];

        dispatch(
            upsertEditableField({
                bitrixId:
                    AlfaParticipantSmartItemUserFieldsEnum.ufCrm12PpkEvents,
                value: serializePpkEvents(next),
            }),
        );
    };

    if (!normalizedTopic) return null;

    return (
        <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                    Даты обучения
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                        Дата начала
                    </Label>
                    <Input
                        type="date"
                        value={dateFrom}
                        onChange={e => saveDates(e.target.value, dateTo)}
                        className={isInvalid ? 'border-red-500' : ''}
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                        Дата окончания
                    </Label>
                    <Input
                        type="date"
                        value={dateTo}
                        onChange={e => saveDates(dateFrom, e.target.value)}
                        className={isInvalid ? 'border-red-500' : ''}
                    />
                </div>
            </div>

            {isInvalid && (
                <Label className="text-xs text-red-500">
                    {dateFrom && dateTo
                        ? 'Дата начала позже даты окончания'
                        : 'Заполните обе даты — без них не сформировать приложение ППК'}
                </Label>
            )}
        </div>
    );
};

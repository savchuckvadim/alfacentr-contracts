import {
    BidItemsByParticipantsResult,
    BidParticipantItem,
} from '@/modules/on-deal-init/use-cases/get-deal-bid-items.use-case';
import { escapeHtml } from './email-utils';

const renderParticipantItem = (participant: BidParticipantItem): string => {
    const lines = participant.lines
        .map(line => {
            const [name, ...valueParts] = line.split(':');
            const value = valueParts.join(':').trim();
            return `<div style="margin: 0; padding: 0;"><b>${escapeHtml(name || '')}:</b> ${escapeHtml(value)}</div>`;
        })
        .join('');

    return `<div style="margin-top: 8px; margin-bottom: 4px;"><b>${escapeHtml(participant.title)}</b></div>${lines}`;
};

export const renderBidHtml = (bidData: BidItemsByParticipantsResult): string => {
    const infoHtml = bidData.bidLines
        .map(line => {
            const [name, ...valueParts] = line.split(':');
            const value = valueParts.join(':').trim();
            if (!value) return '';
            return `<li><b>${escapeHtml(name || '')}:</b> ${escapeHtml(value)}</li>`;
        })
        .filter(Boolean)
        .join('');

    const participantsHtml = bidData.participants.length
        ? `<div style="margin-bottom: 1px; width: 100%; display: flex; justify-content: center; align-items: center;"><h3>Участники</h3></div>${bidData.participants
              .map(renderParticipantItem)
              .join('')}`
        : '';

    return `${infoHtml ? `<ul style="margin:0;padding-left:22px;">${infoHtml}</ul>` : ''}${participantsHtml}`;
};

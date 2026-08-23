import { ProductResolveIssue } from './alfa-product.service';

const MAX_CANDIDATES_IN_MESSAGE = 5;
//telegram режет длинные сообщения, оставляем запас
const MAX_TELEGRAM_MESSAGE_LENGTH = 3500;

const getIssueTitle = (issue: ProductResolveIssue): string =>
    issue.kind === 'not_found'
        ? 'семинар не найден в каталоге'
        : 'несколько подходящих товаров, выбрать не смогли';

/**
 * Комментарий в таймлайн сделки — его читает ответственный менеджер
 */
export const renderIssuesForTimeline = (
    issues: ProductResolveIssue[],
): string => {
    const lines = ['🚨 [B]Не удалось подобрать товары по заявке[/B]'];

    for (const issue of issues) {
        const where = issue.fieldName ? ` (${issue.fieldName})` : '';
        lines.push(`• [B]${getIssueTitle(issue)}[/B]${where}`);

        if (issue.query) lines.push(`  Название из заявки: ${issue.query}`);

        if (issue.kind === 'ambiguous') {
            for (const candidate of issue.candidates.slice(
                0,
                MAX_CANDIDATES_IN_MESSAGE,
            )) {
                lines.push(`  — ${candidate.name}`);
            }
            if (issue.candidates.length > MAX_CANDIDATES_IN_MESSAGE) {
                lines.push(
                    `  — и еще ${issue.candidates.length - MAX_CANDIDATES_IN_MESSAGE}`,
                );
            }
        }
    }

    lines.push('Добавьте недостающие товары в сделку вручную.');
    return lines.join(' \n');
};

/**
 * Сообщение в телеграм для нас
 */
export const renderIssuesForTelegram = (
    dealId: number | string,
    issues: ProductResolveIssue[],
): string => {
    const lines = [`ALFA ON DEAL INIT: сделка ${dealId} — проблемы с товарами`];

    for (const issue of issues) {
        lines.push(
            `- ${getIssueTitle(issue)} | ${issue.fieldName || 'поле не указано'} | "${issue.query}"`,
        );
        if (issue.kind === 'ambiguous') {
            for (const candidate of issue.candidates.slice(
                0,
                MAX_CANDIDATES_IN_MESSAGE,
            )) {
                lines.push(`    id ${candidate.id}: ${candidate.name}`);
            }
        }
    }

    const message = lines.join('\n');
    return message.length > MAX_TELEGRAM_MESSAGE_LENGTH
        ? `${message.slice(0, MAX_TELEGRAM_MESSAGE_LENGTH)}\n… список обрезан`
        : message;
};

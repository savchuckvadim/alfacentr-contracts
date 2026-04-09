import { EMAIL_STYLES } from './email-styles';

export const escapeHtml = (value: string): string =>
    value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

export const link = (href: string, label: string) =>
    `<a href="${href}" style="color:${EMAIL_STYLES.link};text-decoration:none;font-weight:500;">${label}</a>`;

export const paragraph = (html: string) =>
    `<p style="margin:0 0 16px;font-family:${EMAIL_STYLES.font};font-size:15px;line-height:1.55;color:${EMAIL_STYLES.text};">${html}</p>`;

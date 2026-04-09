import { EMAIL_STYLES } from './email-styles';
import { escapeHtml } from './email-utils';

export const renderEdoEmployeeHtml = (params: {
    edoComment: string;
    userName: string;
    dealUrl: string;
    dealId: number;
    companyName: string;
}): string => {
    return `
<div style="border:0;border-top:1px solid ${EMAIL_STYLES.border};margin:24px 0;"></div>
<p style="margin:0 0 8px;text-align:center;font-family:${EMAIL_STYLES.font};font-size:15px;line-height:1.55;color:${EMAIL_STYLES.text};"><strong>Комментарий для сотрудника ОДО:</strong></p>
<p style="margin:0 0 20px;text-align:left;font-family:${EMAIL_STYLES.font};font-size:15px;line-height:1.55;color:${EMAIL_STYLES.text};">${params.edoComment ? escapeHtml(params.edoComment) : ''}</p>
<div style="border:0;border-top:1px solid ${EMAIL_STYLES.border};margin:24px 0;"></div>
<p style="margin:0 0 8px;text-align:center;font-family:${EMAIL_STYLES.font};font-size:15px;line-height:1.55;color:${EMAIL_STYLES.text};"><strong>Исполнитель:</strong></p>
<p style="margin:0 0 16px;font-family:${EMAIL_STYLES.font};font-size:15px;line-height:1.55;color:${EMAIL_STYLES.text};">${params.userName ? escapeHtml(params.userName) : ''}</p>
<p style="margin:0;text-align:left;font-family:${EMAIL_STYLES.font};font-size:15px;line-height:1.55;color:${EMAIL_STYLES.text};">
<a href="${params.dealUrl}" style="color:${EMAIL_STYLES.link};text-decoration:none;font-weight:500;">Документация</a><br />
${params.dealId} ${params.companyName ? `"${escapeHtml(params.companyName)}"` : ''}
</p>`;
};

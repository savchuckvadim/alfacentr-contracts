import { EMAIL_STYLES } from './email-styles';
import { escapeHtml, link, paragraph } from './email-utils';

export const renderDocumentLetterInnerHtml = (params: {
    bidHtml: string;
    edoBlock: string;
    name: string;
    phone: string;
}): string => {
    const namePart = params.name
        ? `, <span style="color:${EMAIL_STYLES.accent};font-weight:500;">${escapeHtml(params.name)}</span>`
        : '';
    const phonePart = params.phone
        ? `, <span style="color:${EMAIL_STYLES.accent};font-weight:500;">${escapeHtml(params.phone)}</span>`
        : '';

    return `
${paragraph(
    `<em style="color:${EMAIL_STYLES.muted};font-size:13px;line-height:1.5;">Письмо сформировано автоматически. При ответе, просто нажмите&nbsp;<strong>«ОТВЕТИТЬ»</strong>&nbsp;или введите ${link('mailto:ppk@alfasibir.ru', '<strong><em>ppk@alfasibir.ru</em></strong>')} в строке «Адрес получателя/Кому».</em>`,
)}
${paragraph(`Добрый день${namePart}!<br>Во вложении -&nbsp;<strong>Договор</strong>,&nbsp;<strong>Счет </strong>и <strong>УПД </strong>на согласование.`)}
${paragraph('Пожалуйста, проверьте <strong>реквизиты</strong>, а также <strong>текст документов</strong>.')}
<ul style="margin:0 0 20px;padding-left:22px;font-family:${EMAIL_STYLES.font};font-size:15px;line-height:1.55;color:${EMAIL_STYLES.text};">
<li style="margin:0 0 12px;"><strong>Если документы соответствуют требованиям Вашего учреждения</strong> - подпишите, пожалуйста, его в системе ЭДО. Если Ваше учреждение не использует систему ЭДО, то направьте нам ответным e-mail скан Договора, заверенного с Вашей стороны печатью и подписью руководителя.<br>Наш<strong>&nbsp;СБИС&nbsp;ID: 2BEbe3508291e7a494ca4d051e2230821b1 </strong>(Оператор&nbsp;ООО "Компания "Тензор")</li>
<li style="margin:0;"><strong>Если документы требуют корректировки</strong> - откорректированный текст договора, вышлите, пожалуйста, ответным e-mail в текстовом формате (например Word).</li>
</ul>
${paragraph(
    `В течение 1 рабочего дня с момента направления данного письма на номер телефона${phonePart} Вам позвонит робот Ирина для подтверждения получения документов. Просим Вас подтвердить получение простым ответом "ДА".`,
)}
${paragraph(
    `С уважением,<br>
Чехуркина Наталья,<br>
Специалист по документообороту,<br>
Центр правовой поддержки ООО "АЛЬФАЦЕНТР",<br>
Почтовый адрес: 630073, г. Новосибирск, а/я 202<br>
тел. многоканальный: 8 (383) 383-24-15 доб.106<br>
${link('http://e.mail.ru/compose/?mailto=mailto%3appk@alfasibir.ru', 'ppk@alfasibir.ru')}<br>
Сайт компании: ${link('https://alfacentr.org/', 'https://alfacentr.org')}<br>
<span style="color:${EMAIL_STYLES.muted};">Социальные сети:</span><br>
${link('https://vk.com/alfacentr_nsk', 'https://vk.com/alfacentr_nsk')}<br>
${link('https://ok.ru/group/68876292653111', 'https://ok.ru/group/68876292653111')}<br>
<img width="386" height="47" alt="logo" src="https://i.imgur.com/DucbqTv.png" style="display:block;margin-top:12px;max-width:100%;height:auto;border:0;" />`,
)}
<div style="border:0;border-top:1px solid ${EMAIL_STYLES.border};margin:24px 0;"></div>
<p style="margin:0 0 8px;text-align:center;font-family:${EMAIL_STYLES.font};font-size:15px;line-height:1.55;color:${EMAIL_STYLES.text};"><strong>Исходная заявка клиента:</strong></p>
<div style="font-family:${EMAIL_STYLES.font};font-size:15px;line-height:1.55;color:${EMAIL_STYLES.text};text-align:left;">${params.bidHtml}<br></div>
${params.edoBlock}
`;
};

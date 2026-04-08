import { BitrixActivityTypeId } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
import { BitrixService } from '@/modules/bitrix/bitrix.service';
import { GetDealBidItemsUseCase } from '@/modules/on-deal-init/use-cases/get-deal-bid-items.use-case';
import { BitrixOwnerTypeId } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
import { BXActivityCommunication, IBXActivity } from '@/modules/bitrix/domain/activity/interfaces/bx-activity.interface';
import { EmployeeEdoService, IEmployeeEdoInfo } from '@/common/employee-edo/employee-edo.service';
import { randomUUID } from 'crypto';

//документы в email
// юр лицо:
// Договор doc
//счет doc и pdf
// приложение 1  doc
// акт об оказании услуг doc

// физ лицо:
// Договор doc
// счет с QR doc и pdf
// приложение 1  doc
// акт об оказании услуг doc
const baseUrl = process.env.BASE_URL || 'https://alfacentr.bitrix24.ru/';

/** Inline email styles (Bitrix / HTML activity — no Tailwind at runtime; fonts via Google Fonts link in &lt;head&gt;) */
const EM = {
    font: "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    text: '#202124',
    muted: '#5f6368',
    link: '#1a73e8',
    accent: '#174ea6',
    border: '#dadce0',
    surface: '#ffffff',
    pageBg: '#f8f9fa',
} as const;

export class EmailServiceInitDto {
    filesForSend: [string, string][] = [];
    email: string;
    name: string;
    phone: string;
    subject: string;
    body: string;
    bid: string;
    userEmail: string;
}
export class EmailService {
    private bidService: GetDealBidItemsUseCase;

    private readonly employeeEdoInfo: IEmployeeEdoInfo;
    constructor(
        private readonly bitrix: BitrixService,
        private readonly filesForSend: [string, string][] = [],
        private readonly email: string,
        private readonly name: string,
        private readonly phone: string,
        private readonly documentPrefixNumber: string,
        private readonly dealId: number,
        private readonly companyName: string,
        private readonly userName: string = '',
        private readonly userId: string,
        private readonly contactId: number,
        private readonly edoComment: string,
    ) {
        this.bidService = new GetDealBidItemsUseCase(this.bitrix);
        const employeeEdoService = new EmployeeEdoService();

        this.employeeEdoInfo = employeeEdoService.getEmployeeEdoInfo();


    }

    async send() {

        const sendData = await this.getDataForSend(false);
        console.log('send for client sendData', sendData);
        await this.bitrix.activity.createActivity(sendData);

    }

    async sendForEdoEmployee() {
        const sendData = await this.getDataForSend(true);
        console.log('sendForEdoEmployee sendData', sendData);
        await this.bitrix.activity.createActivity(sendData);

    }

    private async getDataForSend(
        isForEdo: boolean = false,
    ): Promise<IBXActivity> {
        const uuid = randomUUID();
        console.log('uuid', uuid);
        const ownerType = isForEdo ? BitrixOwnerTypeId.CONTACT : BitrixOwnerTypeId.DEAL;
        const ownerId = isForEdo ? this.employeeEdoInfo.contactId : this.dealId;
        const contactId = isForEdo ? this.employeeEdoInfo.contactId : this.contactId;
        const subject = isForEdo
            ? `TEST ЭДО ${uuid} Документы на согласование Договор №${this.documentPrefixNumber} для сотрудника ЭДО "${this.employeeEdoInfo.name}" от ООО "Альфацентр"`
            : `TEST ${uuid} Документы на согласование Договор №${this.documentPrefixNumber} от ООО "Альфацентр"`;

        const communication = {
            ENTITY_ID: contactId,
            ENTITY_TYPE_ID: 3, //CONTACT
            // TYPE_ID: 1,

            VALUE: isForEdo ? this.employeeEdoInfo.email : this.email,
        } as BXActivityCommunication;

        const employeeEdoName = isForEdo ? this.userName || this.employeeEdoInfo.name : this.employeeEdoInfo.name;
        const settings = {
            MESSAGE_FROM: `Альфацентр ${employeeEdoName} <${this.employeeEdoInfo.email}>`,


        };

        try {

            const body = isForEdo
                ? await this.getEmailHtmlBody(isForEdo)
                : await this.getClientEmailHtmlBody();

            const sendData = {

                OWNER_TYPE_ID: ownerType,
                OWNER_ID: ownerId,
                TYPE_ID: BitrixActivityTypeId.EMAIL,
                DIRECTION: 2, // 1 - incoming, 2 - outgoing
                RESPONSIBLE_ID: this.userId.toString(),

                SETTINGS: {
                    MESSAGE_FROM: settings.MESSAGE_FROM,
                },
                SUBJECT: subject,
                DESCRIPTION: body,
                COMPLETED: 'Y',
                DESCRIPTION_TYPE: 3, // HTML
                START_TIME: new Date().toISOString(),
                END_TIME: new Date(Date.now() + 3600).toISOString(),
                COMMUNICATIONS: [
                    communication
                ],
                FILES: this.filesForSend.map((file) => ({
                    fileData: file,
                })),
            } as IBXActivity;


            return sendData;
        } catch (error) {
            console.error('error', error);
            throw error;
        }
    }
    async getClientEmailHtmlBody(): Promise<string> {
        const bid = await this.getBidHtml();
        const inner = this.buildDocumentLetterHtml(bid, '');
        return this.wrapDocumentEmailHtml(inner);
    }

    async getEmailHtmlBody(
        includeEdoEmployee: boolean = false,
    ): Promise<string> {
        const bid = await this.getBidHtml();
        const edoEmployeeHtml = includeEdoEmployee
            ? await this.getEdoEmployeeHtmlComponent()
            : '';
        const inner = this.buildDocumentLetterHtml(bid, edoEmployeeHtml);
        return this.wrapDocumentEmailHtml(inner);
    }

    /**
     * Общая разметка письма (текст без изменений по смыслу).
     * Tailwind здесь не используется: Bitrix получает готовый HTML; стили — инлайн + шрифт в head.
     */
    private buildDocumentLetterHtml(bidHtml: string, edoBlock: string): string {
        const p = (html: string) =>
            `<p style="margin:0 0 16px;font-family:${EM.font};font-size:15px;line-height:1.55;color:${EM.text};">${html}</p>`;
        const link = (href: string, label: string) =>
            `<a href="${href}" style="color:${EM.link};text-decoration:none;font-weight:500;">${label}</a>`;
        const namePart = this.name
            ? `, <span style="color:${EM.accent};font-weight:500;">${this.name}</span>`
            : '';
        const phonePart = this.phone
            ? `, <span style="color:${EM.accent};font-weight:500;">${this.phone}</span>`
            : '';

        return `
${p(
    `<em style="color:${EM.muted};font-size:13px;line-height:1.5;">Письмо сформировано автоматически. При ответе, просто нажмите&nbsp;<strong>«ОТВЕТИТЬ»</strong>&nbsp;или введите ${link('mailto:ppk@alfasibir.ru', '<strong><em>ppk@alfasibir.ru</em></strong>')} в строке «Адрес получателя/Кому».</em>`,
)}
${p(`Добрый день${namePart}!<br>Во вложении -&nbsp;<strong>Договор</strong>,&nbsp;<strong>Счет </strong>и <strong>Акт </strong>на согласование.`)}
${p('Пожалуйста, проверьте <strong>реквизиты</strong>, а также <strong>текст документов</strong>.')}
<ul style="margin:0 0 20px;padding-left:22px;font-family:${EM.font};font-size:15px;line-height:1.55;color:${EM.text};">
<li style="margin:0 0 12px;"><strong>Если документы соответствуют требованиям Вашего учреждения</strong> - подпишите, пожалуйста, его в системе ЭДО. Если Ваше учреждение не использует систему ЭДО, то направьте нам ответным e-mail скан Договора, заверенного с Вашей стороны печатью и подписью руководителя.<br>Наш<strong>&nbsp;СБИС&nbsp;ID: 2BEbe3508291e7a494ca4d051e2230821b1 </strong>(Оператор&nbsp;ООО "Компания "Тензор")</li>
<li style="margin:0;"><strong>Если документы требуют корректировки</strong> - откорректированный текст договора, вышлите, пожалуйста, ответным e-mail в текстовом формате (например Word).</li>
</ul>
${p(
    `В течение 1 рабочего дня с момента направления данного письма на номер телефона${phonePart} Вам позвонит робот Ирина для подтверждения получения документов. Просим Вас подтвердить получение простым ответом "ДА".`,
)}
${p(
    `С уважением,<br>
Чехуркина Наталья,<br>
Специалист по документообороту,<br>
Центр правовой поддержки ООО "АЛЬФАЦЕНТР",<br>
Почтовый адрес: 630073, г. Новосибирск, а/я 202<br>
тел. многоканальный: 8 (383) 383-24-15 доб.106<br>
${link('http://e.mail.ru/compose/?mailto=mailto%3appk@alfasibir.ru', 'ppk@alfasibir.ru')}<br>
Сайт компании: ${link('https://alfacentr.org/', 'https://alfacentr.org')}<br>
<span style="color:${EM.muted};">Социальные сети:</span><br>
${link('https://vk.com/alfacentr_nsk', 'https://vk.com/alfacentr_nsk')}<br>
${link('https://ok.ru/group/68876292653111', 'https://ok.ru/group/68876292653111')}<br>
<img width="386" height="47" alt="logo" src="https://i.imgur.com/DucbqTv.png" style="display:block;margin-top:12px;max-width:100%;height:auto;border:0;" />`,
)}
<div style="border:0;border-top:1px solid ${EM.border};margin:24px 0;"></div>
<p style="margin:0 0 8px;text-align:center;font-family:${EM.font};font-size:15px;line-height:1.55;color:${EM.text};"><strong>Исходная заявка клиента:</strong></p>
<div style="font-family:${EM.font};font-size:15px;line-height:1.55;color:${EM.text};text-align:left;">${bidHtml}<br></div>
${edoBlock}
`;
    }

    private wrapDocumentEmailHtml(innerHtml: string): string {
        const uuid = randomUUID();
        return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
</head>
<body id="email-body-${uuid}" style="margin:0;padding:12px 8px;background:${EM.pageBg};-webkit-font-smoothing:antialiased;">
  <div style="max-width:980px;margin:0 auto;background:${EM.surface};border-radius:12px;padding:24px 24px;box-shadow:0 1px 2px rgba(60,64,67,0.08),0 2px 8px rgba(60,64,67,0.06);">
    ${innerHtml.trim()}
  </div>
</body>
</html>`;
    }

    private async getEdoEmployeeHtmlComponent(): Promise<string> {
        const dealUrl = await this.getDealUrl();
        return `
<div style="border:0;border-top:1px solid ${EM.border};margin:24px 0;"></div>
<p style="margin:0 0 8px;text-align:center;font-family:${EM.font};font-size:15px;line-height:1.55;color:${EM.text};"><strong>Комментарий для сотрудника ОДО:</strong></p>
<p style="margin:0 0 20px;text-align:left;font-family:${EM.font};font-size:15px;line-height:1.55;color:${EM.text};">${this.edoComment ? this.edoComment : ''}</p>
<div style="border:0;border-top:1px solid ${EM.border};margin:24px 0;"></div>
<p style="margin:0 0 8px;text-align:center;font-family:${EM.font};font-size:15px;line-height:1.55;color:${EM.text};"><strong>Исполнитель:</strong></p>
<p style="margin:0 0 16px;font-family:${EM.font};font-size:15px;line-height:1.55;color:${EM.text};">${this.userName ? this.userName : ''}</p>
<p style="margin:0;text-align:left;font-family:${EM.font};font-size:15px;line-height:1.55;color:${EM.text};">
<a href="${dealUrl}" style="color:${EM.link};text-decoration:none;font-weight:500;">Документация</a><br />
${this.dealId} ${this.companyName ? `"${this.companyName}"` : ''}
</p>`;
    }

    private async getDealUrl(): Promise<string> {
        return `${baseUrl}crm/deal/details/${this.dealId}/`;
    }
    private async getBidHtml(): Promise<string> {
        const bid = await this.bidService.getItems(this.dealId);

        return bid;
    }
}

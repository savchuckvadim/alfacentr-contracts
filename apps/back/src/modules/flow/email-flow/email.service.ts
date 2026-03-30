import { BitrixActivityTypeId } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
import { BitrixService } from '@/modules/bitrix/bitrix.service';
import { GetDealBidItemsUseCase } from '@/modules/on-deal-init/use-cases/get-deal-bid-items.use-case';
import { BitrixOwnerTypeId } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
import { BXActivityCommunication, IBXActivity } from '@/modules/bitrix/domain/activity/interfaces/bx-activity.interface';
import { EmployeeEdoService, IEmployeeEdoInfo } from '@/common/employee-edo/employee-edo.service';

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

        await this.bitrix.activity.createActivity(sendData);

    }

    async sendForEdoEmployee() {
        const sendData = await this.getDataForSend(true);

        await this.bitrix.activity.createActivity(sendData);

    }

    private async getDataForSend(
        isForEdo: boolean = false,
    ): Promise<IBXActivity> {
        const ownerType = isForEdo ? BitrixOwnerTypeId.CONTACT : BitrixOwnerTypeId.DEAL;
        const ownerId = isForEdo ? this.employeeEdoInfo.contactId : this.dealId;
        const contactId = isForEdo ? this.employeeEdoInfo.contactId : this.contactId;
        const subject = isForEdo
            ? `Документы на согласование Договор №${this.documentPrefixNumber} для сотрудника ЭДО "${this.employeeEdoInfo.name}" от ООО "Альфацентр"`
            : `Документы на согласование Договор №${this.documentPrefixNumber} от ООО "Альфацентр"`;

        const employeeEdoName = isForEdo ? this.userName || this.employeeEdoInfo.name : this.employeeEdoInfo.name;
        const settings = {
            MESSAGE_FROM: `Альфацентр ${employeeEdoName} <${this.employeeEdoInfo.email}>`,

        };
        const communication = {
            ENTITY_ID: isForEdo ? this.employeeEdoInfo.contactId : this.contactId,
            ENTITY_TYPE_ID: BitrixOwnerTypeId.CONTACT,
            // TYPE_ID: 1,

            VALUE: isForEdo ? this.employeeEdoInfo.email : this.email,
        } as BXActivityCommunication;



        try {
            // const body = await render(
            //     React.createElement(DocumentEmailTemplate, {
            //         name: this.name,
            //         phone: this.phone,
            //         bidHtml,
            //         edoEmployee,
            //     } satisfies DocumentEmailTemplateProps),
            // );
            const body = isForEdo
                ? await this.getEmailHtmlBody(isForEdo)
                : await this.getClientEmailHtmlBody();

            const sendData = {

                OWNER_TYPE_ID: ownerType,
                OWNER_ID: ownerId,
                CONTACT_ID: contactId,
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
                // END_TIME: new Date().toISOString(),
                END_TIME: new Date(Date.now() + 3600 * 1000).toISOString(),
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
        return `<html><body>
        <p class="MsoNormal" style="margin-bottom:0cm;line-height:normal">
 <i>Письмо сформировано автоматически. При ответе, просто нажмите&nbsp;<b>“ОТВЕТИТЬ”</b>&nbsp;или введите </i><a href="mailto:ppk@alfasibir.ru" title="mailto:ppk@alfasibir.ru"><b><i><span style="color: blue;">ppk@alfasibir.ru</span></i></b></a><b><i> </i></b><i>в строке «Адрес получателя/Кому».</i>
</p>
<p class="MsoNormal" style="margin-bottom:0cm;line-height:normal">
 Добрый день ${this.name ? `, <span style="color: #151515;"> ${this.name}</span>` : ''}!<br>
	 Во вложении -&nbsp;<b>Договор</b>,&nbsp;<b>Счет </b>и <b>Акт </b>на согласование.
</p>
<p class="MsoNormal" style="margin-bottom:0cm;line-height:normal">
 Пожалуйста, проверьте <b>реквизиты, </b>а также<b> текст документов</b>.
</p>
<ul style="margin-top:0cm" type="disc">
	<li class="MsoNormal" style="margin-bottom:0cm;line-height:normal;mso-list:l0 level1 lfo1"><b>Если документы соответствуют требованиям Вашего учреждения</b> - подпишите, пожалуйста, его в системе ЭДО. Если Ваше учреждение не использует систему ЭДО, то направьте нам ответным e-mail скан Договора, заверенного с Вашей стороны печатью и подписью руководителя.<br>Наш<b>&nbsp;СБИС&nbsp;ID: 2BEbe3508291e7a494ca4d051e2230821b1 </b>(Оператор&nbsp;ООО "Компания "Тензор")</li><li class="MsoNormal" style="margin-bottom:0cm;line-height:normal;mso-list:l0 level1 lfo1"><b>Если документы требуют корректировки</b> - откорректированный текст договора, вышлите, пожалуйста, ответным e-mail в текстовом формате (например Word).</li></ul><p class="MsoNormal" style="margin-bottom:0cm;line-height:normal">
 В течение 1 рабочего дня с момента направления данного письма на номер телефона ${this.phone ? `, <span style="color: #151515;"> ${this.phone}</span>` : ''} Вам позвонит робот Ирина для подтверждения получения документов. Просим Вас подтвердить получение простым ответом "ДА".
</p>
<p class="MsoNormal" style="margin-bottom:0cm;line-height:normal">
 С уважением,<br>
	 Чехуркина Наталья,<br>
	 Специалист по документообороту,<br>
	 Центр правовой поддержки ООО "АЛЬФАЦЕНТР",<br>
	 Почтовый адрес: 630073, г. Новосибирск, а/я 202<br>
	 тел. многоканальный:&nbsp;8 (383) 383-24-15 доб.106<br>
 <a href="http://e.mail.ru/compose/?mailto=mailto%3appk@alfasibir.ru"><span style="color: blue;">ppk@alfasibir.ru</span></a><br>
	 Сайт компании:&nbsp;<a href="https://alfacentr.org/"><span style="color: blue;">https://alfacentr.org</span></a><br>
	 Социальные сети:<br>
 <a href="https://vk.com/alfacentr_nsk"><span style="color: blue;">https://vk.com/alfacentr_nsk</span></a><br>
 <a href="https://ok.ru/group/68876292653111"><span style="color: blue;">https://ok.ru/group/68876292653111</span></a><br>
<img width="386" alt="logo" src="https://i.imgur.com/DucbqTv.png" height="47">
</p>
<div class="MsoNormal" align="center" style="margin-bottom:0cm;text-align:center; line-height:normal">
	<hr size="2" width="100%" align="center">
</div>

<p class="MsoNormal" align="center" style="margin-bottom:0cm;text-align:center; line-height:normal">

 <b>Исходная заявка клиента:</b></p>
 <div class="MsoNormal" align="center" style="margin-bottom: 0cm; text-align: left; line-height: normal;">${bid}<br></div>
        </body></html>`;
    }
    async getEmailHtmlBody(
        includeEdoEmployee: boolean = false,
    ): Promise<string> {
        const bid = await this.getBidHtml();

        const edoEmployeeHtml = includeEdoEmployee
            ? await this.getEdoEmployeeHtmlComponent()
            : '';

        return `<html><body>
        <p class="MsoNormal" style="margin-bottom:0cm;line-height:normal">
 <i>Письмо сформировано автоматически. При ответе, просто нажмите&nbsp;<b>“ОТВЕТИТЬ”</b>&nbsp;или введите </i><a href="mailto:ppk@alfasibir.ru" title="mailto:ppk@alfasibir.ru"><b><i><span style="color: blue;">ppk@alfasibir.ru</span></i></b></a><b><i> </i></b><i>в строке «Адрес получателя/Кому».</i>
</p>
<p class="MsoNormal" style="margin-bottom:0cm;line-height:normal">
 Добрый день ${this.name ? `, <span style="color: #151515;"> ${this.name}</span>` : ''}!<br>
	 Во вложении -&nbsp;<b>Договор</b>,&nbsp;<b>Счет </b>и <b>Акт </b>на согласование.
</p>
<p class="MsoNormal" style="margin-bottom:0cm;line-height:normal">
 Пожалуйста, проверьте <b>реквизиты, </b>а также<b> текст документов</b>.
</p>
<ul style="margin-top:0cm" type="disc">
	<li class="MsoNormal" style="margin-bottom:0cm;line-height:normal;mso-list:l0 level1 lfo1"><b>Если документы соответствуют требованиям Вашего учреждения</b> - подпишите, пожалуйста, его в системе ЭДО. Если Ваше учреждение не использует систему ЭДО, то направьте нам ответным e-mail скан Договора, заверенного с Вашей стороны печатью и подписью руководителя.<br>Наш<b>&nbsp;СБИС&nbsp;ID: 2BEbe3508291e7a494ca4d051e2230821b1 </b>(Оператор&nbsp;ООО "Компания "Тензор")</li><li class="MsoNormal" style="margin-bottom:0cm;line-height:normal;mso-list:l0 level1 lfo1"><b>Если документы требуют корректировки</b> - откорректированный текст договора, вышлите, пожалуйста, ответным e-mail в текстовом формате (например Word).</li></ul><p class="MsoNormal" style="margin-bottom:0cm;line-height:normal">
 В течение 1 рабочего дня с момента направления данного письма на номер телефона ${this.phone ? `, <span style="color: #151515;"> ${this.phone}</span>` : ''} Вам позвонит робот Ирина для подтверждения получения документов. Просим Вас подтвердить получение простым ответом "ДА".
</p>
<p class="MsoNormal" style="margin-bottom:0cm;line-height:normal">
 С уважением,<br>
	 Чехуркина Наталья,<br>
	 Специалист по документообороту,<br>
	 Центр правовой поддержки ООО "АЛЬФАЦЕНТР",<br>
	 Почтовый адрес: 630073, г. Новосибирск, а/я 202<br>
	 тел. многоканальный:&nbsp;8 (383) 383-24-15 доб.106<br>
 <a href="http://e.mail.ru/compose/?mailto=mailto%3appk@alfasibir.ru"><span style="color: blue;">ppk@alfasibir.ru</span></a><br>
	 Сайт компании:&nbsp;<a href="https://alfacentr.org/"><span style="color: blue;">https://alfacentr.org</span></a><br>
	 Социальные сети:<br>
 <a href="https://vk.com/alfacentr_nsk"><span style="color: blue;">https://vk.com/alfacentr_nsk</span></a><br>
 <a href="https://ok.ru/group/68876292653111"><span style="color: blue;">https://ok.ru/group/68876292653111</span></a><br>
<img width="386" alt="logo" src="https://i.imgur.com/DucbqTv.png" height="47">
</p>
<div class="MsoNormal" align="center" style="margin-bottom:0cm;text-align:center; line-height:normal">
	<hr size="2" width="100%" align="center">
</div>
<p class="MsoNormal" align="center" style="margin-bottom:0cm;text-align:center; line-height:normal">
 <b>Исходная заявка клиента:</b></p><p class="MsoNormal" align="center" style="margin-bottom: 0cm; text-align: left; line-height: normal;">${bid}<br></p>

 ${edoEmployeeHtml}
 </body></html>`;
    }

    private async getEdoEmployeeHtmlComponent(): Promise<string> {
        const dealUrl = await this.getDealUrl();
        return `
         <div class="MsoNormal" align="center" style="margin-bottom:0cm;text-align:center; line-height:normal">
	     <hr size="2" width="100%" align="center">
        </div>

        <p class="MsoNormal" align="center" style="margin-bottom:0cm;text-align:center; line-height:normal">
            <b>Комментарий для сотрудника ОДО:</b>
        </p>
        <p class="MsoNormal" align="center" style="margin-bottom: 0cm; text-align: left; line-height: normal;">
            ${this.edoComment ? this.edoComment : ''}
        </p>
        <div class="MsoNormal" align="center" style="margin-bottom:0cm;text-align:center; line-height:normal">
	     <hr size="2" width="100%" align="center">
        </div>
        <p class="MsoNormal" align="center" style="margin-bottom:0cm;text-align:center; line-height:normal">
        <b>Исполнитель:</b>
        </p>
        <p class="MsoNormal" style="margin-bottom:0cm;line-height:normal">
        ${this.userName ? this.userName : ''}
        </p>
        <p align="center" style="margin-bottom: 0cm; text-align: left; line-height: normal;">
        <a href="${dealUrl}">Документация</a><br>
          ${this.dealId} ${this.companyName ? `"${this.companyName}"` : ''}
        </p>
        `;
    }

    private async getDealUrl(): Promise<string> {
        return `${baseUrl}crm/deal/details/${this.dealId}/`;
    }
    private async getBidHtml(): Promise<string> {
        const bid = await this.bidService.getItems(this.dealId);

        return bid;
    }
}

import { BitrixActivityTypeId } from "@/modules/bitrix/domain/enums/bitrix-constants.enum";
import { BitrixService } from "@/modules/bitrix/bitrix.service";
import { GetDealBidItemsType, GetDealBidItemsUseCase } from "@/modules/on-deal-init/use-cases/get-deal-bid-items.use-case";
import { BitrixOwnerTypeId } from "@/modules/bitrix/domain/enums/bitrix-constants.enum";

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


export class EmailServiceInitDto {
    filesForSend: [string, string][] = [];
    email: string;
    name: string;
    subject: string;
    body: string;
    bid: string;
}
export class EmailService {
    private bidService: GetDealBidItemsUseCase;
    constructor(
        private readonly bitrix: BitrixService,
        private readonly filesForSend: [string, string][] = [],
        private readonly email: string,
        private readonly name: string,
        private readonly subject: string,
        private readonly body: string,
        private readonly dealId: number,
    ) {
        this.bidService = new GetDealBidItemsUseCase(
            this.bitrix
        );
    }

    async send() {

        const entityId = this.dealId;
        const body = await this.getEmailHtmlBody();
        const activityResponse = await this.bitrix.activity.createActivity({
            OWNER_TYPE_ID: BitrixOwnerTypeId.DEAL,
            OWNER_ID: entityId,
            TYPE_ID: BitrixActivityTypeId.EMAIL,
            DIRECTION: 2, // 1 - incoming, 2 - outgoing
            RESPONSIBLE_ID: '502',

            SETTINGS: {
                MESSAGE_FROM: `Иванов Иван <laravelsamvel@gmail.com>`,
            },
            SUBJECT: `Документы на согласование Договор №${this.subject} от ООО "Альфацентр"`,
            DESCRIPTION: body,
            COMPLETED: 'Y',
            DESCRIPTION_TYPE: 3,
            START_TIME: new Date().toISOString(),
            END_TIME: new Date(Date.now() + 3600 * 1000).toISOString(),
            COMMUNICATIONS: [
                {
                    ENTITY_ID: entityId,
                    ENTITY_TYPE_ID: BitrixOwnerTypeId.DEAL,
                    // TYPE_ID: 1,
                    VALUE: this.email,
                },
            ],
            FILES: this.filesForSend.map(file => ({
                fileData: file
            })),
        });

    }

    async getEmailHtmlBody(): Promise<string> {

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
 В течение 1 рабочего дня с момента направления данного письма на номер телефона {{Телефон контактного лица по документам}} Вам позвонит робот Ирина для подтверждения получения документов. Просим Вас подтвердить получение простым ответом "ДА".
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
        </body></html>`;
    }


    private async getBidHtml(): Promise<string> {

        const bid = await this.bidService.getItems(this.dealId, GetDealBidItemsType.HTML);
        return bid;
        // return `
        // Наименование учреждения: АДМИНИСТРАЦИЯ ВОРОГОВСКОГО СЕЛЬСОВЕТА
        // Полное наименование АДМИНИСТРАЦИЯ ВОРОГОВСКОГО СЕЛЬСОВЕТА ТУРУХАНСКОГО РАЙОНА КРАСНОЯРСКОГО
        // ИНН: 2437002387
        // Должность руководителя: ГАВРЮШЕНКО ВИКТОР ВЛАДИСЛАВОВИЧ, ГЛАВА ВОРОГОВСКОГО СЕЛЬСОВЕТА
        // ФИО руководителя: ГАВРЮШЕНКО ВИКТОР ВЛАДИСЛАВОВИЧ, ГЛАВА ВОРОГОВСКОГО СЕЛЬСОВЕТА
        // Руководитель действует на основании: Устава

        // Участники семинаров (ФИО, мобильный и стационарный телефон, e-mail для направления методических материалов)
        // Мальцева Ирина Владимировна 89293209625 finansist_vorogovo@mail.ru 89509887928

        // Контактное лицо для обмена документами (ФИО, E-mail, телефон)
        // Мальцева Ирина Владимировна 89293209625 finansist_vorogovo@mail.ru 89509887928

        // Формат участия в семинарах Очно
        // Пользуетесь ли Вы Электронным ДокументоОборотом(ЭДО)? Да, СБИС (копия)
        // Нажимая кнопку "Отправить", я безоговорочно принимаю политику конфиденциальности*
        // и даю свое согласие на обработку персональных данных и получение почтовой рассылки от ООО «Альфацентр».

        // `
    }
}

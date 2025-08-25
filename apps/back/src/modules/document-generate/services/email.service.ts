import { BitrixService } from "@/modules/bitrix/bitrix.service";


export class EmailServiceInitDto {
    filesForSend: [string, string][] = [];
    email: string;
    subject: string;
    body: string;
}
export class EmailService {
    constructor(
        private readonly bitrixService: BitrixService,
        private readonly filesForSend: [string, string][] = [],
        private readonly email: string,
        private readonly subject: string,
        private readonly body: string
    ) {
    }

    async sendEmail(email: string, subject: string, body: string) {
        const emailData = {
            to: email,
        }
    }

    private getBidHtml() {
        return `
        Наименование учреждения: АДМИНИСТРАЦИЯ ВОРОГОВСКОГО СЕЛЬСОВЕТА
        Полное наименование АДМИНИСТРАЦИЯ ВОРОГОВСКОГО СЕЛЬСОВЕТА ТУРУХАНСКОГО РАЙОНА КРАСНОЯРСКОГО
        ИНН: 2437002387
        Должность руководителя: ГАВРЮШЕНКО ВИКТОР ВЛАДИСЛАВОВИЧ, ГЛАВА ВОРОГОВСКОГО СЕЛЬСОВЕТА
        ФИО руководителя: ГАВРЮШЕНКО ВИКТОР ВЛАДИСЛАВОВИЧ, ГЛАВА ВОРОГОВСКОГО СЕЛЬСОВЕТА
        Руководитель действует на основании: Устава

        Участники семинаров (ФИО, мобильный и стационарный телефон, e-mail для направления методических материалов)
        Мальцева Ирина Владимировна 89293209625 finansist_vorogovo@mail.ru 89509887928

        Контактное лицо для обмена документами (ФИО, E-mail, телефон)
        Мальцева Ирина Владимировна 89293209625 finansist_vorogovo@mail.ru 89509887928

        Формат участия в семинарах Очно
        Пользуетесь ли Вы Электронным ДокументоОборотом(ЭДО)? Да, СБИС (копия)
        Нажимая кнопку "Отправить", я безоговорочно принимаю политику конфиденциальности*
        и даю свое согласие на обработку персональных данных и получение почтовой рассылки от ООО «Альфацентр».

        `
    }
}

import React, { FC } from 'react';

import {
    Body,
    Container,
    Font,
    Head,
    Hr,
    Html,
    Img,
    Link,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';

const p = 'mb-0 leading-normal text-base';

export interface EdoEmployeeProps {
    dealUrl: string;
    edoComment: string;
    userName: string;
    dealId: number;
    companyName: string;
}

export const EdoEmployee: FC<EdoEmployeeProps> = ({
    dealUrl,
    edoComment,
    userName,
    dealId,
    companyName,
}) => {
    return (
        <Section className="text-left">
            <Section className="mb-0 text-center leading-normal">
                <Hr className="mx-auto my-0 w-full border-0 border-t-2 border-solid border-black" />
            </Section>

            <Text className={`${p} text-center`}>
                <b>Комментарий для сотрудника ОДО:</b>
            </Text>

            <Text className={`${p} text-left`}>{edoComment || ''}</Text>

            <Section className="mb-0 text-center leading-normal">
                <Hr className="mx-auto my-0 w-full border-0 border-t-2 border-solid border-black" />
            </Section>

            <Text className={`${p} text-center`}>
                <b>Исполнитель:</b>
            </Text>

            <Text className={p}>{userName || ''}</Text>

            <Text className={`${p} text-left`}>
                <Link href={dealUrl} className="text-blue-600">
                    Документация
                </Link>
                <br />
                {dealId}{' '}
                {companyName ? `"${companyName}"` : ''}
            </Text>
        </Section>
    );
};

export interface DocumentEmailTemplateProps {
    name: string;
    phone: string;
    bidHtml?: string;
    edoEmployee?: EdoEmployeeProps;
}

export const DocumentEmailTemplate: FC<DocumentEmailTemplateProps> = ({
    name,
    phone,
    edoEmployee,
    bidHtml,
}) => {
    const hasName = Boolean(name);
    const hasPhone = Boolean(phone);

    return (
        <Tailwind>
            <Html>
                <Head>
                    <Font
                        fontFamily="Geist"
                        fallbackFontFamily="Arial"
                        webFont={{
                            url: 'https://fonts.googleapis.com/css2?family=Geist:wght@300;500;700&display=swap',
                            format: 'woff2',
                        }}
                    />
                </Head>

                <Body className="bg-[#f8f9fa]">
                    <Container className="mx-auto max-w-[640px] px-4 py-6">
                        <Section>
                            <Text className={p}>
                                <i>
                                    Письмо сформировано автоматически. При
                                    ответе, просто нажмите&nbsp;
                                    <b>“ОТВЕТИТЬ”</b>
                                    &nbsp;или введите{' '}
                                </i>
                                <Link
                                    href="mailto:ppk@alfasibir.ru"
                                    title="mailto:ppk@alfasibir.ru"
                                    className="text-blue-600"
                                >
                                    <b>
                                        <i>ppk@alfasibir.ru</i>
                                    </b>
                                </Link>
                                <b>
                                    <i> </i>
                                </b>
                                <i>в строке «Адрес получателя/Кому».</i>
                            </Text>

                            <Text className={p}>
                                {' '}
                                Добрый день{' '}
                                {hasName ? (
                                    <>
                                        ,{' '}
                                        <span className="text-[#151515]">
                                            {' '}
                                            {name}
                                        </span>
                                    </>
                                ) : null}
                                !<br />
                                {'\t'} Во вложении -&nbsp;<b>Договор</b>,&nbsp;
                                <b>Счет </b>и <b>Акт </b>на согласование.
                            </Text>

                            <Text className={p}>
                                Пожалуйста, проверьте <b>реквизиты, </b>а также
                                <b> текст документов</b>.
                            </Text>

                            <ul className="mt-0 list-disc pl-6 text-base leading-normal">
                                <li className="mb-0">
                                    <b>
                                        Если документы соответствуют требованиям
                                        Вашего учреждения
                                    </b>{' '}
                                    - подпишите, пожалуйста, его в системе ЭДО.
                                    Если Ваше учреждение не использует систему
                                    ЭДО, то направьте нам ответным e-mail скан
                                    Договора, заверенного с Вашей стороны
                                    печатью и подписью руководителя.
                                    <br />
                                    Наш
                                    <b>
                                        &nbsp;СБИС&nbsp;ID:
                                        2BEbe3508291e7a494ca4d051e2230821b1{' '}
                                    </b>
                                    (Оператор&nbsp;ООО &quot;Компания
                                    &quot;Тензор&quot;)
                                </li>
                                <li className="mb-0">
                                    <b>Если документы требуют корректировки</b> -
                                    откорректированный текст договора, вышлите,
                                    пожалуйста, ответным e-mail в текстовом
                                    формате (например Word).
                                </li>
                            </ul>

                            <Text className={p}>
                                В течение 1 рабочего дня с момента направления
                                данного письма на номер телефона{' '}
                                {hasPhone ? (
                                    <>
                                        ,{' '}
                                        <span className="text-[#151515]">
                                            {' '}
                                            {phone}
                                        </span>
                                    </>
                                ) : null}{' '}
                                Вам позвонит робот Ирина для подтверждения
                                получения документов. Просим Вас подтвердить
                                получение простым ответом &quot;ДА&quot;.
                            </Text>

                            <Text className={p}>
                                С уважением,
                                <br />
                                &nbsp;Чехуркина Наталья,
                                <br />
                                &nbsp;Специалист по документообороту,
                                <br />
                                &nbsp;Центр правовой поддержки ООО
                                &quot;АЛЬФАЦЕНТР&quot;,
                                <br />
                                &nbsp;Почтовый адрес: 630073, г. Новосибирск,
                                а/я 202
                                <br />
                                &nbsp;тел. многоканальный:&nbsp;8 (383)
                                383-24-15 доб.106
                                <br />
                                <Link
                                    href="http://e.mail.ru/compose/?mailto=mailto%3appk@alfasibir.ru"
                                    className="text-blue-600"
                                >
                                    ppk@alfasibir.ru
                                </Link>
                                <br />
                                Сайт компании:&nbsp;
                                <Link
                                    href="https://alfacentr.org/"
                                    className="text-blue-600"
                                >
                                    https://alfacentr.org
                                </Link>
                                <br />
                                Социальные сети:
                                <br />
                                <Link
                                    href="https://vk.com/alfacentr_nsk"
                                    className="text-blue-600"
                                >
                                    https://alfacentr_nsk
                                </Link>
                                <br />
                                <Link
                                    href="https://ok.ru/group/68876292653111"
                                    className="text-blue-600"
                                >
                                    https://ok.ru/group/68876292653111
                                </Link>
                                <br />
                                <Img
                                    width={386}
                                    height={47}
                                    alt="logo"
                                    src="https://i.imgur.com/DucbqTv.png"
                                    className="block"
                                />
                            </Text>

                            <Section className="mb-0 text-center leading-normal">
                                <Hr className="mx-auto my-0 w-full border-0 border-t-2 border-solid border-black" />
                            </Section>

                            <Text className={`${p} text-center`}>
                                <b>Исходная заявка клиента:</b>
                            </Text>

                            {/* <Text className={`${p} text-left`}>
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: bidHtml ?? '',
                                    }}
                                />
                                <br />
                            </Text> */}

                            {edoEmployee ? (
                                <EdoEmployee {...edoEmployee} />
                            ) : null}
                        </Section>
                    </Container>
                </Body>
            </Html>
        </Tailwind>
    );
};

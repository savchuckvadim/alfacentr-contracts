import { Injectable, Logger } from '@nestjs/common';
import {
    BotChannelRegistry,
    BotOperatorStore,
    BotRequestStore,
    IBotRequest,
} from '../../bot-core';
import { BitrixBotApiService } from '../../bitrix-bot';
import { TelegramApiService } from '../services/telegram-api.service';
import { TelegramChannelService } from '../services/telegram-channel.service';
import {
    ITelegramCallbackQuery,
    ITelegramMessage,
    ITelegramUpdate,
    TG_ACTION,
} from '../types/telegram-update.type';

@Injectable()
export class HandleTelegramUpdateUseCase {
    private readonly logger = new Logger(HandleTelegramUpdateUseCase.name);

    constructor(
        private readonly api: TelegramApiService,
        private readonly channel: TelegramChannelService,
        private readonly requests: BotRequestStore,
        private readonly operators: BotOperatorStore,
        private readonly channels: BotChannelRegistry,
        private readonly bitrix: BitrixBotApiService,
    ) {}

    async handle(update: ITelegramUpdate): Promise<void> {
        if (update.callback_query) {
            await this.handleCallback(update.callback_query);
            return;
        }
        if (update.message) {
            await this.handleMessage(update.message);
        }
    }

    /* ----------------------------- нажатия ------------------------------ */

    private async handleCallback(query: ITelegramCallbackQuery): Promise<void> {
        const chatId = query.message?.chat?.id;
        const callbackId = query.id;
        const [action, ...rest] = String(query.data || '').split(':');
        if (!chatId || !callbackId || !action) return;

        // Ответить на нажатие надо всегда и первым делом, иначе кнопка
        // останется «в загрузке» и оператор нажмёт её снова
        const finish = (text?: string) => this.api.answerCallback(callbackId, text);

        if (action === TG_ACTION.delegateTo) {
            const [operatorId, requestId] = rest;
            await this.delegate(chatId, Number(operatorId), requestId, finish);
            return;
        }

        const requestId = rest.join(':');
        const request = requestId ? await this.requests.get(requestId) : null;
        if (!request) {
            await finish('Заявка не найдена или устарела');
            return;
        }

        if (action === TG_ACTION.reply) {
            await this.channel.setAwaiting(chatId, request.id);
            await finish();
            await this.api.askForText(
                chatId,
                `Пришлите текст ответа для <b>${request.authorName}</b> следующим сообщением.`,
            );
            return;
        }

        if (action === TG_ACTION.delegate) {
            await finish();
            await this.showOperators(chatId, request);
            return;
        }

        if (action === TG_ACTION.ignore || action === TG_ACTION.done) {
            const status = action === TG_ACTION.ignore ? 'ignored' : 'answered';
            const advanced = await this.requests.advance(request.id, status);
            if (!advanced) {
                await finish('Заявка уже закрыта');
                return;
            }
            if (request.taskId) {
                const note =
                    action === TG_ACTION.ignore
                        ? 'Оператор решил, что ответ не требуется.'
                        : 'Оператор отметил обращение обработанным.';
                await this.bitrix.addTaskComment(request.taskId, note);
                await this.bitrix.updateTask(request.taskId, { STATUS: 5 });
            }
            await this.channel.closeCards(request.id);
            await finish(action === TG_ACTION.ignore ? 'Проигнорировано' : 'Готово');
            return;
        }

        if (action === TG_ACTION.cancel) {
            await finish('Отменено');
            return;
        }

        await finish();
    }

    /* -------------------------- текст и команды ------------------------- */

    private async handleMessage(message: ITelegramMessage): Promise<void> {
        const chatId = message.chat?.id;
        const text = String(message.text || '').trim();
        if (!chatId || !text) return;

        if (text.startsWith('/')) {
            await this.handleCommand(chatId, text, message);
            return;
        }

        // Не команда — возможно, это ответ на заявку, которого мы ждём
        const requestId = await this.channel.takeAwaiting(chatId);
        if (!requestId) {
            await this.api.sendMessage(
                chatId,
                'Не понял. Нажмите «Ответить» под карточкой заявки или посмотрите /help.',
            );
            return;
        }

        await this.sendAnswer(chatId, requestId, text);
    }

    private async handleCommand(
        chatId: number,
        text: string,
        message: ITelegramMessage,
    ): Promise<void> {
        const [rawCommand, ...args] = text.split(/\s+/);
        const command = rawCommand.replace(/@.*$/, '').toLowerCase();

        if (command === '/start') {
            await this.registerSelf(chatId, message);
            return;
        }
        if (command === '/help') {
            await this.api.sendMessage(
                chatId,
                [
                    '<b>Что я умею</b>',
                    '',
                    'Обращения из чата Битрикса приходят сюда карточками с кнопками.',
                    '«Ответить» — ответ уйдёт в чат от моего имени и комментарием в задачу.',
                    '«Делегировать» — передать заявку другому оператору.',
                    '«Готово» и «Игнор» — закрыть заявку.',
                    '',
                    '/start — привязать этот чат к себе',
                    '/operators — список операторов',
                    '/add ID_в_Битриксе Имя — добавить оператора',
                    '/remove ID_в_Битриксе — выключить оператора',
                ].join('\n'),
            );
            return;
        }
        if (command === '/operators') {
            const list = await this.operators.list(false);
            await this.api.sendMessage(
                chatId,
                list.length
                    ? ['<b>Операторы</b>', ...list.map(o =>
                          `${o.isActive ? '•' : '×'} ${o.name} — Битрикс ${o.bitrixUserId}, чат ${o.telegramChatId}`,
                      )].join('\n')
                    : 'Операторов пока нет. Пришлите /start, чтобы привязать себя.',
            );
            return;
        }
        if (command === '/add' || command === '/remove') {
            await this.manageOperator(chatId, command, args);
            return;
        }

        await this.api.sendMessage(chatId, 'Не знаю такой команды. Посмотрите /help.');
    }

    /* ----------------------------- действия ----------------------------- */

    private async sendAnswer(
        chatId: number,
        requestId: string,
        text: string,
    ): Promise<void> {
        const request = await this.requests.get(requestId);
        if (!request) {
            await this.api.sendMessage(chatId, 'Заявка не найдена или устарела.');
            return;
        }

        const advanced = await this.requests.advance(request.id, 'answered');
        if (!advanced) {
            await this.api.sendMessage(chatId, 'По этой заявке ответ уже отправлен.');
            return;
        }

        const sent = await this.channels.reply(request, text);
        if (!sent) {
            await this.api.sendMessage(
                chatId,
                'Не удалось отправить ответ в чат Битрикса. Заявка осталась открытой.',
            );
            await this.requests.patch(request.id, { status: 'acknowledged' });
            return;
        }

        if (request.taskId) {
            const operator = await this.operators.getByTelegramChat(chatId);
            const who = operator?.name ?? `чат ${chatId}`;
            await this.bitrix.addTaskComment(
                request.taskId,
                `Ответ отправлен в чат (${who}):\n\n${text}`,
            );
            await this.bitrix.updateTask(request.taskId, { STATUS: 5 });
        }

        await this.channel.closeCards(request.id);
        await this.api.sendMessage(chatId, 'Ответ отправлен в чат и записан в задачу.');
    }

    private async showOperators(chatId: number, request: IBotRequest): Promise<void> {
        const list = (await this.operators.list()).filter(
            o => o.telegramChatId !== chatId,
        );
        if (!list.length) {
            await this.api.sendMessage(
                chatId,
                'Некому делегировать: других активных операторов нет. Добавьте через /add.',
            );
            return;
        }

        const keyboard = list.map(o => [
            {
                text: o.name,
                callback_data: `${TG_ACTION.delegateTo}:${o.bitrixUserId}:${request.id}`,
            },
        ]);
        keyboard.push([
            { text: 'Отмена', callback_data: `${TG_ACTION.cancel}:${request.id}` },
        ]);

        await this.api.sendMessage(chatId, 'Кому делегировать?', keyboard);
    }

    private async delegate(
        chatId: number,
        operatorId: number,
        requestId: string,
        finish: (text?: string) => Promise<void>,
    ): Promise<void> {
        const request = requestId ? await this.requests.get(requestId) : null;
        const operator = Number.isFinite(operatorId)
            ? await this.operators.getByBitrixUser(operatorId)
            : null;

        if (!request || !operator) {
            await finish('Заявка или оператор не найдены');
            return;
        }

        await this.requests.patch(request.id, {
            status: 'assigned',
            assignedOperatorId: operator.bitrixUserId,
        });

        // В чат при делегировании не пишем: для клиента ничего не изменилось
        if (request.taskId) {
            await this.bitrix.updateTask(request.taskId, {
                RESPONSIBLE_ID: operator.bitrixUserId,
            });
            await this.bitrix.addTaskComment(
                request.taskId,
                `Заявка делегирована: ${operator.name}.`,
            );
        }

        const updated = await this.requests.get(request.id);
        if (updated) {
            await this.api.sendMessage(
                operator.telegramChatId,
                `<b>Вам делегировали заявку</b>\n\n${this.channel.renderCard(updated)}`,
                [
                    [
                        { text: 'Ответить', callback_data: `${TG_ACTION.reply}:${updated.id}` },
                        { text: 'Готово', callback_data: `${TG_ACTION.done}:${updated.id}` },
                    ],
                ],
            );
        }

        await finish(`Делегировано: ${operator.name}`);
        await this.api.sendMessage(chatId, `Заявка передана: ${operator.name}.`);
    }

    /** /start привязывает чат Телеграма к пользователю Битрикса */
    private async registerSelf(
        chatId: number,
        message: ITelegramMessage,
    ): Promise<void> {
        const existing = await this.operators.getByTelegramChat(chatId);
        if (existing) {
            await this.operators.upsert({ ...existing, isActive: true });
            await this.api.sendMessage(
                chatId,
                `Вы уже оператор: ${existing.name}, Битрикс ${existing.bitrixUserId}.`,
            );
            return;
        }

        const name = [message.from?.first_name, message.from?.last_name]
            .filter(Boolean)
            .join(' ')
            .trim();

        await this.api.sendMessage(
            chatId,
            [
                `Здравствуйте${name ? ', ' + name : ''}.`,
                '',
                `Ваш идентификатор чата: <b>${chatId}</b>.`,
                'Чтобы получать заявки, вас должен добавить администратор командой:',
                `<code>/add ВАШ_ID_В_БИТРИКСЕ ${name || 'Имя'}</code>`,
                '',
                'Администратор — тот, чей чат указан в настройках бота.',
            ].join('\n'),
        );
    }

    /**
     * Управление операторами доступно только администратору: иначе любой,
     * кто нашёл бота, добавит себя и начнёт отвечать клиентам.
     */
    private async manageOperator(
        chatId: number,
        command: string,
        args: string[],
    ): Promise<void> {
        if (this.api.adminChatId !== chatId) {
            await this.api.sendMessage(
                chatId,
                'Управлять операторами может только администратор.',
            );
            return;
        }

        const bitrixUserId = Number(args[0]);
        if (!Number.isFinite(bitrixUserId) || bitrixUserId <= 0) {
            await this.api.sendMessage(
                chatId,
                'Нужен идентификатор пользователя Битрикса: /add 856 Дарья',
            );
            return;
        }

        if (command === '/remove') {
            const done = await this.operators.deactivate(bitrixUserId);
            await this.api.sendMessage(
                chatId,
                done ? `Оператор ${bitrixUserId} выключен.` : 'Такого оператора нет.',
            );
            return;
        }

        const name = args.slice(1).join(' ').trim();
        const telegramChatId = Number(args[1]);
        // /add ID Имя — привязка к чату того, кто уже присылал /start:
        // без известного чата карточку отправить некуда
        const existing = await this.operators.getByBitrixUser(bitrixUserId);
        const resolvedChat =
            Number.isFinite(telegramChatId) && Math.abs(telegramChatId) > 10000
                ? telegramChatId
                : existing?.telegramChatId;

        if (!resolvedChat) {
            await this.api.sendMessage(
                chatId,
                [
                    'Не знаю чат этого сотрудника.',
                    'Пусть он пришлёт боту /start и сообщит вам свой идентификатор чата,',
                    'затем добавьте так: <code>/add 856 123456789</code>',
                ].join('\n'),
            );
            return;
        }

        const operator = await this.operators.upsert({
            bitrixUserId,
            telegramChatId: resolvedChat,
            name: name && !Number.isFinite(Number(name)) ? name : `Сотрудник ${bitrixUserId}`,
            canAnswer: true,
            canDelegate: true,
            isActive: true,
        });

        await this.api.sendMessage(
            chatId,
            `Оператор добавлен: ${operator.name}, Битрикс ${operator.bitrixUserId}, чат ${operator.telegramChatId}.`,
        );
        await this.api.sendMessage(
            operator.telegramChatId,
            'Вас добавили оператором заявок по семинарам. Карточки будут приходить сюда.',
        );
    }
}

import {
    EGRESS_TOKEN_HEADER,
    TELEGRAM_API_HOST,
    isProxiedHost,
    parseEgressHosts,
    parseEgressProxyConfig,
    routeEgress,
} from './egress-route.util';

/**
 * Маршрут до Telegram — то, из-за чего уведомления молча пропали после
 * сноса реле april-dev (29.10.2026). Тесты закрепляют оба конца: с
 * настроенным прокси адрес переписывается, без него остаётся прямым.
 */
describe('parseEgressProxyConfig', () => {
    const env = (values: Record<string, string>) => (key: string) =>
        values[key];

    it('без адреса прокси выключен', () => {
        expect(
            parseEgressProxyConfig(
                env({ EGRESS_PROXY_HOSTS: TELEGRAM_API_HOST }),
            ),
        ).toBeNull();
    });

    it('без списка хостов прокси выключен', () => {
        expect(
            parseEgressProxyConfig(
                env({ EGRESS_PROXY_URL: 'https://proxy.example.com/p' }),
            ),
        ).toBeNull();
    });

    it('хвостовой слэш в адресе срезается', () => {
        const config = parseEgressProxyConfig(
            env({
                EGRESS_PROXY_URL: 'https://proxy.example.com/p///',
                EGRESS_PROXY_HOSTS: TELEGRAM_API_HOST,
            }),
        );
        expect(config?.baseUrl).toBe('https://proxy.example.com/p');
    });

    it('пустой токен становится null, а не пустой строкой', () => {
        const config = parseEgressProxyConfig(
            env({
                EGRESS_PROXY_URL: 'https://proxy.example.com/p',
                EGRESS_PROXY_HOSTS: TELEGRAM_API_HOST,
                EGRESS_PROXY_TOKEN: '   ',
            }),
        );
        expect(config?.token).toBeNull();
    });
});

describe('parseEgressHosts', () => {
    it('режет по запятой, чистит регистр, пустые и дубли', () => {
        expect(
            parseEgressHosts(' API.Telegram.org , , api.telegram.org '),
        ).toEqual(['api.telegram.org']);
    });

    it('пустое значение даёт пустой список', () => {
        expect(parseEgressHosts(undefined)).toEqual([]);
    });
});

describe('isProxiedHost', () => {
    it('точное совпадение', () => {
        expect(isProxiedHost('api.telegram.org', ['api.telegram.org'])).toBe(
            true,
        );
    });

    it('правило с точкой берёт домен и поддомены', () => {
        expect(isProxiedHost('api.telegram.org', ['.telegram.org'])).toBe(true);
        expect(isProxiedHost('telegram.org', ['.telegram.org'])).toBe(true);
    });

    it('чужой хост не подходит', () => {
        expect(isProxiedHost('alfacentr.bitrix24.ru', ['.telegram.org'])).toBe(
            false,
        );
    });
});

describe('routeEgress', () => {
    const config = {
        baseUrl: 'https://proxy.example.com/p',
        token: 'secret',
        hosts: ['api.telegram.org'],
    };

    it('адрес Bot API переписывается на прокси с токеном', () => {
        const route = routeEgress(
            'https://api.telegram.org/bot123:ABC/sendMessage',
            config,
        );
        expect(route.viaProxy).toBe(true);
        expect(route.url).toBe(
            'https://proxy.example.com/p/api.telegram.org/bot123:ABC/sendMessage',
        );
        expect(route.headers[EGRESS_TOKEN_HEADER]).toBe('secret');
    });

    it('query-строка сохраняется', () => {
        const route = routeEgress(
            'https://api.telegram.org/bot123/sendMessage?chat_id=1',
            config,
        );
        expect(route.url).toBe(
            'https://proxy.example.com/p/api.telegram.org/bot123/sendMessage?chat_id=1',
        );
    });

    it('без конфига маршрут прямой', () => {
        const route = routeEgress(
            'https://api.telegram.org/bot123/sendMessage',
            null,
        );
        expect(route.viaProxy).toBe(false);
        expect(route.url).toBe('https://api.telegram.org/bot123/sendMessage');
        expect(route.headers).toEqual({});
    });

    it('битрикс идёт напрямую, даже когда прокси включён', () => {
        const route = routeEgress(
            'https://alfacentr.bitrix24.ru/rest/1/x/crm.deal.get',
            config,
        );
        expect(route.viaProxy).toBe(false);
    });

    it('не-https и нестандартный порт идут напрямую', () => {
        expect(
            routeEgress('http://api.telegram.org/bot1/sendMessage', config)
                .viaProxy,
        ).toBe(false);
        expect(
            routeEgress('https://api.telegram.org:8443/bot1/send', config)
                .viaProxy,
        ).toBe(false);
    });

    it('некорректный адрес не ломает маршрутизацию', () => {
        const route = routeEgress('не адрес', config);
        expect(route.viaProxy).toBe(false);
        expect(route.url).toBe('не адрес');
    });

    it('прокси без токена не добавляет заголовок', () => {
        const route = routeEgress('https://api.telegram.org/bot1/sendMessage', {
            ...config,
            token: null,
        });
        expect(route.viaProxy).toBe(true);
        expect(route.headers).toEqual({});
    });
});

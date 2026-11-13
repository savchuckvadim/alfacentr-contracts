/**
 * Маршрутизация исходящих запросов через зарубежный прокси.
 *
 * С российских серверов api.telegram.org не отвечает. Раньше приложение
 * обходило это через реле на back.april-dev.ru, но реле убрали 29.10.2026 —
 * и уведомления молча перестали доходить (сбой заметили 13.11.2026 по
 * отчётам крона подхвата заявок, которых никто не получал).
 *
 * Схема повторяет @lib/egress-proxy из april-next: https-адрес к хосту из
 * списка переписывается на `<прокси>/<host><path><query>` и получает
 * заголовок с токеном. Остальные хосты (Битрикс, Яндекс) идут напрямую.
 */

/** Имена env-переменных прокси — единственное место, где они перечислены */
export const EGRESS_PROXY_ENV = {
    /** Адрес прокси с префиксом пути, например `https://eu-proxy.example.com/p` */
    url: 'EGRESS_PROXY_URL',
    /** Токен, который прокси требует в заголовке EGRESS_TOKEN_HEADER */
    token: 'EGRESS_PROXY_TOKEN',
    /** Хосты через запятую; `.example.com` — вместе со всеми поддоменами */
    hosts: 'EGRESS_PROXY_HOSTS',
} as const;

/** Заголовок с токеном: прокси его проверяет и наружу не пропускает */
export const EGRESS_TOKEN_HEADER = 'X-Egress-Token';

export const TELEGRAM_API_HOST = 'api.telegram.org';

export interface EgressProxyConfig {
    /** Адрес прокси без хвостового слэша */
    baseUrl: string;
    /** Токен; null — прокси без проверки (только локальные стенды) */
    token: string | null;
    /** Правила хостов в нижнем регистре */
    hosts: readonly string[];
}

/** Куда реально пойдёт запрос и какие заголовки добавить */
export interface EgressRoute {
    url: string;
    headers: Readonly<Record<string, string>>;
    viaProxy: boolean;
}

/** Маршрут «как есть» — когда прокси выключен или хост не под правилом */
export const directRoute = (url: string): EgressRoute => ({
    url,
    headers: {},
    viaProxy: false,
});

/** Конфиг из env; нет адреса или списка хостов — прокси выключен (null) */
export const parseEgressProxyConfig = (
    get: (key: string) => string | undefined,
): EgressProxyConfig | null => {
    const baseUrl = (get(EGRESS_PROXY_ENV.url) ?? '')
        .trim()
        .replace(/\/+$/, '');
    const hosts = parseEgressHosts(get(EGRESS_PROXY_ENV.hosts));
    if (!baseUrl || hosts.length === 0) return null;
    const token = (get(EGRESS_PROXY_ENV.token) ?? '').trim();
    return { baseUrl, token: token || null, hosts };
};

/** Хосты через запятую → нижний регистр, без пустых и дублей */
export const parseEgressHosts = (raw: string | undefined): string[] => {
    const seen = new Set<string>();
    for (const part of (raw ?? '').split(',')) {
        const host = part.trim().toLowerCase();
        if (host) seen.add(host);
    }
    return [...seen];
};

/** Хост под правилом: точное совпадение, либо `.example.com` — домен и поддомены */
export const isProxiedHost = (
    host: string,
    hosts: readonly string[],
): boolean => {
    const target = host.toLowerCase();
    return hosts.some((rule) =>
        rule.startsWith('.')
            ? target.endsWith(rule) || target === rule.slice(1)
            : target === rule,
    );
};

/**
 * Адрес с нестандартным портом или не-https уходит напрямую: прокси ходит
 * к upstream только по https:443. Некорректный адрес не трогаем — ошибку
 * даст сам http-клиент
 */
export const routeEgress = (
    url: string,
    config: EgressProxyConfig | null,
): EgressRoute => {
    const direct = directRoute(url);
    if (!config) return direct;

    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return direct;
    }

    if (
        parsed.protocol !== 'https:' ||
        parsed.port !== '' ||
        !isProxiedHost(parsed.hostname, config.hosts)
    ) {
        return direct;
    }

    return {
        url: `${config.baseUrl}/${parsed.hostname}${parsed.pathname}${parsed.search}`,
        headers: config.token ? { [EGRESS_TOKEN_HEADER]: config.token } : {},
        viaProxy: true,
    };
};

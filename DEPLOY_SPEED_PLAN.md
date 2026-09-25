# План: ускорение деплоя Alfacentr

Ветка: `refactor/fast-deploy`. Цель: любой деплой укладывается в 10 минут
и не падает на таймауте buildkit.

## Куда уходит время сейчас

Замер по логу упавшего деплоя 2026-09-25 (коммит `d90d0a2`), сборка фронта:

| Шаг | Время |
|---|---|
| `pnpm install --prod --no-frozen-lockfile` в финальной стадии фронта | 13 мин 17 с |
| Экспорт образа фронта (`exporting layers`) | 5 мин 4 с |
| Итог: таймаут сессии buildkit | деплой упал |

Оба шага находятся в финальной стадии `docker/Dockerfile.front`. Там заново
ставятся все прод-зависимости: без `--filter`, без замороженного lock-файла,
с походом в реестр. Скачано при этом 0 пакетов, всё время уходит на раскладку
файлов по медленному диску сервера. Слой получается жирным, поэтому экспорт
длится 5 минут и не укладывается в сессию buildkit.

По истории деплоев:

| Что менялось в коммите | Длительность |
|---|---|
| только `apps/front` | 2–4 мин |
| `packages/*` вместе с back и front | 40–70 мин |

`packages/alfa` меняется почти в каждом коммите (9 раз с июня), поэтому
медленный путь — обычный.

## Почему распил монорепы не поможет

Фронт зависит от 11 workspace-пакетов, бэк — от одного `@alfa/entities`.
После распила эти пакеты переедут в репозиторий фронта вместе с тем же
Dockerfile. Финальная стадия останется той же, и 18 минут установки и экспорта
никуда не денутся. Выигрыш от распила около нуля.

Цена при этом высокая. Почти каждый коммит меняет `alfa`, back и front разом.
После распила `@alfa/entities` придётся публиковать как npm-пакет с версиями,
а клиент `nest-api` генерировать из swagger бэка в другом репозитории. Каждая
сквозная правка превратится в три релиза.

Независимость деплоев back и front даёт шаг 3 ниже, без распила.

## Шаг 1. Фронт на standalone-сборку Next — главный выигрыш

Next кладёт в `.next/standalone` готовый `server.js` и только те файлы из
`node_modules`, которые реально нужны. Установка зависимостей в финальной
стадии исчезает целиком. Ожидаемо: минус 13 минут установки, экспорт с 5 минут
до десятков секунд, образ примерно с 1 ГБ до 200–300 МБ.

### 1.1 `apps/front/next.config.js`

```js
import { fileURLToPath } from 'node:url';

const nextConfig = {
    output: 'standalone',
    // Корень монорепо: без него workspace-пакеты не попадут в трассировку
    outputFileTracingRoot: fileURLToPath(new URL('../../', import.meta.url)),
    // ...остальное как было
};
```

### 1.2 `docker/Dockerfile.front`, финальная стадия целиком

```dockerfile
FROM node:20-slim AS prod
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

# Из-за outputFileTracingRoot сервер лежит по пути монорепо
COPY --from=build /app/apps/front/.next/standalone ./
COPY --from=build /app/apps/front/.next/static     ./apps/front/.next/static
COPY --from=build /app/apps/front/public           ./apps/front/public
COPY --from=build /app/apps/front/.env             ./apps/front/.env

CMD ["node", "apps/front/server.js"]
```

Там же удалить неиспользуемую стадию `prod-deps`.

### 1.3 Подводные камни

- **`HOSTNAME=0.0.0.0` обязателен.** Standalone-сервер слушает адрес из
  `HOSTNAME`, а Docker кладёт туда id контейнера. Без переменной healthcheck
  на 127.0.0.1 не пройдёт и деплой упадёт по таймауту ожидания.
- **`.env`.** `server.js` делает `chdir` в свою папку и читает `.env` оттуда.
  Проверить, что `IN_BITRIX` и `LOG_FILE_PATH` видны в рантайме.
- **Логи.** `LOG_FILE_PATH=/app/logs/server.log` абсолютный, том `./logs:/app/logs`
  в compose менять не нужно.
- **`next.config.js` проверяет env при сборке** и падает без `ONLINE_API_KEY`,
  `IN_BITRIX`, `LOG_FILE_PATH`. В стадии build они берутся из `.env`, как сейчас.

### 1.4 Проверка до мержа

```
docker compose build front-alfacentr
docker run --rm -p 4300:3000 alfacentr-front:prod
curl -I http://localhost:4300/
curl -s -o /dev/null -D - -X POST http://localhost:4300/api/app   # location: /bitrix/main
```

Открыть `/bitrix/main` в браузере, проверить картинки, шрифты и `/bitrix/participants/<id>`.

## Шаг 2. Не пересобирать бэк без причины

В `.github/workflows/deploy-alfa-prod.yml` бэк сейчас пересобирается при любой
правке в `packages/`. Сузить условие до его реальных зависимостей:

```sh
if echo "$MEANINGFUL" | grep -qE '^(apps/back/|docker/Dockerfile\.back|packages/(alfa|eslint-config|typescript-config)/)'; then
  need_back=true
fi
```

## Шаг 3 (по желанию). Сборка в GitHub Actions вместо сервера

Раннер GitHub собирает back и front параллельно, кладёт образы в GHCR с кешем
слоёв в реестре. Сервер делает только `docker compose pull && up -d`.
Уходят медленный диск, нестабильный npm и залипающий buildkit на сервере.
Ожидаемо 5–10 минут на любой коммит.

Перед началом проверить на сервере, что GHCR доступен из России:

```
docker pull ghcr.io/home-assistant/home-assistant:stable
```

Если тянется медленно, запасной вариант: `docker save | ssh ... docker load`.

## Порядок и оценка

| Шаг | Работа | Эффект |
|---|---|---|
| 1. Standalone | 2–3 ч с проверкой | минус 18 мин на каждой сборке фронта, нет таймаутов экспорта |
| 2. Условие для бэка | 0,5 ч | нет лишней сборки бэка при правках фронтовых пакетов |
| 3. Сборка в CI | 4–6 ч | 5–10 мин на любой деплой, сервер не собирает |

Шаги 1 и 2 — одним PR. Шаг 3 — отдельным, после проверки GHCR.

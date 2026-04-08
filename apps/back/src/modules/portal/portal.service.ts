import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/core/redis/redis.service';
import { IPortal, IPortalResponse } from './interfaces/portal.interface';
import { Redis } from 'ioredis';
import { APIOnlineClient } from '../../clients/online/';
import { PortalModelFactory } from './factory/potal-model.factory';
import { PortalModel } from './services/portal.model';

/** Stored at `portal_${domain}_meta` — when to try refreshing from API */
interface IPortalCacheMeta {
    expiresAt: number;
}

@Injectable()
export class PortalService {
    private readonly logger = new Logger(PortalService.name);
    /** After this period the next read will try to refresh the portal from the API */
    private readonly PORTAL_CACHE_REFRESH_MS = 10 * 24 * 60 * 60 * 1000;
    /** If refresh fails but stale portal exists, next API attempt no sooner than this */
    private readonly REFRESH_RETRY_MS = 30 * 60 * 1000;
    private readonly redis: Redis;

    constructor(
        private readonly redisService: RedisService,
        private readonly apiOnlineClient: APIOnlineClient,
        private readonly modelFactory: PortalModelFactory,
    ) {
        this.logger.log('PortalService initialized');
        this.redis = this.redisService.getClient();
    }

    private cacheKeys(domain: string) {
        return {
            portal: `portal_${domain}`,
            meta: `portal_${domain}_meta`,
        };
    }

    private isPortalValid(data: unknown, domain: string): data is IPortal {
        if (!data || typeof data !== 'object') return false;
        const portal = data as IPortal;
        const hook = portal.C_REST_WEB_HOOK_URL;
        if (typeof hook !== 'string' || hook.trim() === '') return false;
        if (
            portal.domain != null &&
            String(portal.domain).toLowerCase() !== String(domain).toLowerCase()
        ) {
            return false;
        }
        return true;
    }

    private parseMeta(raw: string | null): IPortalCacheMeta | null {
        if (!raw) return null;
        try {
            const m = JSON.parse(raw) as IPortalCacheMeta;
            return typeof m?.expiresAt === 'number' && !Number.isNaN(m.expiresAt)
                ? m
                : null;
        } catch {
            return null;
        }
    }

    private async persistPortalCache(domain: string, portal: IPortal): Promise<void> {
        const { portal: portalKey, meta: metaKey } = this.cacheKeys(domain);
        const expiresAt = Date.now() + this.PORTAL_CACHE_REFRESH_MS;
        await this.redis.set(portalKey, JSON.stringify(portal));
        await this.redis.set(metaKey, JSON.stringify({ expiresAt } satisfies IPortalCacheMeta));
    }

    /** After a failed refresh, keep stale portal but retry API no sooner than after REFRESH_RETRY_MS */
    private async deferNextRefreshAttempt(domain: string): Promise<void> {
        const { meta: metaKey } = this.cacheKeys(domain);
        const expiresAt = Date.now() + this.REFRESH_RETRY_MS;
        await this.redis.set(metaKey, JSON.stringify({ expiresAt } satisfies IPortalCacheMeta));
        this.logger.log(
            `Next portal refresh attempt scheduled in ${this.REFRESH_RETRY_MS / 60000} min`,
        );
    }

    async getPortalByDomain(domain: string): Promise<IPortal> {
        this.logger.log(`Getting portal for domain: ${domain}`);
        const { portal: cacheKey, meta: metaKey } = this.cacheKeys(domain);

        const [cached, metaRaw] = await Promise.all([
            this.redis.get(cacheKey),
            this.redis.get(metaKey),
        ]);
        const meta = this.parseMeta(metaRaw);
        const now = Date.now();
        const cacheFresh = Boolean(
            cached && meta && now < meta.expiresAt,
        );

        if (cacheFresh && cached) {
            this.logger.log('Returning cached portal (within refresh window)');
            const portal = JSON.parse(cached) as IPortal;
            this.logger.log(`Cached portal domain: ${portal?.domain}`);
            this.logger.log(
                `Cached portal webhook: ${portal?.C_REST_WEB_HOOK_URL}`,
            );
            return portal;
        }

        if (cached && meta && now >= meta.expiresAt) {
            this.logger.log('Portal cache refresh window expired, requesting from API');
        } else if (!cached) {
            this.logger.log('Portal not in cache, requesting from API');
        } else {
            this.logger.log('Portal cache missing meta, requesting from API');
        }

        let response: Awaited<
            ReturnType<APIOnlineClient['request']>
        >;
        try {
            response = await this.apiOnlineClient.request(
                'post',
                'getportal',
                { domain },
                'portal',
            );
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(
                `Portal API request failed (${domain}): ${msg}`,
            );
            if (cached) {
                await this.deferNextRefreshAttempt(domain);
                this.logger.warn(
                    'Returning stale cached portal; refresh will retry later',
                );
                return JSON.parse(cached) as IPortal;
            }
            throw err instanceof Error ? err : new Error(msg);
        }

        this.logger.log(`API response code: ${response.resultCode}`);

        if (response.resultCode === 0) {
            const portal = response.data as unknown;
            if (this.isPortalValid(portal, domain)) {
                this.logger.log(`Portal from API domain: ${portal.domain}`);
                this.logger.log(
                    `Portal from API webhook: ${portal.C_REST_WEB_HOOK_URL}`,
                );
                this.logger.log(`Caching portal for domain: ${domain}`);
                await this.persistPortalCache(domain, portal);
                return portal;
            }
            this.logger.warn(
                `API returned data but portal failed validation for domain: ${domain}`,
            );
        } else {
            this.logger.error(`Error getting portal: ${response.message}`);
        }

        if (cached) {
            await this.deferNextRefreshAttempt(domain);
            this.logger.warn(
                'Refresh failed or invalid portal; returning stale cached portal',
            );
            return JSON.parse(cached) as IPortal;
        }

        const errMsg =
            response.resultCode === 0
                ? 'Invalid portal data from API'
                : typeof response.message === 'string'
                  ? response.message
                  : 'Failed to load portal';
        throw new Error(errMsg);
    }
    async getModelByDomain(domain: string): Promise<PortalModel> {
        Logger.log('getModelByDomain: ' + domain);
        const portal = await this.getPortalByDomain(domain);
        Logger.log('getModelByDomain: ' + portal?.id);
        return this.modelFactory.create(portal);
    }
    async getHook(domain: string): Promise<string> {
        this.logger.log(`Getting hook for domain: ${domain}`);
        const portal = await this.getPortalByDomain(domain);
        const hook = `https://${domain}/${portal.C_REST_WEB_HOOK_URL}`;
        this.logger.log(`Hook URL: ${hook}`);
        return hook;
    }

    async getPortalData(domain: string): Promise<IPortalResponse> {
        this.logger.log(`Getting portal data for domain: ${domain}`);
        try {
            const portal = await this.getPortalByDomain(domain);
            this.logger.log('Portal data retrieved successfully');
            return {
                success: true,
                data: portal,
            };
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting portal data: ${message}`);
            return {
                success: false,
                error: message,
            };
        }
    }

    // async updatePortalData(domain: string, data: IPortal): Promise<IPortalResponse> {
    //     this.logger.log(`Updating portal data for domain: ${domain}`);
    //     await this.redis.set(domain, JSON.stringify(data), 'EX', this.CACHE_TTL);
    //     this.logger.log('Portal data updated successfully');
    //     return {
    //         success: true,
    //         data: data as IPortal
    //     };
    // }
}

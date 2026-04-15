import { runtimeConfig } from '../../config/runtime';
import { normalizeTokenPayload } from '../../auth/sessionAdapter';
import { buildRefreshGrantForm } from '../../auth/grants';
import {
  clearStoredSession,
  readStoredContext,
  readStoredSession,
  readStoredTokens,
  storeTokens,
} from '../../auth/sessionStorage';
import type { AuthTokens } from '../../auth/sessionTypes';

type PrimitiveBody = BodyInit | URLSearchParams | null | undefined;
type JsonRecord = Record<string, unknown>;

export interface BladeRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  auth?: boolean;
  body?: PrimitiveBody;
  headers?: HeadersInit;
  retryOnUnauthorized?: boolean;
}

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (isJsonRecord(payload)) {
    const candidates = [payload.error_description, payload.msg, payload.message, payload.error];
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }
  }

  return fallback;
}

function shouldTreatAsBladeFailure(payload: unknown): boolean {
  if (!isJsonRecord(payload)) {
    return false;
  }

  if (payload.success === false) {
    return true;
  }

  const code = payload.code;
  if (typeof code === 'number') {
    return code !== 0 && code !== 200;
  }

  if (typeof code === 'string' && code.trim()) {
    return code !== '0' && code !== '200';
  }

  return false;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

function buildHeaders(options: BladeRequestOptions): Headers {
  const headers = new Headers(options.headers);
  headers.set('Authorization', runtimeConfig.basicAuth);
  headers.set('Blade-Requested-With', 'BladeHttpRequest');

  if (options.body instanceof URLSearchParams && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
  }

  if (!options.auth) {
    return headers;
  }

  const tokens = readStoredTokens();
  if (tokens?.accessToken) {
    headers.set('Blade-Auth', `${(tokens.tokenType || 'bearer').toLowerCase()} ${tokens.accessToken}`);
  }

  const context = readStoredContext();
  if (context?.tenantId) {
    headers.set('Tenant-Id', context.tenantId);
  }
  if (context?.deptId) {
    headers.set('Dept-Id', context.deptId);
  }
  if (context?.roleId) {
    headers.set('Role-Id', context.roleId);
  }

  return headers;
}

async function refreshStoredTokens(): Promise<AuthTokens | null> {
  const currentTokens = readStoredTokens();
  if (!currentTokens?.refreshToken) {
    clearStoredSession();
    return null;
  }

  const context = readStoredContext();
  const response = await fetch(`${runtimeConfig.apiBaseUrl}/blade-auth/oauth/token`, {
    method: 'POST',
    headers: buildHeaders({
      body: buildRefreshGrantForm(currentTokens.refreshToken, context?.tenantId || runtimeConfig.defaultTenantId),
    }),
    body: buildRefreshGrantForm(currentTokens.refreshToken, context?.tenantId || runtimeConfig.defaultTenantId),
  });

  const payload = await parseResponseBody(response);
  if (!response.ok || shouldTreatAsBladeFailure(payload)) {
    clearStoredSession();
    return null;
  }

  const tokens = normalizeTokenPayload(payload);
  if (!tokens.accessToken || !tokens.refreshToken) {
    clearStoredSession();
    return null;
  }

  const currentSession = readStoredSession();
  storeTokens(tokens, currentSession?.context, currentSession?.activeTopMenuId);
  return tokens;
}

let inflightRefresh: Promise<AuthTokens | null> | null = null;

async function ensureFreshTokens(): Promise<AuthTokens | null> {
  if (!inflightRefresh) {
    inflightRefresh = refreshStoredTokens().finally(() => {
      inflightRefresh = null;
    });
  }

  return inflightRefresh;
}

export class BladeHttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = 'BladeHttpError';
  }
}

async function requestInternal<T>(path: string, options: BladeRequestOptions, isRetry: boolean): Promise<T> {
  const response = await fetch(`${runtimeConfig.apiBaseUrl}${path}`, {
    ...options,
    headers: buildHeaders(options),
    body: options.body,
  });

  const payload = await parseResponseBody(response);

  if (
    response.status === 401 &&
    options.auth &&
    options.retryOnUnauthorized !== false &&
    !isRetry
  ) {
    const refreshed = await ensureFreshTokens();
    if (refreshed?.accessToken) {
      return requestInternal<T>(path, options, true);
    }
  }

  if (!response.ok || shouldTreatAsBladeFailure(payload)) {
    throw new BladeHttpError(extractErrorMessage(payload, response.statusText || 'Request failed'), response.status, payload);
  }

  return payload as T;
}

export const bladeClient = {
  get<T>(path: string, options: Omit<BladeRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return requestInternal<T>(path, { ...options, method: 'GET' }, false);
  },

  post<T>(path: string, body?: PrimitiveBody, options: Omit<BladeRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return requestInternal<T>(path, { ...options, method: 'POST', body }, false);
  },
};

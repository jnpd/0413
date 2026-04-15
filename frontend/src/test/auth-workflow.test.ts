import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runtimeConfig } from '../config/runtime';
import { restoreSession } from '../auth/authApi';
import { buildPasswordGrantForm } from '../auth/grants';
import { readStoredContext, readStoredTokens, storeTokens } from '../auth/sessionStorage';
import { bladeClient } from '../lib/http/bladeClient';

class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

describe('auth workflow', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { localStorage: new MemoryStorage() });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('builds a password grant form with encrypted credentials', () => {
    const form = buildPasswordGrantForm({
      username: 'admin',
      password: '123456',
    });

    expect(form.get('grant_type')).toBe('password');
    expect(form.get('tenant_id')).toBe(runtimeConfig.defaultTenantId);
    expect(form.get('username')).toBe('admin');
    expect(form.get('password')).toMatch(/^04[0-9a-f]+$/i);
    expect(form.get('password')).not.toBe('123456');
  });

  it('sends authenticated requests with the Blade headers and request context', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { ok: true } }));
    vi.stubGlobal('fetch', fetchMock);

    storeTokens(
      {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        tokenType: 'bearer',
      },
      {
        tenantId: '000000',
        deptId: '200',
        roleId: '300',
      },
    );

    await bladeClient.get('/blade-wms/warehouse/stat', { auth: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);

    expect(url).toBe(`${runtimeConfig.apiBaseUrl}/blade-wms/warehouse/stat`);
    expect(headers.get('Authorization')).toBe(runtimeConfig.basicAuth);
    expect(headers.get('Blade-Auth')).toBe('bearer access-token');
    expect(headers.get('Blade-Requested-With')).toBe('BladeHttpRequest');
    expect(headers.get('Tenant-Id')).toBe('000000');
    expect(headers.get('Dept-Id')).toBe('200');
    expect(headers.get('Role-Id')).toBe('300');
  });

  it('refreshes the token once and retries the failed request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error_description: 'token expired' }, 401))
      .mockResolvedValueOnce(
        jsonResponse({
          access_token: 'access-token-next',
          refresh_token: 'refresh-token-next',
          expires_in: 7200,
          token_type: 'bearer',
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ data: { ok: true } }));

    vi.stubGlobal('fetch', fetchMock);

    storeTokens(
      {
        accessToken: 'access-token-old',
        refreshToken: 'refresh-token-old',
        expiresIn: 3600,
        tokenType: 'bearer',
      },
      {
        tenantId: '000000',
      },
    );

    const result = await bladeClient.get<{ data: { ok: boolean } }>('/blade-system/menu/routes', { auth: true });

    expect(result).toEqual({ data: { ok: true } });
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const refreshCall = fetchMock.mock.calls[1] as [string, RequestInit];
    const refreshHeaders = new Headers(refreshCall[1].headers);
    const refreshedTokens = readStoredTokens();

    expect(refreshCall[0]).toBe(`${runtimeConfig.apiBaseUrl}/blade-auth/oauth/token`);
    expect(refreshHeaders.get('Authorization')).toBe(runtimeConfig.basicAuth);
    expect(String(refreshCall[1].body)).toContain('grant_type=refresh_token');
    expect(String(refreshCall[1].body)).toContain('refresh_token=refresh-token-old');
    expect(refreshedTokens?.accessToken).toBe('access-token-next');
    expect(refreshedTokens?.refreshToken).toBe('refresh-token-next');
  });

  it('restores the authenticated session and derives request context from user-info', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        data: {
          user: {
            id: 'user-1',
            account: 'admin',
            name: '管理员',
            role_id: 'role-9',
            dept_id: 'dept-8',
            tenant_id: 'tenant-7',
          },
          permissions: ['warehouse:view'],
          roles: ['admin'],
        },
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    storeTokens({
      accessToken: 'stored-access',
      refreshToken: 'stored-refresh',
      expiresIn: 3600,
      tokenType: 'bearer',
    });

    const session = await restoreSession();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(session?.user.account).toBe('admin');
    expect(session?.context).toEqual({
      tenantId: 'tenant-7',
      deptId: 'dept-8',
      roleId: 'role-9',
    });
    expect(readStoredContext()).toEqual({
      tenantId: 'tenant-7',
      deptId: 'dept-8',
      roleId: 'role-9',
    });
  });
});

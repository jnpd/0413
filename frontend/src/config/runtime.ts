const DEFAULT_API_BASE_URL = 'http://localhost:8010';
const DEFAULT_BASIC_AUTH = 'Basic c2FiZXIzOnNhYmVyM19zZWNyZXQ=';
const DEFAULT_PUBLIC_KEY =
  '048e0fa1f4464715230efda6f5b2a9713f69f898b35d8c7c1bc19ec3998e023707193a43a842efed9037b9e8c5a6246e6de95d2d94b911db2e0fa41c917b0fc958';

export function resolveApiBaseUrl(envValue: string | undefined, isDev: boolean): string {
  const trimmed = envValue?.trim() ?? '';
  if (trimmed) {
    return trimmed;
  }

  return isDev ? '' : DEFAULT_API_BASE_URL;
}

export const runtimeConfig = {
  apiBaseUrl: resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL, import.meta.env.DEV),
  basicAuth: import.meta.env.VITE_BLADE_BASIC_AUTH?.trim() || DEFAULT_BASIC_AUTH,
  publicKey: import.meta.env.VITE_BLADE_PUBLIC_KEY?.trim() || DEFAULT_PUBLIC_KEY,
  defaultTenantId: import.meta.env.VITE_DEFAULT_TENANT_ID?.trim() || '000000',
  tenantMode: import.meta.env.VITE_BLADE_TENANT_MODE === 'true',
  captchaMode: import.meta.env.VITE_BLADE_CAPTCHA_MODE === 'true',
} as const;

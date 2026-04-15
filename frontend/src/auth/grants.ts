import { sm2 } from 'sm-crypto';
import { runtimeConfig } from '../config/runtime';
import type { PasswordLoginInput } from './sessionTypes';

export function encryptBladePassword(password: string, publicKey = runtimeConfig.publicKey): string {
  const encrypted = sm2.doEncrypt(password, publicKey, 0);
  return encrypted ? `04${encrypted}` : '';
}

export function buildPasswordGrantForm(input: PasswordLoginInput): URLSearchParams {
  const form = new URLSearchParams();

  form.set('grant_type', 'password');
  form.set('tenant_id', input.tenantId?.trim() || runtimeConfig.defaultTenantId);
  form.set('username', input.username.trim());
  form.set('password', encryptBladePassword(input.password));

  return form;
}

export function buildRefreshGrantForm(refreshToken: string, tenantId = runtimeConfig.defaultTenantId): URLSearchParams {
  const form = new URLSearchParams();

  form.set('grant_type', 'refresh_token');
  form.set('tenant_id', tenantId);
  form.set('refresh_token', refreshToken);

  return form;
}

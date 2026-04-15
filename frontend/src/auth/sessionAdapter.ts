import { runtimeConfig } from '../config/runtime';
import type { AuthenticatedUser, AuthRequestContext, AuthTokens, TopMenuRecord } from './sessionTypes';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }
  return '';
}

function pickNumber(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return 0;
}

function pickStringArray(...values: unknown[]): string[] {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value
        .map((item) => pickString(item))
        .filter(Boolean);
    }
  }
  return [];
}

export function normalizeTokenPayload(payload: unknown): AuthTokens {
  const record = asRecord(payload);
  return {
    accessToken: pickString(record.access_token, record.accessToken),
    refreshToken: pickString(record.refresh_token, record.refreshToken),
    expiresIn: pickNumber(record.expires_in, record.expiresIn),
    tokenType: pickString(record.token_type, record.tokenType) || 'bearer',
  };
}

export function normalizeUserInfoPayload(payload: unknown): AuthenticatedUser {
  const envelope = asRecord(payload);
  const data = asRecord(envelope.data);
  const nestedUser = asRecord(data.user);
  const detail = asRecord(data.detail ?? envelope.detail);
  const source = Object.keys(nestedUser).length
    ? nestedUser
    : Object.keys(data).length
      ? data
      : envelope;
  const normalizedRoleName = pickString(source.roleName, source.role_name, detail.roleName, detail.role_name);
  const normalizedRoles = pickStringArray(data.roles, source.roles, detail.roles);

  return {
    userId: pickString(source.id, source.userId, source.user_id, detail.userId, detail.user_id),
    account: pickString(source.account, source.username, source.user_name, detail.account, detail.user_name),
    name: pickString(source.name, source.nickName, source.nick_name, detail.name, detail.nickName, source.realName, detail.realName, detail.real_name),
    realName: pickString(source.realName, source.real_name, source.nickName, source.nick_name, detail.realName, detail.real_name, source.name, detail.name),
    avatar: pickString(source.avatar, detail.avatar),
    roleId: pickString(source.roleId, source.role_id, detail.roleId, detail.role_id),
    roleName: normalizedRoleName,
    deptId: pickString(source.deptId, source.dept_id, detail.deptId, detail.dept_id),
    tenantId:
      pickString(source.tenantId, source.tenant_id, detail.tenantId, detail.tenant_id) || runtimeConfig.defaultTenantId,
    detail,
    permissions: pickStringArray(data.permissions, source.permissions, detail.permissions),
    roles: normalizedRoles.length ? normalizedRoles : normalizedRoleName ? [normalizedRoleName] : [],
  };
}

export function normalizeTopMenus(payload: unknown): TopMenuRecord[] {
  const envelope = asRecord(payload);
  const records = Array.isArray(envelope.data) ? envelope.data : Array.isArray(payload) ? payload : [];

  return records
    .map((item) => asRecord(item))
    .filter((item) => pickString(item.id, item.code, item.name))
    .map((item) => ({
      id: pickString(item.id),
      code: pickString(item.code) || undefined,
      name: pickString(item.name) || '未命名模块',
      path: pickString(item.path) || undefined,
      source: pickString(item.source) || undefined,
    }));
}

export function deriveRequestContext(user: AuthenticatedUser): AuthRequestContext {
  return {
    tenantId: user.tenantId || runtimeConfig.defaultTenantId,
    deptId: user.deptId,
    roleId: user.roleId,
  };
}

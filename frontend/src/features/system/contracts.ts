import type { Enterprise, Role, UserAccount } from '../../types';

type PagePayload<T> = {
  data?: {
    records?: T[];
  } | T[];
};

type BackendEnterpriseRow = {
  enterpriseId?: string | number;
  enterpriseName?: string;
  enterpriseCode?: string;
  enterpriseType?: number | string;
  adminUserId?: string | number;
  adminName?: string;
  loginAccount?: string;
  status?: number | string;
  createdTime?: string;
  createTime?: string;
};

type BackendUserRow = {
  id?: string | number;
  account?: string;
  realName?: string;
  roleId?: string;
  roleName?: string;
  enterpriseId?: string | number;
  enterpriseName?: string;
  isAdmin?: number | string;
  primaryAdmin?: number | string;
  status?: number | string;
  lastLoginTime?: string | null;
  updateTime?: string | null;
};

type BackendRoleRow = {
  id?: string | number;
  roleName?: string;
  roleAlias?: string;
  status?: number | string;
};

function asArray<T>(payload: PagePayload<T> | unknown): T[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload as T[];
  }

  const recordPayload = payload as PagePayload<T>;
  if (Array.isArray(recordPayload.data)) {
    return recordPayload.data;
  }

  if (recordPayload.data && typeof recordPayload.data === 'object' && Array.isArray(recordPayload.data.records)) {
    return recordPayload.data.records;
  }

  return [];
}

function toId(value: string | number | undefined): string {
  return value == null ? '' : String(value);
}

function toStatus(value: string | number | undefined): 'active' | 'disabled' {
  return String(value ?? '1') === '1' ? 'active' : 'disabled';
}

function toEnterpriseType(value: string | number | undefined): Enterprise['type'] {
  return String(value ?? '1') === '2' ? 'meter-factory' : 'water-company';
}

export function normalizeEnterprisePage(payload: unknown): Enterprise[] {
  return asArray<BackendEnterpriseRow>(payload).map((row) => ({
    id: toId(row.enterpriseId),
    name: row.enterpriseName ?? '',
    code: row.enterpriseCode ?? '',
    type: toEnterpriseType(row.enterpriseType),
    adminUserId: toId(row.adminUserId),
    adminName: row.adminName ?? '',
    adminUsername: row.loginAccount ?? '',
    status: toStatus(row.status),
    createdAt: row.createTime ?? row.createdTime ?? '',
  }));
}

export function normalizeUserPage(payload: unknown): UserAccount[] {
  return asArray<BackendUserRow>(payload).map((row) => ({
    id: toId(row.id),
    username: row.account ?? '',
    realName: row.realName ?? '',
    roleId: row.roleId ?? '',
    role: row.roleName ?? '',
    enterpriseId: toId(row.enterpriseId),
    enterpriseName: row.enterpriseName ?? '',
    isAdmin: String(row.isAdmin ?? '0') === '1',
    primaryAdmin: String(row.primaryAdmin ?? '0') === '1',
    status: toStatus(row.status),
    lastLogin: row.lastLoginTime ?? row.updateTime ?? '-',
  }));
}

export function normalizeRolePage(payload: unknown): Role[] {
  return asArray<BackendRoleRow>(payload).map((row) => ({
    id: toId(row.id),
    name: row.roleName ?? '',
    alias: row.roleAlias ?? '',
    status: toStatus(row.status),
    permissions: [],
  }));
}

export function isPlatformAdministrator(roles: string[]): boolean {
  const normalized = new Set(roles.map((role) => role.trim()).filter(Boolean));
  return normalized.has('administrator') || normalized.has('admin');
}

export function buildRoleGrantPayload(roleId: string, menuIds: string[]) {
  return {
    roleIds: [roleId],
    menuIds,
    dataScopeIds: [] as string[],
    apiScopeIds: [] as string[],
  };
}

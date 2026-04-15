import type { Enterprise, Role, UserAccount } from '../../types';
import { bladeClient } from '../../lib/http/bladeClient';
import {
  buildRoleGrantPayload,
  normalizeEnterprisePage,
  normalizeRolePage,
  normalizeUserPage,
} from './contracts';

export interface PageResult<T> {
  records: T[];
  current: number;
  size: number;
  total: number;
  pages: number;
}

export interface PageQuery {
  current?: number;
  size?: number;
  keyword?: string;
  status?: string;
}

export interface EnterprisePageQuery extends PageQuery {
  enterpriseType?: string;
}

export interface UserPageQuery extends PageQuery {
  enterpriseId?: string;
  isAdmin?: string;
}

export interface RolePageQuery extends PageQuery {
  roleAlias?: string;
}

export interface EnterpriseSubmitInput {
  enterpriseId?: string;
  enterpriseName: string;
  enterpriseType: number;
  adminName: string;
  loginAccount: string;
  password?: string;
  status?: number;
}

export interface UserSubmitInput {
  id?: string;
  account: string;
  realName: string;
  enterpriseId: string;
  roleId?: string;
  isAdmin?: number;
  password?: string;
  status?: number;
}

export interface RoleSubmitInput {
  id?: string;
  roleName: string;
  roleAlias: string;
  status?: number;
  parentId?: number;
  sort?: number;
}

export interface MenuTreeNode {
  id: string;
  title: string;
  children: MenuTreeNode[];
}

function appendQuery(searchParams: URLSearchParams, key: string, value: string | number | undefined | null) {
  if (value === undefined || value === null || value === '') {
    return;
  }
  searchParams.set(key, String(value));
}

function buildQuery(params: Record<string, string | number | undefined | null>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => appendQuery(searchParams, key, value));
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

function unwrapData(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  if ('data' in payload && payload.data && typeof payload.data === 'object') {
    return payload.data as Record<string, unknown>;
  }

  return payload as Record<string, unknown>;
}

function extractPageMeta(payload: unknown): Omit<PageResult<never>, 'records'> {
  const data = unwrapData(payload);
  return {
    current: Number(data.current ?? 1),
    size: Number(data.size ?? 10),
    total: Number(data.total ?? 0),
    pages: Number(data.pages ?? 0),
  };
}

function normalizeTree(nodes: unknown): MenuTreeNode[] {
  if (!Array.isArray(nodes)) {
    return [];
  }

  return nodes.map((node) => {
    const record = node && typeof node === 'object' ? (node as Record<string, unknown>) : {};
    return {
      id: String(record.id ?? record.key ?? ''),
      title: String(record.title ?? record.name ?? ''),
      children: normalizeTree(record.children),
    };
  });
}

export async function fetchEnterprisePage(query: EnterprisePageQuery): Promise<PageResult<Enterprise>> {
  const payload = await bladeClient.get<unknown>(
    `/blade-system/enterprise/page${buildQuery({
      current: query.current,
      size: query.size,
      keyword: query.keyword,
      status: query.status,
      enterpriseType: query.enterpriseType,
    })}`,
    { auth: true },
  );

  return {
    ...extractPageMeta(payload),
    records: normalizeEnterprisePage(payload),
  };
}

export async function fetchEnterpriseList(): Promise<Enterprise[]> {
  const payload = await bladeClient.get<unknown>('/blade-system/enterprise/list', { auth: true });
  return normalizeEnterprisePage(payload);
}

export async function submitEnterprise(input: EnterpriseSubmitInput): Promise<void> {
  await bladeClient.post('/blade-system/enterprise/submit', JSON.stringify(input), {
    auth: true,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function removeEnterprise(id: string): Promise<void> {
  await bladeClient.post(`/blade-system/enterprise/remove${buildQuery({ ids: id })}`, undefined, { auth: true });
}

export async function fetchUserPage(query: UserPageQuery): Promise<PageResult<UserAccount>> {
  const payload = await bladeClient.get<unknown>(
    `/blade-system/user/page${buildQuery({
      current: query.current,
      size: query.size,
      keyword: query.keyword,
      enterpriseId: query.enterpriseId,
      isAdmin: query.isAdmin,
      status: query.status,
    })}`,
    { auth: true },
  );

  return {
    ...extractPageMeta(payload),
    records: normalizeUserPage(payload),
  };
}

export async function submitUser(input: UserSubmitInput): Promise<void> {
  const path = input.id ? '/blade-system/user/update' : '/blade-system/user/submit';
  await bladeClient.post(path, JSON.stringify(input), {
    auth: true,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function removeUser(id: string): Promise<void> {
  await bladeClient.post(`/blade-system/user/remove${buildQuery({ ids: id })}`, undefined, { auth: true });
}

export async function fetchRolePage(query: RolePageQuery): Promise<PageResult<Role>> {
  const payload = await bladeClient.get<unknown>(
    `/blade-system/role/page${buildQuery({
      current: query.current,
      size: query.size,
      roleName: query.keyword,
      roleAlias: query.roleAlias,
      status: query.status,
    })}`,
    { auth: true },
  );

  return {
    ...extractPageMeta(payload),
    records: normalizeRolePage(payload),
  };
}

export async function submitRole(input: RoleSubmitInput): Promise<void> {
  await bladeClient.post('/blade-system/role/submit', JSON.stringify({
    id: input.id ? Number(input.id) : undefined,
    roleName: input.roleName,
    roleAlias: input.roleAlias,
    status: input.status ?? 1,
    parentId: input.parentId ?? 0,
    sort: input.sort ?? 1,
  }), {
    auth: true,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function removeRole(id: string): Promise<void> {
  await bladeClient.post(`/blade-system/role/remove${buildQuery({ ids: id })}`, undefined, { auth: true });
}

export async function fetchRoleGrantTree(): Promise<MenuTreeNode[]> {
  const payload = await bladeClient.get<unknown>('/blade-system/menu/grant-tree', { auth: true });
  const data = unwrapData(payload);
  return normalizeTree(data.menu);
}

export async function fetchRoleTreeKeys(roleId: string): Promise<string[]> {
  const payload = await bladeClient.get<unknown>(`/blade-system/menu/role-tree-keys${buildQuery({ roleIds: roleId })}`, { auth: true });
  const data = unwrapData(payload);
  return Array.isArray(data.menu) ? data.menu.map((item) => String(item)) : [];
}

export async function grantRoleMenus(roleId: string, menuIds: string[]): Promise<void> {
  await bladeClient.post('/blade-system/role/grant', JSON.stringify(buildRoleGrantPayload(roleId, menuIds)), {
    auth: true,
    headers: { 'Content-Type': 'application/json' },
  });
}

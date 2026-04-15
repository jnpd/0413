import { describe, expect, it } from 'vitest';
import {
  buildRoleGrantPayload,
  isPlatformAdministrator,
  normalizeEnterprisePage,
  normalizeRolePage,
  normalizeUserPage,
} from '../features/system/contracts';

describe('system management contracts', () => {
  it('normalizes enterprise rows from the backend page payload', () => {
    const rows = normalizeEnterprisePage({
      data: {
        records: [
          {
            enterpriseId: '1',
            enterpriseName: '杭州轨物',
            enterpriseCode: 'QY1',
            enterpriseType: 1,
            adminUserId: '10',
            adminName: '张三',
            loginAccount: 'hangzhou_admin',
            status: 1,
            createTime: '2026-04-14 10:00:00',
          },
        ],
      },
    });

    expect(rows).toEqual([
      {
        id: '1',
        name: '杭州轨物',
        code: 'QY1',
        type: 'water-company',
        adminUserId: '10',
        adminName: '张三',
        adminUsername: 'hangzhou_admin',
        status: 'active',
        createdAt: '2026-04-14 10:00:00',
      },
    ]);
  });

  it('normalizes user rows with enterprise linkage', () => {
    const rows = normalizeUserPage({
      data: {
        records: [
          {
            id: '200',
            account: 'operator_01',
            realName: '李四',
            roleId: '300',
            roleName: '生产操作员',
            enterpriseId: '500',
            enterpriseName: '杭州轨物',
            isAdmin: 0,
            status: 1,
            lastLoginTime: '2026-04-14 11:20:00',
          },
        ],
      },
    });

    expect(rows).toEqual([
      {
        id: '200',
        username: 'operator_01',
        realName: '李四',
        roleId: '300',
        role: '生产操作员',
        enterpriseId: '500',
        enterpriseName: '杭州轨物',
        isAdmin: false,
        primaryAdmin: false,
        status: 'active',
        lastLogin: '2026-04-14 11:20:00',
      },
    ]);
  });

  it('normalizes role rows from paginated payloads', () => {
    const rows = normalizeRolePage({
      data: {
        records: [
          {
            id: '901',
            roleName: '水务公司管理员',
            roleAlias: 'water_company_admin',
            status: 1,
          },
        ],
      },
    });

    expect(rows).toEqual([
      {
        id: '901',
        name: '水务公司管理员',
        alias: 'water_company_admin',
        permissions: [],
        status: 'active',
      },
    ]);
  });

  it('treats administrator and admin aliases as platform administrators', () => {
    expect(isPlatformAdministrator(['user', 'administrator'])).toBe(true);
    expect(isPlatformAdministrator(['admin'])).toBe(true);
    expect(isPlatformAdministrator(['water_company_admin'])).toBe(false);
  });

  it('builds role grant payloads with menu ids only', () => {
    expect(buildRoleGrantPayload('901', ['1', '2'])).toEqual({
      roleIds: ['901'],
      menuIds: ['1', '2'],
      dataScopeIds: [],
      apiScopeIds: [],
    });
  });
});

import { describe, expect, it } from 'vitest';
import { normalizeTokenPayload } from '../auth/sessionAdapter';
import { extractPermissionCodes } from '../permissions/helpers';
import { adaptMenuTree, findFirstAccessiblePath } from '../router/menuAdapter';
import type { BackendMenuNode } from '../router/menuTypes';

describe('normalizeTokenPayload', () => {
  it('normalizes BladeX oauth payload into client session tokens', () => {
    expect(
      normalizeTokenPayload({
        access_token: 'access-1',
        refresh_token: 'refresh-1',
        expires_in: 3600,
        token_type: 'bearer',
      }),
    ).toEqual({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      expiresIn: 3600,
      tokenType: 'bearer',
    });
  });
});

describe('extractPermissionCodes', () => {
  it('collects button permission codes from menu payload', () => {
    const buttons: BackendMenuNode[] = [
      { id: '1', code: 'user:add', name: '新增', category: 2, children: [] },
      {
        id: '2',
        code: 'role:grant',
        name: '授权',
        category: 2,
        children: [{ id: '3', code: 'role:delete', name: '删除', category: 2, children: [] }],
      },
    ];

    expect(extractPermissionCodes(buttons)).toEqual(new Set(['user:add', 'role:grant', 'role:delete']));
  });
});

describe('adaptMenuTree', () => {
  it('maps backend menu nodes into sidebar items and records missing pages', () => {
    const menus: BackendMenuNode[] = [
      {
        id: '10',
        code: 'system',
        name: '系统管理',
        path: '/system',
        source: 'system',
        category: 1,
        children: [
          { id: '11', code: 'user', name: '人员管理', path: '/system/users', source: 'user', category: 1, children: [] },
          { id: '12', code: 'ghost', name: '未实现页', path: '/ghost', source: 'ghost', category: 1, children: [] },
        ],
      },
    ];

    const registry = new Map([
      ['/system/users', 'users'],
      ['/system/roles', 'roles'],
    ]);

    const result = adaptMenuTree(menus, registry);

    expect(result.sidebarGroups).toHaveLength(1);
    expect(result.sidebarGroups[0]?.items.map((item) => item.path)).toEqual(['/system/users', '/ghost']);
    expect(result.missingPaths).toEqual(['/ghost']);
  });

  it('tolerates top-level menu nodes that omit the children array', () => {
    const menus = [
      {
        id: '20',
        code: 'role',
        name: '角色管理',
        path: '/account/role-management/index',
        source: 'role',
        category: 1,
      },
    ] as BackendMenuNode[];

    const registry = new Map([
      ['/account/role-management/index', '/account/role-management/index'],
    ]);

    const result = adaptMenuTree(menus, registry);

    expect(result.sidebarGroups).toHaveLength(1);
    expect(result.sidebarGroups[0]).toEqual({
      key: '20',
      label: '角色管理',
      items: [
        {
          key: '20',
          label: '角色管理',
          path: '/account/role-management/index',
          iconKey: 'role',
          code: 'role',
          placeholder: false,
        },
      ],
    });
    expect(result.missingPaths).toEqual([]);
  });

  it('selects the first accessible path from adapted navigation', () => {
    expect(
      findFirstAccessiblePath([
        { key: 'group-1', label: '系统管理', items: [{ key: 'a', label: '用户', path: '/system/users' }] },
      ]),
    ).toBe('/system/users');
  });
});

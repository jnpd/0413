import { describe, expect, it } from 'vitest';
import { buildNavigationModel, pickActiveTopMenuId } from '../router/navigationBootstrap';
import { routePathRegistry, resolveViewMeta } from '../router/routeRegistry';
import type { BackendMenuNode } from '../router/menuTypes';

describe('pickActiveTopMenuId', () => {
  it('falls back to null when the backend returns no top menus', () => {
    expect(pickActiveTopMenuId([], null)).toBeNull();
  });

  it('prefers the stored top menu when it still exists', () => {
    expect(
      pickActiveTopMenuId(
        [
          { id: '10', name: '生产系统' },
          { id: '20', name: '系统管理' },
        ],
        '20',
      ),
    ).toBe('20');
  });
});

describe('buildNavigationModel', () => {
  it('builds sidebar groups, permission codes, and a first accessible route from backend payloads', () => {
    const routes: BackendMenuNode[] = [
      {
        id: '100',
        name: '生产系统',
        code: 'productionSystem',
        path: '/productionSystem',
        category: 1,
        children: [
          {
            id: '101',
            name: '表具档案',
            code: 'meterModel',
            path: '/product/archive/index',
            category: 1,
            children: [],
          },
          {
            id: '102',
            name: '未实现页',
            code: 'ghost',
            path: '/ghost/index',
            category: 1,
            children: [],
          },
        ],
      },
    ];

    const buttons: BackendMenuNode[] = [
      {
        id: '200',
        name: '角色管理',
        code: 'role',
        path: '/account/role-management/index',
        category: 1,
        children: [
          { id: '201', name: '新增', code: 'role_add', category: 2, children: [] },
          { id: '202', name: '删除', code: 'role_delete', category: 2, children: [] },
        ],
      },
    ];

    const model = buildNavigationModel(routes, buttons, routePathRegistry);

    expect(model.firstAccessiblePath).toBe('/product/archive/index');
    expect(model.sidebarGroups).toHaveLength(1);
    expect(model.sidebarGroups[0]?.items.map((item) => item.path)).toEqual([
      '/product/archive/index',
      '/ghost/index',
    ]);
    expect(model.missingPaths).toEqual(['/ghost/index']);
    expect(model.permissionCodes).toEqual(new Set(['role', 'role_add', 'role_delete']));
  });

  it('tolerates backend leaf nodes that omit the children array', () => {
    const routes = [
      {
        id: '300',
        name: '系统管理',
        code: 'system',
        path: '/system',
        category: 1,
        children: [
          {
            id: '301',
            name: '角色管理',
            code: 'role',
            path: '/account/role-management/index',
            category: 1,
          },
        ],
      },
    ] as BackendMenuNode[];

    const buttons = [
      {
        id: '400',
        name: '角色管理',
        code: 'role',
        path: '/account/role-management/index',
        category: 1,
        children: [
          { id: '401', name: '新增', code: 'role_add', category: 2 },
        ],
      },
    ] as BackendMenuNode[];

    const model = buildNavigationModel(routes, buttons, routePathRegistry);

    expect(model.firstAccessiblePath).toBe('/account/role-management/index');
    expect(model.permissionCodes).toEqual(new Set(['role', 'role_add']));
  });
});

describe('resolveViewMeta', () => {
  it('maps known backend paths into page titles and sections', () => {
    expect(resolveViewMeta('/product/batchTesting/index')).toEqual({
      title: '批量测试',
      section: '生产系统',
    });

    expect(resolveViewMeta('/account/role-management/index')).toEqual({
      title: '角色管理',
      section: '系统管理',
    });
  });

  it('returns placeholder metadata for unknown routes', () => {
    expect(resolveViewMeta('/placeholder/123')).toEqual({
      title: '功能占位',
      section: '待接入',
    });
  });
});

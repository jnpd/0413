import type { ViewType } from '../types';

export interface RouteMeta {
  path: string;
  section: string;
  title: string;
  view: ViewType;
}

const routeMetaList: RouteMeta[] = [
  { path: '/product/archive/index', section: '生产系统', title: '表具档案', view: 'archive' },
  { path: '/product/warehouse/index', section: '生产系统', title: '仓库管理', view: 'warehouse' },
  { path: '/product/batchManagement/index', section: '生产系统', title: '批次管理', view: 'batch-management' },
  { path: '/product/batchTesting/index', section: '生产系统', title: '批量测试', view: 'testing' },
  { path: '/product/batchTestingHistory/history', section: '生产系统', title: '批量测试历史', view: 'history' },
  { path: '/product/Packaging/index', section: '生产系统', title: '包装管理', view: 'packaging' },
  { path: '/notice/index', section: '公告模块', title: '公告管理', view: 'announcement' },
  { path: '/account/account-management/index', section: '系统管理', title: '账户管理', view: 'enterprise' },
  { path: '/account/user-account/index', section: '系统管理', title: '人员管理', view: 'user-account' },
  { path: '/account/role-management/index', section: '系统管理', title: '角色管理', view: 'role-management' },
];

const routeMetaMap = new Map(routeMetaList.map((item) => [item.path, item]));

export const routePathRegistry = new Map(routeMetaList.map((item) => [item.path, item.path]));
export const appRouteMetaList = routeMetaList;

export function isKnownAppPath(pathname: string): boolean {
  return routeMetaMap.has(pathname);
}

export function resolveViewMeta(pathname: string): Pick<RouteMeta, 'title' | 'section'> {
  if (pathname.startsWith('/placeholder/')) {
    return {
      title: '功能占位',
      section: '待接入',
    };
  }

  const meta = routeMetaMap.get(pathname);
  if (meta) {
    return {
      title: meta.title,
      section: meta.section,
    };
  }

  return {
    title: '功能占位',
    section: '待接入',
  };
}

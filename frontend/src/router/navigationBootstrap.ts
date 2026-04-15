import { normalizeTopMenus } from '../auth/sessionAdapter';
import { extractPermissionCodes } from '../permissions/helpers';
import { adaptMenuTree, findFirstAccessiblePath } from './menuAdapter';
import type { BackendMenuNode, SidebarGroup } from './menuTypes';

interface TopMenuLike {
  id: string;
  name: string;
}

export interface NavigationModel {
  sidebarGroups: SidebarGroup[];
  missingPaths: string[];
  firstAccessiblePath: string | null;
  permissionCodes: Set<string>;
}

function coerceMenuList(payload: unknown): BackendMenuNode[] {
  if (Array.isArray(payload)) {
    return payload as BackendMenuNode[];
  }

  if (payload && typeof payload === 'object' && 'data' in payload && Array.isArray((payload as { data?: unknown[] }).data)) {
    return (payload as { data: BackendMenuNode[] }).data;
  }

  return [];
}

export function pickActiveTopMenuId(payload: unknown, storedTopMenuId: string | null): string | null {
  const topMenus = normalizeTopMenus(payload);
  if (!topMenus.length) {
    return null;
  }

  if (storedTopMenuId && topMenus.some((item) => item.id === storedTopMenuId)) {
    return storedTopMenuId;
  }

  return topMenus[0]?.id ?? null;
}

export function buildNavigationModel(
  routesPayload: unknown,
  buttonsPayload: unknown,
  registry: Map<string, string>,
): NavigationModel {
  const routes = coerceMenuList(routesPayload);
  const buttons = coerceMenuList(buttonsPayload);
  const adapted = adaptMenuTree(routes, registry);

  return {
    sidebarGroups: adapted.sidebarGroups,
    missingPaths: adapted.missingPaths,
    firstAccessiblePath: findFirstAccessiblePath(adapted.sidebarGroups),
    permissionCodes: extractPermissionCodes(buttons),
  };
}

import { normalizeTopMenus } from '../auth/sessionAdapter';
import { readStoredSession, updateStoredTopMenu } from '../auth/sessionStorage';
import { bladeClient } from '../lib/http/bladeClient';
import { buildNavigationModel, pickActiveTopMenuId } from './navigationBootstrap';
import { routePathRegistry } from './routeRegistry';
import type { NavigationModel } from './navigationBootstrap';
import type { BackendMenuNode } from './menuTypes';

interface TopMenuResponse {
  data?: unknown;
}

function unwrapMenuPayload(payload: unknown): BackendMenuNode[] {
  if (Array.isArray(payload)) {
    return payload as BackendMenuNode[];
  }

  if (payload && typeof payload === 'object' && 'data' in payload && Array.isArray((payload as { data?: unknown[] }).data)) {
    return (payload as { data: BackendMenuNode[] }).data;
  }

  return [];
}

export interface NavigationBootstrapResult extends NavigationModel {
  activeTopMenuId: string | null;
  topMenus: ReturnType<typeof normalizeTopMenus>;
}

export async function fetchNavigationBootstrap(): Promise<NavigationBootstrapResult> {
  const storedTopMenuId = readStoredSession()?.activeTopMenuId ?? null;
  const topMenuPayload = await bladeClient.get<TopMenuResponse>('/blade-system/menu/top-menu', { auth: true });
  const activeTopMenuId = pickActiveTopMenuId(topMenuPayload, storedTopMenuId);
  const topMenus = normalizeTopMenus(topMenuPayload);

  const routesQuery = activeTopMenuId ? `?topMenuId=${encodeURIComponent(activeTopMenuId)}` : '';
  const [routesPayload, buttonsPayload] = await Promise.all([
    bladeClient.get<unknown>(`/blade-system/menu/routes${routesQuery}`, { auth: true }),
    bladeClient.get<unknown>('/blade-system/menu/buttons', { auth: true }),
  ]);

  if (activeTopMenuId !== storedTopMenuId) {
    updateStoredTopMenu(activeTopMenuId);
  }

  const navigation = buildNavigationModel(routesPayload, buttonsPayload, routePathRegistry);

  return {
    ...navigation,
    activeTopMenuId,
    topMenus,
  };
}

export function extractRoutePayload(payload: unknown): BackendMenuNode[] {
  return unwrapMenuPayload(payload);
}

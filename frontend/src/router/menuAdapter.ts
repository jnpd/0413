import { getMenuChildren, type AdaptedMenuResult, type BackendMenuNode, type SidebarGroup, type SidebarItem } from './menuTypes';

function normalizePath(path?: string): string | null {
  if (!path) {
    return null;
  }
  return path.startsWith('/') ? path : `/${path}`;
}

function resolveItemPath(node: BackendMenuNode, registry: Map<string, string>): { path: string; placeholder: boolean } {
  const candidates = [
    normalizePath(node.path),
    normalizePath(node.source),
    node.code,
    node.path,
    node.source,
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const mapped = registry.get(candidate);
    if (mapped) {
      return { path: mapped.startsWith('/') ? mapped : candidate, placeholder: false };
    }
  }

  return {
    path: normalizePath(node.path) || normalizePath(node.source) || `/placeholder/${node.id}`,
    placeholder: true,
  };
}

function mapLeafItem(node: BackendMenuNode, registry: Map<string, string>): SidebarItem {
  const resolved = resolveItemPath(node, registry);

  return {
    key: node.id,
    label: node.name,
    path: resolved.path,
    iconKey: node.source || node.code,
    code: node.code,
    placeholder: resolved.placeholder,
  };
}

function filterNavigableNodes(nodes?: BackendMenuNode[]): BackendMenuNode[] {
  return (Array.isArray(nodes) ? nodes : []).filter((node) => (node.category ?? 1) !== 2);
}

export function adaptMenuTree(menuTree: BackendMenuNode[], registry: Map<string, string>): AdaptedMenuResult {
  const missingPaths = new Set<string>();

  const sidebarGroups: SidebarGroup[] = filterNavigableNodes(menuTree)
    .map((group) => {
      const children = filterNavigableNodes(getMenuChildren(group));
      const items = (children.length ? children : [group]).map((node) => {
        const item = mapLeafItem(node, registry);
        if (item.placeholder) {
          missingPaths.add(item.path);
        }
        return item;
      });

      return {
        key: group.id,
        label: group.name,
        items,
      };
    })
    .filter((group) => group.items.length > 0);

  return {
    sidebarGroups,
    missingPaths: Array.from(missingPaths),
  };
}

export function findFirstAccessiblePath(groups: SidebarGroup[]): string | null {
  for (const group of groups) {
    const first = group.items[0];
    if (first?.path) {
      return first.path;
    }
  }

  return null;
}

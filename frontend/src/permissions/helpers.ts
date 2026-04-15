import { getMenuChildren, type BackendMenuNode } from '../router/menuTypes';

export function extractPermissionCodes(nodes: BackendMenuNode[]): Set<string> {
  const result = new Set<string>();

  const visit = (items: BackendMenuNode[]) => {
    items.forEach((item) => {
      if (item.code) {
        result.add(item.code);
      }
      const children = getMenuChildren(item);
      if (children.length) {
        visit(children);
      }
    });
  };

  visit(nodes);
  return result;
}

export function hasPermission(permissionCodes: Set<string>, candidates: string[]): boolean {
  if (!candidates.length) {
    return true;
  }

  return candidates.some((code) => permissionCodes.has(code));
}

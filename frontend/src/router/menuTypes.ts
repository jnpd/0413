export interface BackendMenuNode {
  id: string;
  code?: string;
  name: string;
  path?: string;
  source?: string;
  component?: string;
  category?: number;
  children?: BackendMenuNode[];
}

export function getMenuChildren(node: BackendMenuNode): BackendMenuNode[] {
  return Array.isArray(node.children) ? node.children : [];
}

export interface SidebarItem {
  key: string;
  label: string;
  path: string;
  iconKey?: string;
  code?: string;
  placeholder?: boolean;
}

export interface SidebarGroup {
  key: string;
  label: string;
  items: SidebarItem[];
}

export interface AdaptedMenuResult {
  sidebarGroups: SidebarGroup[];
  missingPaths: string[];
}

import React, { createContext, useContext, useMemo } from 'react';
import { hasPermission } from './helpers';

const PermissionContext = createContext<Set<string>>(new Set());

export const PermissionProvider: React.FC<{
  children: React.ReactNode;
  permissionCodes: Set<string>;
}> = ({ children, permissionCodes }) => {
  const normalized = useMemo(() => new Set(permissionCodes), [permissionCodes]);

  return <PermissionContext.Provider value={normalized}>{children}</PermissionContext.Provider>;
};

export function usePermissionSet(): Set<string> {
  return useContext(PermissionContext);
}

export function useHasPermission(candidates: string[]): boolean {
  return hasPermission(usePermissionSet(), candidates);
}

export const PermissionGuard: React.FC<{
  anyOf: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ anyOf, fallback = null, children }) => {
  return useHasPermission(anyOf) ? <>{children}</> : <>{fallback}</>;
};

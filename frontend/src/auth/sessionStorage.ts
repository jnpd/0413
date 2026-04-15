import type { AuthRequestContext, AuthTokens, AuthenticatedUser } from './sessionTypes';

const STORAGE_KEY = 'watermanager.session';

interface StoredSession {
  tokens: AuthTokens;
  context?: AuthRequestContext;
  user?: AuthenticatedUser;
  activeTopMenuId?: string | null;
}

function parseStoredSession(raw: string | null): StoredSession | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function readStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
}

export function readStoredSession(): StoredSession | null {
  const storage = readStorage();
  return parseStoredSession(storage?.getItem(STORAGE_KEY) ?? null);
}

export function readStoredTokens(): AuthTokens | null {
  return readStoredSession()?.tokens ?? null;
}

export function readStoredContext(): AuthRequestContext | null {
  return readStoredSession()?.context ?? null;
}

export function writeStoredSession(session: StoredSession): void {
  const storage = readStorage();
  storage?.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function storeTokens(tokens: AuthTokens, context?: AuthRequestContext, activeTopMenuId?: string | null): void {
  const current = readStoredSession();
  writeStoredSession({ tokens, context, activeTopMenuId, user: current?.user });
}

export function updateStoredUser(user: AuthenticatedUser): void {
  const current = readStoredSession();
  if (!current) {
    return;
  }
  writeStoredSession({ ...current, user });
}

export function updateStoredContext(context: AuthRequestContext): void {
  const current = readStoredSession();
  if (!current) {
    return;
  }
  writeStoredSession({ ...current, context });
}

export function updateStoredTopMenu(activeTopMenuId: string | null): void {
  const current = readStoredSession();
  if (!current) {
    return;
  }
  writeStoredSession({ ...current, activeTopMenuId });
}

export function clearStoredSession(): void {
  const storage = readStorage();
  storage?.removeItem(STORAGE_KEY);
}

import { bladeClient } from '../lib/http/bladeClient';
import { deriveRequestContext, normalizeTokenPayload, normalizeUserInfoPayload } from './sessionAdapter';
import { buildPasswordGrantForm } from './grants';
import {
  clearStoredSession,
  readStoredSession,
  readStoredTokens,
  storeTokens,
  updateStoredContext,
  updateStoredUser,
} from './sessionStorage';
import type { AuthenticatedSession, AuthTokens, PasswordLoginInput } from './sessionTypes';

function assertTokens(tokens: AuthTokens): AuthTokens {
  if (!tokens.accessToken || !tokens.refreshToken) {
    throw new Error('登录成功，但返回的 token 不完整');
  }

  return tokens;
}

async function finalizeSession(tokens: AuthTokens): Promise<AuthenticatedSession> {
  const currentSession = readStoredSession();
  storeTokens(tokens, currentSession?.context, currentSession?.activeTopMenuId);

  const userPayload = await bladeClient.get<unknown>('/blade-auth/oauth/user-info', { auth: true });
  const user = normalizeUserInfoPayload(userPayload);
  const context = deriveRequestContext(user);

  updateStoredUser(user);
  updateStoredContext(context);

  return {
    tokens,
    user,
    context,
  };
}

export async function loginWithPassword(input: PasswordLoginInput): Promise<AuthenticatedSession> {
  const tokenPayload = await bladeClient.post<unknown>(
    '/blade-auth/oauth/token',
    buildPasswordGrantForm(input),
    {
      auth: false,
      retryOnUnauthorized: false,
    },
  );

  return finalizeSession(assertTokens(normalizeTokenPayload(tokenPayload)));
}

export async function restoreSession(): Promise<AuthenticatedSession | null> {
  const tokens = readStoredTokens();
  if (!tokens?.accessToken) {
    return null;
  }

  try {
    return await finalizeSession(tokens);
  } catch {
    clearStoredSession();
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await bladeClient.get('/blade-auth/oauth/logout', {
      auth: true,
      retryOnUnauthorized: false,
    });
  } finally {
    clearStoredSession();
  }
}

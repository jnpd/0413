export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface PasswordLoginInput {
  username: string;
  password: string;
  tenantId?: string;
}

export interface AuthRequestContext {
  tenantId: string;
  deptId?: string;
  roleId?: string;
}

export interface AuthenticatedUser {
  userId: string;
  account: string;
  name: string;
  realName: string;
  avatar?: string;
  roleId?: string;
  roleName?: string;
  deptId?: string;
  tenantId: string;
  detail: Record<string, unknown>;
  permissions: string[];
  roles: string[];
}

export interface AuthenticatedSession {
  tokens: AuthTokens;
  context: AuthRequestContext;
  user: AuthenticatedUser;
}

export interface TopMenuRecord {
  id: string;
  code?: string;
  name: string;
  path?: string;
  source?: string;
}

import { readStoredSession } from '../../auth/sessionStorage';
import { isPlatformAdministrator } from './contracts';

export function readSystemSession() {
  const session = readStoredSession();
  const user = session?.user ?? null;

  return {
    session,
    user,
    isPlatformAdmin: user ? isPlatformAdministrator(user.roles) : false,
  };
}

import "server-only";

import { getOptionalSession } from "./auth";

export async function getAdminSession() {
  const session = await getOptionalSession();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!session || !adminEmail || session.user.email.toLowerCase() !== adminEmail) {
    return null;
  }

  return session;
}

export async function getAdminAccess() {
  const session = await getOptionalSession();

  if (!session) return { session: null, status: 401 };

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) return { session: null, status: 503 };
  if (session.user.email.toLowerCase() !== adminEmail) {
    return { session: null, status: 403 };
  }

  return { session, status: 200 };
}
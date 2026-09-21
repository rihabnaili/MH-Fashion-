// Stateless admin session: a signed, expiring token stored in an httpOnly cookie.
// Uses Web Crypto so it works both in route handlers and in edge middleware.

export const ADMIN_SESSION_COOKIE = 'mh_admin_session';
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

const encoder = new TextEncoder();

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must be set to at least 32 characters');
  }
  return secret;
}

function toBase64Url(bytes: ArrayBuffer) {
  let binary = '';
  new Uint8Array(bytes).forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createAdminSessionToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE_SECONDS;
  const payload = `admin.${expiresAt}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifyAdminSessionToken(token?: string | null) {
  if (!token) {
    return false;
  }

  const lastDot = token.lastIndexOf('.');
  if (lastDot <= 0) {
    return false;
  }

  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  const [subject, expiresAtRaw] = payload.split('.');
  const expiresAt = Number(expiresAtRaw);

  if (subject !== 'admin' || !Number.isFinite(expiresAt) || expiresAt * 1000 < Date.now()) {
    return false;
  }

  try {
    return timingSafeEqual(signature, await hmac(payload));
  } catch {
    return false;
  }
}

export async function verifyAdminPassword(candidate: unknown) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof candidate !== 'string') {
    return false;
  }
  // Compare HMACs so the comparison is constant-time regardless of input length.
  return timingSafeEqual(await hmac(`pw:${candidate}`), await hmac(`pw:${expected}`));
}

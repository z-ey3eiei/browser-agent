import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "browser_agent_session";
export const SESSION_SECONDS = 12 * 60 * 60;

function credentials() {
  const username = process.env.PRIVATE_LOGIN_USERNAME;
  const password = process.env.PRIVATE_LOGIN_PASSWORD;
  // A randomly generated password also signs sessions. Fail closed on weak/missing configuration.
  if (!username || username.length > 256 || !password || password.length < 32 || password.length > 1024) return null;
  return { username, password };
}

export function isLoginConfigured(): boolean {
  return credentials() !== null;
}

function equal(a: string, b: string): boolean {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

export function checkCredentials(username: string, password: string): boolean {
  const configured = credentials();
  if (!configured || username.length > 256 || password.length > 1024) return false;
  const validUser = equal(username, configured.username);
  const validPassword = equal(password, configured.password);
  return validUser && validPassword;
}

function signature(payload: string, username: string, password: string): string {
  return createHmac("sha256", password)
    .update(`browser-agent-owner-session-v1\0${username}\0${payload}`)
    .digest("base64url");
}

export function createSession(now = Date.now()): string {
  const configured = credentials();
  if (!configured) throw new Error("Private login is not configured");
  const issued = Math.floor(now / 1000);
  const payload = `${issued}.${issued + SESSION_SECONDS}`;
  return `${payload}.${signature(payload, configured.username, configured.password)}`;
}

export function verifySession(token: string | undefined, now = Date.now()): boolean {
  const configured = credentials();
  if (!configured || !token || token.length > 200) return false;
  const match = /^(\d{10})\.(\d{10})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match) return false;
  const [, issued, expires, mac] = match;
  const seconds = Math.floor(now / 1000);
  if (Number(issued) > seconds || Number(expires) <= seconds || Number(expires) - Number(issued) !== SESSION_SECONDS) return false;
  return equal(mac, signature(`${issued}.${expires}`, configured.username, configured.password));
}

export function sessionFromRequest(request: Request): boolean {
  const token = request.headers.get("cookie")?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  return verifySession(token);
}

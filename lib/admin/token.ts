// Bez `next/*` importa - ovaj modul koristi i proxy.ts i server akcije.
export const ADMIN_COOKIE = "localis_admin";
export const TRAJANJE_MS = 30 * 24 * 60 * 60 * 1000; // 30 dana

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("ADMIN_SESSION_SECRET nije postavljen ili je prekratak.");
  return s;
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Buffer.from(sig).toString("base64url");
}

// Usporedba u konstantnom vremenu - bez ranog izlaza po sadržaju.
export function jednakoKonstantno(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Token = "<exp ms>.<hmac(exp)>". Bez stanja na serveru - promjena tajne poništava sve sesije.
export async function napraviToken(trajanjeMs = TRAJANJE_MS): Promise<string> {
  const exp = String(Date.now() + trajanjeMs);
  return `${exp}.${await hmac(exp)}`;
}

export async function provjeriToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < Date.now()) return false;
  return jednakoKonstantno(await hmac(exp), sig);
}

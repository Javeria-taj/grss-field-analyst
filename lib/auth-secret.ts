import crypto from 'crypto';

// The value every auth file used to fall back to. Keeping it named here means a
// deployment that is still using it can be detected instead of silently minting
// tokens that another service cannot verify.
export const INSECURE_DEFAULT_SECRET = 'grss_super_secret_change_in_production';

/**
 * Short, non-reversible fingerprint of the signing secret.
 *
 * Vercel and Render must use the SAME SESSION_SECRET: Vercel signs the JWT in
 * /api/auth/login, and the realtime server verifies it in the socket handshake.
 * When they differ, every socket is rejected with "Invalid or expired session"
 * while the rest of the app keeps working — the failure mode that is almost
 * impossible to diagnose from the outside. Log this fingerprint on both sides
 * and compare: same fingerprint = same secret. It exposes 8 hex chars of a
 * SHA-256 digest, which is not enough to recover the secret.
 */
export function secretFingerprint(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex').slice(0, 8);
}

/**
 * Resolve SESSION_SECRET and shout about an unsafe configuration.
 * Deliberately does not throw: a hard failure here would take a live event
 * down mid-game. It logs loudly instead so the problem is visible in logs.
 */
export function getSessionSecret(context: string): string {
  const secret = process.env.SESSION_SECRET || INSECURE_DEFAULT_SECRET;
  const fp = secretFingerprint(secret);

  if (!process.env.SESSION_SECRET) {
    console.error(
      `🚨 [${context}] SESSION_SECRET is NOT SET — falling back to the public ` +
      `default committed in this repo. Anyone can forge an admin token. ` +
      `Set SESSION_SECRET to the SAME value on Vercel and Render.`
    );
  } else if (secret === INSECURE_DEFAULT_SECRET) {
    console.error(
      `🚨 [${context}] SESSION_SECRET is set to the well-known default value. ` +
      `Rotate it to a strong random string on Vercel AND Render.`
    );
  }

  console.log(`🔑 [${context}] session secret fingerprint: ${fp}`);
  return secret;
}

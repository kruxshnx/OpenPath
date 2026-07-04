import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

// AES-256-GCM at-rest encryption for the stored GitHub access tokens
// (see Prisma schema: User.accessToken). Format: iv:authTag:ciphertext (base64).
const ALGO = 'aes-256-gcm';

function getKey(): Buffer {
  const secret =
    process.env.ENCRYPTION_KEY ?? process.env.JWT_SECRET ?? 'openpath-dev-key';
  // Derive a 32-byte key. A static salt is acceptable because the secret is
  // expected to be high-entropy; rotate ENCRYPTION_KEY to rotate keys.
  return scryptSync(secret, 'openpath-token-salt', 32);
}

export function encryptToken(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

export function decryptToken(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(':');
  const decipher = createDecipheriv(ALGO, getKey(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]);
  return dec.toString('utf8');
}

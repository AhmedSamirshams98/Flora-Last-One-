// Encrypts small secrets (the authenticator seed) before they go into the database.
// AES-256-GCM, the key comes from NEXTAUTH_SECRET. Changing that secret makes the stored
// seeds unreadable, so every admin would have to be set up again.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const key = () => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  return createHash("sha256").update(secret).digest();
};

export function seal(text) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64")).join(".");
}

export function open(box) {
  const [iv, tag, data] = box.split(".").map((x) => Buffer.from(x, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

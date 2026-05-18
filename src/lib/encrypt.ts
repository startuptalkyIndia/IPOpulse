import crypto from "crypto";
const IV_LEN = 16;

function getKey(): Buffer {
  const k = process.env.ENCRYPTION_KEY;
  if (!k) throw new Error("ENCRYPTION_KEY env var not set");
  return Buffer.from(k, "hex");
}

export function encryptApiKey(text: string): string {
  const KEY = getKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv("aes-256-cbc", KEY, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + enc.toString("hex");
}

export function decryptApiKey(text: string): string {
  const KEY = getKey();
  const [ivHex, encHex] = text.split(":");
  const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, Buffer.from(ivHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]).toString("utf8");
}

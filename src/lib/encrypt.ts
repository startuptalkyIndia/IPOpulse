import crypto from "crypto";

const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
const IV_LEN = 16;

export function encryptApiKey(text: string): string {
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv("aes-256-cbc", KEY, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + enc.toString("hex");
}

export function decryptApiKey(text: string): string {
  const [ivHex, encHex] = text.split(":");
  const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, Buffer.from(ivHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]).toString("utf8");
}

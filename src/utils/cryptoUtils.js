import crypto from "crypto";

// Constants
const algorithm = "aes-256-ctr";
const secretKey = process.env.ENCRYPTION_KEY || "default_secret_key".repeat(2).slice(0, 32); // Ensure 32 bytes
const ivLength = 16; // 16 bytes for AES

// Encrypt Function
export const encrypt = (text) => {
  if (!text) throw new Error("Text to encrypt is required.");
  
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "utf-8"), iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

// Decrypt Function
export const decrypt = (encryptedText) => {
  if (!encryptedText) throw new Error("Encrypted text is required.");
  
  const [iv, encrypted] = encryptedText.split(":");
  
  if (!iv || !encrypted) {
    throw new Error("Invalid encrypted text format.");
  }

  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey, "utf-8"),
    Buffer.from(iv, "hex")
  );

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString();
};

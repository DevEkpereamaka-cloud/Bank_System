import crypto from "crypto";
import dotenv from "dotenv";
import { buffer } from "stream/consumers";
dotenv.config();
const algorithm = "aes-256-gcm";
const key = Buffer.from(process.env.ENCRYPTION_KEY);
const ivLength = 12;
const AUTH_TAG_LENGTH = 16;
export const encryptData = (text) => {
  try {
    if (!text || typeof text !== "string")
      throw new Error("Invalid text provided for encryption");
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    if (authTag.length !== AUTH_TAG_LENGTH) {
      console.log("Someone passed a seal with wrong size");
      throw new Error("Invalid Seal size");
    }
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (error) {
    console.log({ "Encryption Failed": error.message });
    return null;
  }
};
export const decryptData = (combinedText) => {
  try {
    const [ivHex, authTagHex, encryptedTextHex] = combinedText.split(":");
    if (!ivHex || !authTagHex || !encryptedTextHex) {
      throw new Error("Invalid Encrypted data format");
    }
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const encryptedText = Buffer.from(encryptedTextHex, "hex");
    const decipher = crypto.createDecipheriv(algorithm, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error({ "Decryption failed": error.message });
    return null;
  }
};

import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

export const s3 = new S3Client({
  region: requireEnv("DO_SPACES_REGION"), // 👉 will throw if missing
  endpoint: requireEnv("DO_SPACES_ENDPOINT"),
  forcePathStyle: false,
  credentials: {
    accessKeyId: requireEnv("DO_SPACES_KEY"),
    secretAccessKey: requireEnv("DO_SPACES_SECRET"),
  },
});
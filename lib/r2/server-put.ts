import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "./presigned";

export async function putToR2(params: { key: string; body: Uint8Array; contentType: string }) {
  await r2Client().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    })
  );
}

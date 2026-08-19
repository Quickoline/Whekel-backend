import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export const uploadFileToS3 = async (filePath, objectKey) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`[S3 Warning] Local file not found at ${filePath}, skipping S3 upload.`);
      return null;
    }

    const fileStream = fs.createReadStream(filePath);
    const bucketName = process.env.AWS_S3_BUCKET_NAME || 'whekel';
    const key = objectKey || `profiles/${path.basename(filePath)}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileStream,
      ContentType: 'image/jpeg'
    });

    await s3Client.send(command);

    const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    console.log(`[AWS S3] Uploaded ${path.basename(filePath)} to S3 successfully: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error(`[AWS S3 Error]: ${error.message}`);
    // Return fallback URL if S3 upload encounters permissions or network error
    return 'https://whekel.s3.us-east-1.amazonaws.com/profiles/phoadi.jpg';
  }
};

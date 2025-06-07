import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env['AWS_REGION']!,
  credentials: {
    accessKeyId: process.env['AWS_ACCESS_KEY_ID']!,
    secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY']!,
  },
});

export const generatePresignedUrl = async (key: string, fileType: string) => {
  const command = new PutObjectCommand({
    Bucket: process.env['AWS_BUCKET_NAME']!,
    Key: key,
    ContentType: fileType,
  });

  try {
    const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min expiry
    console.log('Presigned URL generated successfully');
    return url;
  } catch (error: any) {
    console.error('Error generating presigned URL:', {
      message: error.message,
      code: error.Code || error.code,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      key,
      fileType,
      bucket: process.env['AWS_BUCKET_NAME'],
    });
    throw error; // Re-throw to allow caller to handle the error
  }
};

export const deleteS3Object = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env['AWS_BUCKET_NAME']!,
    Key: key,
  });

  try {
    const result = await s3.send(command);
    console.log('S3 object deleted successfully:', {
      key,
      statusCode: result.$metadata.httpStatusCode,
      requestId: result.$metadata.requestId,
    });
    return true;
  } catch (error: any) {
    console.error('Error deleting S3 object:', {
      message: error.message,
      code: error.Code || error.code,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      key,
      bucket: process.env['AWS_BUCKET_NAME'],
    });
    return false;
  }
};

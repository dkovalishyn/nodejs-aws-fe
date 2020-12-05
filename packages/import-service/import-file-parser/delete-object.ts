import S3 from 'aws-sdk/clients/s3';
import { BUCKET } from '../bucket';

export const deleteObject = async (filename: string) => {
  console.log('Delete object', filename);
  const s3 = new S3();

  await s3
    .deleteObject({
      Bucket: BUCKET,
      Key: filename,
    })
    .promise();

  console.log('Successfully deleted', filename);
};

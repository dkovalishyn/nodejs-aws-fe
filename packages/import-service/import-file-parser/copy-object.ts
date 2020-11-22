import { BUCKET } from '../bucket';
import S3 from 'aws-sdk/clients/s3';

export const copyObject = async (
  filename: string,
  from: string,
  to: string,
) => {
  console.log('Copy object', filename, ', from: ', from, ', to: ', to);
  const s3 = new S3();
  await s3
    .copyObject({
      Bucket: BUCKET,
      CopySource: `${BUCKET}/${filename}`,
      Key: filename.replace(`${from}/`, `${to}/`),
    })
    .promise();

  console.log('Successfully copied: ', filename.replace(`${from}/`, `${to}/`));
};

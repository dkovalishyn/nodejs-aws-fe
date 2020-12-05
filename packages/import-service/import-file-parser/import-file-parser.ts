import { S3Handler } from 'aws-lambda';
import S3 from 'aws-sdk/clients/s3';
import csvParser from 'csv-parser';
import { BUCKET } from '../bucket';
import { copyObject } from './copy-object';
import { deleteObject } from './delete-object';
import { sendData } from './send-data';

export const importFileParser: S3Handler = (event) => {
  console.log('Request:', JSON.stringify(event, null, 2));

  const s3 = new S3({ region: 'eu-central-1' });
  for (let record of event.Records) {
    const {
      s3: {
        object: { key: filename },
      },
    } = record;

    s3.getObject({
      Bucket: BUCKET,
      Key: filename,
    })
      .createReadStream()
      .pipe(csvParser())
      .on('data', sendData)
      .on('end', async (code) => {
        if (code) {
          console.error('Read stream closed with exit code: ', code);
          return;
        }

        try {
          await copyObject(filename, 'uploaded', 'parsed');
          await deleteObject(filename);
        } catch (e) {
          console.log(e);
        }
      });
  }
};

import createAPI from 'lambda-api';
import { readFileSync } from 'node:fs';
// getLink() produces a presigned URL by SIGNING locally (no network) given region+creds.
const api = createAPI({
  version: 'v1',
  s3Config: { region: 'us-east-1', credentials: { accessKeyId: 'test', secretAccessKey: 'test' } },
});
api.get('/link', async (req, res) => {
  const url = await res.getLink('s3://my-bucket/path/key.txt');
  return { url };
});
const event = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const r = await api.run(event, {});
process.stdout.write(JSON.stringify(r));

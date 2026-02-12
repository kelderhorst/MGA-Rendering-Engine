import { BlobSASPermissions, BlobServiceClient, generateBlobSASQueryParameters, StorageSharedKeyCredential } from '@azure/storage-blob';

const containerName = process.env.AZURE_STORAGE_CONTAINER ?? 'render-jobs';

function getBlobServiceClient() {
  const connection = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connection) {
    throw new Error('Missing AZURE_STORAGE_CONNECTION_STRING');
  }
  return BlobServiceClient.fromConnectionString(connection);
}

export async function uploadToBlob(blobName: string, fileBuffer: Buffer, contentType: string) {
  const service = getBlobServiceClient();
  const container = service.getContainerClient(containerName);
  await container.createIfNotExists();
  const client = container.getBlockBlobClient(blobName);
  await client.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
  return client.url;
}

export async function generateReadSasUrl(blobUrl: string) {
  const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!conn) throw new Error('Missing AZURE_STORAGE_CONNECTION_STRING');

  const match = /AccountName=([^;]+);AccountKey=([^;]+)/.exec(conn);
  if (!match) {
    throw new Error('Azure connection string missing AccountName/AccountKey for SAS generation');
  }

  const [, accountName, accountKey] = match;
  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  const url = new URL(blobUrl);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const container = pathParts.shift();
  const blobName = pathParts.join('/');

  if (!container || !blobName) {
    throw new Error('Invalid blob URL');
  }

  const expiresOn = new Date(Date.now() + (Number(process.env.BLOB_SIGNED_URL_TTL_SECONDS ?? 900) * 1000));

  const sas = generateBlobSASQueryParameters(
    {
      containerName: container,
      blobName,
      permissions: BlobSASPermissions.parse('r'),
      expiresOn,
    },
    credential,
  ).toString();

  return `${url.origin}/${container}/${blobName}?${sas}`;
}

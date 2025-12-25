const { BlobServiceClient } = require('@azure/storage-blob');

const containerName = 'trades';
const blobName = 'raystrades.json';

// Connection string comes from environment variable in Azure config
const connectionString = process.env['AzureWebJobsStorage'];

module.exports = async function (context, req) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Load existing trades (or initialize an empty list if blob doesn't exist)
  let trades = [];

  try {
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    const downloaded = await streamToString(downloadBlockBlobResponse.readableStreamBody);
    trades = JSON.parse(downloaded || '[]');
  } catch (error) {
    // If blob not found, it's okay — we'll create it on first save
    if (error.statusCode !== 404) {
      context.res = {
        status: 500,
        body: { error: 'Failed to read existing trades.' }
      };
      return;
    }
  }

  if (req.method === 'GET') {
    context.res = {
      status: 200,
      body: trades
    };
  } else if (req.method === 'POST') {
    const { symbol, type, strike1, strike2, expiration, credit, status } = req.body;

    if (!symbol || !type || !strike1 || !strike2 || !expiration || !credit || !status) {
      context.res = {
        status: 400,
        body: { error: 'Missing trade fields.' }
      };
      return;
    }

    trades.push({ symbol, type, strike1, strike2, expiration, credit, status });

    try {
      await blockBlobClient.upload(JSON.stringify(trades, null, 2), Buffer.byteLength(JSON.stringify(trades)), {
        blobHTTPHeaders: { blobContentType: "application/json" }
      });

      context.res = {
        status: 200,
        body: { message: 'Trade saved', trades }
      };
    } catch (error) {
      context.res = {
        status: 500,
        body: { error: 'Failed to save trade.' }
      };
    }
  } else {
    context.res = {
      status: 405,
      body: 'Method not allowed'
    };
  }
};

// Helper to read stream into string
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => chunks.push(data.toString()));
    readableStream.on('end', () => resolve(chunks.join('')));
    readableStream.on('error', reject);
  });
}

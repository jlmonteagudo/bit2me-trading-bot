import { createHash, createHmac } from 'node:crypto';

const API_KEY = process.env.API_KEY;
const SECRET = process.env.SECRET;

export const getAuthHeaders = (path, body) => {
  const nonce = new Date().getTime();
  const messageToSign = getMessageToSign(nonce, path, body);
  const signature = getMessageSignature(messageToSign, SECRET);

  return {
    headers: {
      'x-api-key': API_KEY,
      'api-signature': signature,
      'x-nonce': nonce,
    },
  };
};

const getMessageToSign = (nonce, url, body) => {
  const hasBody = !!body && Object.keys(body).length > 0;

  return hasBody
    ? `${nonce}:${url}:${JSON.stringify(body)}`
    : `${nonce}:${url}`;
};

const getMessageSignature = (message, secret) => {
  const hash = createHash('sha256');
  const hmac = createHmac('sha512', secret);
  const hashDigest = hash.update(message).digest('binary');
  const hmacDigest = hmac.update(hashDigest, 'binary').digest('base64');

  return hmacDigest;
};

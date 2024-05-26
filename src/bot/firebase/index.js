import admin from 'firebase-admin';
// import cert from '../../../certs/firebase-cert.json' assert { type: 'json' };

// admin.initializeApp({
//   credential: admin.credential.cert(cert),
//   databaseURL: process.env.FIREBASE_DATABASE_URL,
// });

const FIREBASE_CREDENTIAL = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY,
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-3w1xz%40bit2me-trading.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(FIREBASE_CREDENTIAL),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.database();

export const botConfig = db.ref('bot');

export const strategy = (strategyId) => db.ref(`strategies/${strategyId}`);

export const positions = db.ref('positions');

export const logs = db.ref('logs');

export const balances = db.ref('balances');

export const tickers = db.ref('tickers');

export const botEvents = {
  openNewPosition: db.ref('botEvents/openNewPosition'),
  closeCurrentPosition: db.ref('botEvents/closeCurrentPosition'),
};

export const serializeSymbols = (symbols) =>
  Object.keys(symbols)
    .filter((symbol) => symbols[symbol])
    .map((symbol) => symbol.replace('-', '/'));

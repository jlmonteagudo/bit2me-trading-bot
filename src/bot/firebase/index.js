import admin from 'firebase-admin';
import cert from '../../../certs/firebase-cert.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(cert),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.database();

export const botConfig = db.ref('bot');

export const strategy = (strategyId) => db.ref(`strategies/${strategyId}`);

export const serializeSymbols = (symbols) =>
  Object.keys(symbols).map((symbol) => symbol.replace('-', '/'));

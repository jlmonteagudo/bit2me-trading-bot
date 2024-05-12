import admin from 'firebase-admin';
import cert from '../../../certs/firebase-cert.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(cert),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.database();

export const botConfig = db.ref('bot');

export const strategy = (strategyId) => db.ref(`strategies/${strategyId}`);

export const positions = db.ref('positions');

export const logs = db.ref('logs');

export const botEvents = {
  openNewPosition: db.ref('botEvents/openNewPosition'),
  closeCurrentPosition: db.ref('botEvents/closeCurrentPosition'),
};

export const serializeSymbols = (symbols) =>
  Object.keys(symbols)
    .filter((symbol) => symbols[symbol])
    .map((symbol) => symbol.replace('-', '/'));

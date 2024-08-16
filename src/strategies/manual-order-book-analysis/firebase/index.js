import admin from 'firebase-admin';
import * as positionDomain from '../position/index.js'
import { logger } from '../../../bot/core/log/logger.js';

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

export const DB_PATH = '/strategies/manual-order-book-analysis';
export const POSITIONS = `${DB_PATH}/positions`;
export const POSITIONS_SIMULATION = `${DB_PATH}/positions-simulation`;

export let db;

const COMMAND_CREATE_POSITION = `${DB_PATH}/commands/createPosition`;
const COMMAND_CLOSE_POSITION = `${DB_PATH}/commands/closePosition`;

export const init = () => {

  admin.initializeApp({
    credential: admin.credential.cert(FIREBASE_CREDENTIAL),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  db = admin.database();

  listenCreatePosition();
  listenClosePosition();
};

const listenCreatePosition = () => {
  db.ref(COMMAND_CREATE_POSITION).on('value', async (snapshot) => {
    db.ref(COMMAND_CREATE_POSITION).remove();
    const newPosition = snapshot.val();

    if (!newPosition) return;
    await positionDomain.createPosition(newPosition.symbol, newPosition.quoteOrderAmount, newPosition.simulation);
  });
};

const listenClosePosition = () => {
  db.ref(COMMAND_CLOSE_POSITION).on('value', async (snapshot) => {
    db.ref(COMMAND_CLOSE_POSITION).remove();
    const closePosition = snapshot.val();

    if (!closePosition) return;
    await positionDomain.closePosition(closePosition);
  });
};

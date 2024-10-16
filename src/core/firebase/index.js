import admin from 'firebase-admin';

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

export const DB_PATH = '/manual-trading';

export let db;

export let messaging;

export const initialize = () => {

  admin.initializeApp({
    credential: admin.credential.cert(FIREBASE_CREDENTIAL),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  db = admin.database();

  messaging = admin.messaging();
};

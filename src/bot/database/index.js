import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import * as migration from './migration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const databasePath = path.resolve(__dirname, 'database.sqlite');

export const database = new Database(databasePath);

export const setup = () => {
  if (!migration.isSchemaCreated()) migration.createSchema();
};

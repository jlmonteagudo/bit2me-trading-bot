import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../core/log/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const databasePath = path.resolve(__dirname, 'database.sqlite');
const database = new Database(databasePath);

export const createSchema = () => {
  database.exec(`
        CREATE TABLE IF NOT EXISTS positions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          symbol TEXT NOT NULL,
          status TEXT NOT NULL,
          entryOrderId TEXT NOT NULL,
          exitOrderId TEXT NOT NULL,
          positionBaseAmount NUMERIC,
          entryPrice NUMERIC,
          exitPrice NUMERIC,
          entryQuoteAmount NUMERIC,
          exitQuoteAmount NUMERIC,
          profit NUMERIC,
          entryDatetime NUMERIC,
          exitDatetime NUMERIC
        );

        CREATE INDEX idx_positions_status ON positions (status);
        CREATE INDEX idx_positions_symbol ON positions (symbol);
        CREATE INDEX idx_positions_entry_datetime ON positions (entryDatetime);
        CREATE INDEX idx_positions_profig ON positions (profit);
    `);

  logger.info('Database schema has been created');
};

export const isSchemaCreated = () => {
  const query = database.prepare(
    `SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='positions';`
  );

  const result = query.get();
  return result.count === 1;
};

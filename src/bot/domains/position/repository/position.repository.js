import { database } from '../../../database/index.js';

export const getCountOpenPositions = () => {
  const query = database.prepare(
    `SELECT count(*) as count FROM positions WHERE status='open';`
  );

  const result = query.get();
  return result.count;
};

import { database } from '../../../database/index.js';

export const getCountOpenPositions = () => {
  const query = database.prepare(
    `SELECT count(*) as count FROM positions WHERE status='open';`
  );

  const result = query.get();
  return result.count;
};

export const getOpenPosition = () => {
  const query = database.prepare(
    `SELECT * FROM positions WHERE status='open';`
  );

  return query.get();
};

export const insertPosition = (position) => {
  const insert = database.prepare(`INSERT INTO positions (
    symbol,
    status,
    entryOrderId,
    exitOrderId,
    positionBaseAmount,
    entryPrice,
    exitPrice,
    entryQuoteAmount,
    exitQuoteAmount,
    profit,
    entryDatetime,
    exitDatetime
  ) VALUES (
    @symbol,
    @status,
    @entryOrderId,
    @exitOrderId,
    @positionBaseAmount,
    @entryPrice,
    @exitPrice,
    @entryQuoteAmount,
    @exitQuoteAmount,
    @profit,
    @entryDatetime,
    @exitDatetime
  )`);

  return insert.run(position);
};

export const updatePosition = (position) => {
  const update = database.prepare(`
    UPDATE positions
    SET
    exitOrderId = @exitOrderId,
    exitPrice = @exitPrice,
    status = @status,
    exitPrice = @exitPrice,
    exitQuoteAmount = @exitQuoteAmount,
    profit = @profit,
    exitDatetime = @exitDatetime
    WHERE
    id = @id
  `);

  return update.run(position);
};

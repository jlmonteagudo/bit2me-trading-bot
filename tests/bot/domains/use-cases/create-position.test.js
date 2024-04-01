import { mock, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { getAmountBasedOnQuoteBalance } from '../../../../src/bot/domains/position/use-cases/create-position.js';
import * as connector from '../../../../src/conector/bit2me.js';

// connector.getOrderBook = async (symbol) => {
//   return {
//     a: [],
//     b: [],
//   };
// };

test('getAmountBasedOnQuoteBalance should return **x** when balance is **y**', async (t) => {
  assert.strictEqual(1, 1);

  t.mock.method(connector, 'getOrderBook', async (symbol) => 'TEST/SYMBOL');

  // t.mock.fn(connector.getOrderBook, async (symbol) => 'TEST/SYMBOL');

  const amount = await getAmountBasedOnQuoteBalance('BTC/USDT', 100);
  console.log({ amount });
});

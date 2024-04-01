import { before, describe, it, test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  getAmountBasedOnQuoteBalance,
  getMaxPriceOfTrades,
} from '../../../../src/bot/domains/position/utils.js';

describe('getAmountBasedOnQuoteBalance', () => {
  let mockedOrderBook;

  before(() => {
    mockedOrderBook = {
      bids: [],
      asks: [
        [70000, 0.1],
        [70010, 0.2],
        [70020, 0.3],
      ],
    };
  });

  it('should return 0.1 when balance is 7000', async () => {
    const amount = getAmountBasedOnQuoteBalance(7000, mockedOrderBook);
    assert.equal(amount, 0.1);
  });

  it('should return 0.3 when balance is 24002', async (t) => {
    const amount = getAmountBasedOnQuoteBalance(7000, mockedOrderBook);
    assert.equal(amount, 0.1);
  });

  it('should return 0.05 when balance is 3500', async (t) => {
    const amount = getAmountBasedOnQuoteBalance(7000, mockedOrderBook);
    assert.equal(amount, 0.1);
  });
});

describe('getMaxPriceOfTrades', () => {
  it('should the max price of all the trades', async () => {
    const mockedTrades = [
      {
        id: '4b81d40f-9732-4f51-8cfa-d17d5ec93968',
        symbol: 'BTC/USDT',
        price: 6001,
        amount: 1,
      },
      {
        id: '4b81d40f-9732-4f51-8cfa-d17d5ec93968',
        symbol: 'BTC/USDT',
        price: 6000,
        amount: 0.9,
      },
    ];

    const maxPrice = getMaxPriceOfTrades(mockedTrades);
    assert.equal(maxPrice, 6001);
  });
});

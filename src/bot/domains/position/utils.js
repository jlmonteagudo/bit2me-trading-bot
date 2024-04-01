export const getAmountBasedOnQuoteBalance = (balance, orderBook) => {
  let amount = 0;
  let remainingBalance = balance;

  for (const [price, volume] of orderBook.asks) {
    const cost = price * volume;
    if (cost <= remainingBalance) {
      amount += volume;
      remainingBalance -= cost;
    } else {
      amount += remainingBalance / price;
      break;
    }
  }

  return amount;
};

export const truncateFloat = (number, maxDecimals) => {
  const power = Math.pow(10, maxDecimals);
  return Math.trunc(number * power) / power;
};

export const getMaxPriceOfTrades = (trades) => {
  const prices = trades.map((trade) => trade.price);
  return Math.max(...prices);
};

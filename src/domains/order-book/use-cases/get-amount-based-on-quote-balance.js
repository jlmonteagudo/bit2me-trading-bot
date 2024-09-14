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

export const getSellQuote = (amountToSell, orderBook) => {
  let sellQuote = 0;
  let remainingAmountToSell = amountToSell;

  for (const [price, volume] of orderBook.bids) {
    if (volume <= remainingAmountToSell) {
      sellQuote += (price * volume);
      remainingAmountToSell -= volume;
    } else {
      sellQuote += (remainingAmountToSell * price);
      break;
    }
  }

  return sellQuote;
};

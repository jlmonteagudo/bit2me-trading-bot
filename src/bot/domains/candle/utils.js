import { CandleEnum } from './enums/candle.enum.js';

export const getPercentagePriceVariation = (candle) =>
  ((candle[CandleEnum.Close] - candle[CandleEnum.Open]) /
    candle[CandleEnum.Open]) *
  100;

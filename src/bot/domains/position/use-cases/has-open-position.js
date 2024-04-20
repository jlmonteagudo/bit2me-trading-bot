import * as repository from '../repository/position.repository.js';

export const hasOpenPosition = async () => {
  const countOpenPositions = repository.getCountOpenPositions();
  return countOpenPositions > 0;
};

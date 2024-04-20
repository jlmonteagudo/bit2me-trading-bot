import * as repository from '../repository/position.repository.js';

export const getOpenPosition = async () => {
  return repository.getOpenPosition();
};

import * as firebase from '../../../firebase/index.js';

export const getCountOpenPositions = async () => {
  const positions = await firebase.positions
    .orderByChild('status')
    .equalTo('open')
    .once('value');

  return positions.numChildren();
};

export const getOpenPosition = async () => {
  const positionsSnapshot = await firebase.positions
    .orderByChild('status')
    .equalTo('open')
    .once('value');

  let positions = positionsSnapshot.val();

  if (!positions) return null;

  positions = Object.keys(positions).map((key) => ({
    id: key,
    ...positions[key],
  }));

  return positions[0];
};

export const insertPosition = async (position) => {
  const result = firebase.positions.push(position);
  return result.key;
};

export const updatePosition = async (position) => {
  let updateData = {
    exitOrderId: position.exitOrderId,
    status: position.status,
    exitPrice: position.exitPrice,
    exitQuoteAmount: position.exitQuoteAmount,
    profit: position.profit,
    exitDatetime: position.exitDatetime,
  };

  updateData = removeUndefinedValues(updateData);

  return firebase.positions.child(position.id).update(updateData);
};

const removeUndefinedValues = (position) => {
  Object.keys(position).forEach(
    (key) => !position[key] && delete position[key]
  );
  return position;
};

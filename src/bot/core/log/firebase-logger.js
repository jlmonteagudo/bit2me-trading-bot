import * as firebase from '../../firebase/index.js';

export const log = async (keyName, value) => {
  return firebase.logs.child(keyName).set(value);
};

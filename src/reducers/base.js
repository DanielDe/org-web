import Immutable from 'immutable';

export default (state = new Immutable.Map(), payload) => {
  switch (payload.type) {
  case 'setLoadingMessage':
    return state.set('loadingMessage', payload.message);
  default:
    return state;
  }
};

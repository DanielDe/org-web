import Immutable from 'immutable';

export default (state = new Immutable.Map(), payload) => {
  switch (payload.type) {
  case 'addHeader':
    return { ...state, headers: [...state.headers, payload.header] };
  case 'displayFile':
    return state.set('fileContents', payload.fileContents);
  default:
    return state;
  }
}

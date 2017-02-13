import Immutable from 'immutable';
import * as parseOrg from '../parse_org';

export default (state = new Immutable.Map(), payload) => {
  switch (payload.type) {
  case 'addHeader':
    return { ...state, headers: [...state.headers, payload.header] };
  case 'displayFile':
    state = state.set('fileContents', payload.fileContents);
    state = state.set('parsedFile', Immutable.fromJS(parseOrg.default(payload.fileContents)));
    return state;
  default:
    return state;
  }
}

import Immutable from 'immutable';
import * as parseOrg from '../parse_org';

const indexPathForHeaderWithId = (headerId, headers, nestingLevel = 0) => {
  if (headerId.size <= nestingLevel) {
    return [];
  }

  const index = headers.findIndex(header => header.get('id').get(nestingLevel) === headerId.get(nestingLevel));

  return [index, ...indexPathForHeaderWithId(headerId, headers.get(index).get('subheaders'), nestingLevel + 1)];
};

export default (state = new Immutable.Map(), payload) => {
  switch (payload.type) {
  case 'addHeader':
    return { ...state, headers: [...state.headers, payload.header] };
  case 'displayFile':
    state = state.set('fileContents', payload.fileContents);
    state = state.set('parsedFile', Immutable.fromJS(parseOrg.default(payload.fileContents)));
    return state;
  case 'toggleHeaderOpened':
    const indexPath = indexPathForHeaderWithId(payload.headerId, state.get('parsedFile'));
    const augmentedIndexPath = indexPath.join('.subheaders.').split('.');
    return state.updateIn(['parsedFile', ...augmentedIndexPath], header => header.set('opened', !header.get('opened')));
  default:
    return state;
  }
}

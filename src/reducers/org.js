import Immutable from 'immutable';
import * as parseOrg from '../parse_org';

// Given an header id, which is an array of header ids starting from top-most parent to the
// header itself, return an array of indices of each of the headers in that path.
const indexPathForHeaderWithId = (headerId, headers, nestingLevel = 0) => {
  if (headerId.size <= nestingLevel) {
    return [];
  }

  const index = headers.findIndex(header => header.get('id').get(nestingLevel) === headerId.get(nestingLevel));

  return [index, ...indexPathForHeaderWithId(headerId,
                                             headers.get(index).get('subheaders'),
                                             nestingLevel + 1)];
};

const augmentedIndexPathForHeaderWithId = (headerId, headers) => {
  const indexPath = indexPathForHeaderWithId(headerId, headers);
  return indexPath.join('.subheaders.').split('.');
};

export default (state = new Immutable.Map(), payload) => {
  let augmentedIndexPath;
  if (payload.headerId || payload.parentHeaderId) {
    augmentedIndexPath = augmentedIndexPathForHeaderWithId(payload.headerId || payload.parentHeaderId,
                                                           state.get('parsedFile'));
  }

  switch (payload.type) {
  case 'addHeader':
    const newHeader = Immutable.fromJS(parseOrg.newHeaderWithTitle(payload.headerText,
                                                                   payload.parentHeaderId));
    return state.updateIn(['parsedFile', ...augmentedIndexPath, 'subheaders'],
                          subheaders => subheaders.push(newHeader));
  case 'displayFile':
    state = state.set('fileContents', payload.fileContents);
    state = state.set('parsedFile', Immutable.fromJS(parseOrg.default(payload.fileContents)));
    return state;
  case 'toggleHeaderOpened':
    return state.updateIn(['parsedFile', ...augmentedIndexPath],
                          header => header.set('opened', !header.get('opened')));
  case 'advanceTodoState':
    const currentTodoState = state.getIn(['parsedFile',
                                          ...augmentedIndexPath,
                                          'titleLine',
                                          'todoKeyword']);
    const currentStateIndex = parseOrg.TODO_KEYWORDS.indexOf(currentTodoState);
    const newStateIndex = currentStateIndex + 1;
    let newTodoState = '';
    if (newStateIndex < parseOrg.TODO_KEYWORDS.length) {
      newTodoState = parseOrg.TODO_KEYWORDS[newStateIndex];
    }

    return state.setIn(['parsedFile', ...augmentedIndexPath, 'titleLine', 'todoKeyword'],
                       newTodoState);
  default:
    return state;
  }
}

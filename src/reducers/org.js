/* globals localStorage */
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

// Given a header, closes all subheaders, and returns the new state.
const closeAllSubheaders = (header) => {
  header = header.set('opened', false);
  return header.set('subheaders',
                    header.get('subheaders').map(subheader => closeAllSubheaders(subheader)));
};

const augmentedIndexPathForHeaderWithId = (headerId, headers) => {
  const indexPath = indexPathForHeaderWithId(headerId, headers);
  return indexPath.join('.subheaders.').split('.');
};

export default (state = new Immutable.Map(), payload) => {
  let augmentedIndexPath, headerIndex, parentAugmentedIndexPath, headerList, header;
  if (payload.headerId || payload.parentHeaderId) {
    augmentedIndexPath = augmentedIndexPathForHeaderWithId(payload.headerId || payload.parentHeaderId,
                                                           state.get('parsedFile'));
  }

  switch (payload.type) {
  case 'addHeader':
    const newHeader = Immutable.fromJS(parseOrg.newHeaderWithTitle('', payload.parentHeaderId));
    return state.updateIn(['parsedFile', ...augmentedIndexPath, 'subheaders'],
                          subheaders => subheaders.push(newHeader));
  case 'removeHeader':
    [headerIndex, ...parentAugmentedIndexPath] = augmentedIndexPath.slice().reverse();
    parentAugmentedIndexPath.reverse();

    return state.updateIn(['parsedFile', ...parentAugmentedIndexPath],
                          subheaders => subheaders.delete(headerIndex));
  case 'moveHeaderUp':
    [headerIndex, ...parentAugmentedIndexPath] = augmentedIndexPath.slice().reverse();
    parentAugmentedIndexPath.reverse();
    headerIndex = parseInt(headerIndex, 10);

    headerList = state.getIn(['parsedFile', ...parentAugmentedIndexPath]);
    if (headerIndex === 0) {
      return state;
    }

    header = headerList.get(headerIndex);
    return state.setIn(['parsedFile', ...parentAugmentedIndexPath],
                          headerList.splice(headerIndex, 1).splice(headerIndex - 1, 0, header));
  case 'moveHeaderDown':
    [headerIndex, ...parentAugmentedIndexPath] = augmentedIndexPath.slice().reverse();
    parentAugmentedIndexPath.reverse();
    headerIndex = parseInt(headerIndex, 10);

    headerList = state.getIn(['parsedFile', ...parentAugmentedIndexPath]);
    if (headerIndex === headerList.size - 1) {
      return state;
    }

    header = headerList.get(headerIndex);
    return state.setIn(['parsedFile', ...parentAugmentedIndexPath],
                          headerList.splice(headerIndex, 1).splice(headerIndex + 1, 0, header));
  case 'displayFile':
    localStorage.setItem('filePath', payload.filePath);
    state = state.set('filePath', payload.filePath);
    state = state.set('fileContents', payload.fileContents);
    state = state.set('parsedFile', Immutable.fromJS(parseOrg.default(payload.fileContents)));
    return state;
  case 'displaySampleFile':
    state = state.set('fileContents', payload.sampleFileContents);
    return state.set('parsedFile', Immutable.fromJS(parseOrg.default(payload.sampleFileContents)));
  case 'setFileContents':
    return state.set('fileContents', payload.fileContents);
  case 'enterSampleMode':
    return state.set('sampleMode', true);
  case 'exitSampleMode':
    return state.set('sampleMode', false).set('fileContents', null);
  case 'stopDisplayingFile':
    localStorage.setItem('filePath', '');
    return state.set('filePath', null).set('fileContents', null).set('parsedFile', null);
  case 'toggleHeaderOpened':
    const opened = state.getIn(['parsedFile', ...augmentedIndexPath].concat(['opened']));
    if (opened) {
      return state.updateIn(['parsedFile', ...augmentedIndexPath],
                            header => closeAllSubheaders(header));
    } else {
      return state.setIn(['parsedFile', ...augmentedIndexPath].concat(['opened']), true);
    }
  case 'openHeader':
    return state.updateIn(['parsedFile', ...augmentedIndexPath],
                          header => header.set('opened', true));
  case 'selectHeader':
    state = state.set('inTitleEditMode', false);
    state = state.set('inDescriptionEditMode', false);
    return state.set('selectedHeaderId', payload.headerId);
  case 'selectLastHeader':
    headerList = state.getIn(['parsedFile', ...augmentedIndexPath]);
    const subheaders = headerList.get('subheaders');

    return state.set('selectedHeaderId',
                     subheaders.get(subheaders.size - 1).get('id'));
  case 'enterTitleEditMode':
    return state.set('inTitleEditMode', true);
  case 'toggleTitleEditMode':
    return state.update('inTitleEditMode', editMode => !editMode);
  case 'toggleDescriptionEditMode':
    return state.update('inDescriptionEditMode', editMode => !editMode);
  case 'editHeaderTitle':
    return state.setIn(['parsedFile', ...augmentedIndexPath, 'titleLine', 'title'],
                       payload.newTitle);
  case 'editHeaderDescription':
    return state.setIn(['parsedFile', ...augmentedIndexPath, 'description'],
                       payload.newDescription);
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
  case 'setDirty':
    return state.set('dirty', payload.dirty);
  default:
    return state;
  }
}

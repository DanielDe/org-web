/* globals localStorage */
import Immutable from 'immutable';
import * as parseOrg from '../parse_org';

const indexOfHeaderWithId = (headers, headerId) => {
  return headers.findIndex(header => header.get('id') === headerId);
};

const headerWithId = (headers, headerId) => {
  return headers.get(indexOfHeaderWithId(headers, headerId));
};

const subheadersOfHeaderWithId = (headers, headerId) => {
  const header = headerWithId(headers, headerId);
  const headerIndex = indexOfHeaderWithId(headers, headerId);

  const afterHeaders = headers.slice(headerIndex + 1);
  const nextSiblingHeaderIndex = afterHeaders.findIndex(siblingHeader => {
    return siblingHeader.get('nestingLevel') <= header.get('nestingLevel');
  });

  if (nextSiblingHeaderIndex === -1) {
    return afterHeaders;
  } else {
    return afterHeaders.slice(0, nextSiblingHeaderIndex);
  }
};

const toggleHeaderOpened = (state, payload) => {
  const headers = state.get('parsedFile');
  const headerIndex = indexOfHeaderWithId(headers, payload.headerId);
  // TODO: handle closing all subheaders.
  const opened = headerWithId(headers, payload.headerId).get('opened');
  return state.setIn(['parsedFile', headerIndex, 'opened'], !opened);
};

const selectHeader = (state, payload) => {
  state = state.set('inTitleEditMode', false);
  state = state.set('inDescriptionEditMode', false);
  return state.set('selectedHeaderId', payload.headerId);
};

const removeHeader = (state, payload) => {
  // TODO: remove all subheaders too.
  const headers = state.get('parsedFile');
  const headerIndex = indexOfHeaderWithId(headers, payload.headerId);
  return state.set('parsedFile', headers.delete(headerIndex));
};

const advanceTodoState = (state, payload) => {
  const headers = state.get('parsedFile');
  const header = headerWithId(headers, payload.headerId);
  const headerIndex = indexOfHeaderWithId(headers, payload.headerId);

  const currentTodoState = header.getIn(['titleLine', 'todoKeyword']);
  const currentStateIndex = parseOrg.TODO_KEYWORDS.indexOf(currentTodoState);
  const newStateIndex = currentStateIndex + 1;
  let newTodoState = '';
  if (newStateIndex < parseOrg.TODO_KEYWORDS.length) {
    newTodoState = parseOrg.TODO_KEYWORDS[newStateIndex];
  }

  return state.setIn(['parsedFile', headerIndex, 'titleLine', 'todoKeyword'], newTodoState);
};

const editHeaderTitle = (state, payload) => {
  const headers = state.get('parsedFile');
  const headerIndex = indexOfHeaderWithId(headers, payload.headerId);

  return state.setIn(['parsedFile', headerIndex, 'titleLine', 'title'], payload.newTitle);
};

const editDescriptionTitle = (state, payload) => {
  const headers = state.get('parsedFile');
  const headerIndex = indexOfHeaderWithId(headers, payload.headerId);

  return state.setIn(['parsedFile', headerIndex, 'description'], payload.newTitle);
};

const openHeader = (state, payload) => {
  const headers = state.get('parsedFile');
  const headerIndex = indexOfHeaderWithId(headers, payload.headerId);

  return state.set(['parsedFile', headerIndex, 'opened'], true);
};

const addHeader = (state, payload) => {
  const headers = state.get('parsedFile');
  const header = headerWithId(headers, payload.headerId);
  const headerIndex = indexOfHeaderWithId(headers, payload.headerId);

  const subheaders = subheadersOfHeaderWithId(headers, payload.headerId);

  const newHeader = Immutable.fromJS(parseOrg.newHeaderWithTitle('',
                                                                 header.get('nestingLevel')));

  return state.update('parsedFile',
                      headers => headers.insert(headerIndex + subheaders.size + 1, newHeader));
};

const selectNextSiblingHeader = (state, payload) => {
  const headers = state.get('parsedFile');
  const headerIndex = indexOfHeaderWithId(headers, payload.headerId);
  const subheaders = subheadersOfHeaderWithId(headers, payload.headerId);

  const nextSibling = headers.get(headerIndex + subheaders.size + 1);

  return state.set('selectedHeaderId', nextSibling.get('id'));
};

export default (state = new Immutable.Map(), payload) => {
  let augmentedIndexPath, headerIndex, parentAugmentedIndexPath, headerList, header;

  switch (payload.type) {
  case 'addHeader':
    return addHeader(state, payload);
  case 'removeHeader':
    return removeHeader(state, payload);
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
  case 'moveHeaderLeft':
    // return moveHeaderLeft(state, payload.headerId);
    return state;
  case 'moveHeaderRight':
    // TODO:
    return state;
  case 'displayFile':
    localStorage.setItem('filePath', payload.filePath);
    state = state.set('filePath', payload.filePath);
    state = state.set('fileContents', payload.fileContents);
    state = state.set('parsedFile', Immutable.fromJS(parseOrg.default(payload.fileContents)));
    return state;
  case 'displaySampleFile':
    state = state.set('fileContents', payload.sampleFileContents);
    return state.set('parsedFile', Immutable.fromJS(parseOrg.default(payload.sampleFileContents)));
  case 'enterSampleMode':
    return state.set('sampleMode', true);
  case 'exitSampleMode':
    return state.set('sampleMode', false).set('fileContents', null);
  case 'stopDisplayingFile':
    localStorage.setItem('filePath', '');
    return state.set('filePath', null).set('fileContents', null).set('parsedFile', null);
  case 'toggleHeaderOpened':
    return toggleHeaderOpened(state, payload);
  case 'openHeader':
    return openHeader(state, payload);
  case 'selectHeader':
    return selectHeader(state, payload);
  case 'selectLastHeader':
    return state;

    // // TODO:
    // headerList = state.getIn(['parsedFile', ...augmentedIndexPath]);
    // const subheaders = headerList.get('subheaders');

    // return state.set('selectedHeaderId',
    //                  subheaders.get(subheaders.size - 1).get('id'));
  case 'selectNextSiblingHeader':
    return selectNextSiblingHeader(state, payload);
  case 'enterTitleEditMode':
    return state.set('inTitleEditMode', true);
  case 'toggleTitleEditMode':
    return state.update('inTitleEditMode', editMode => !editMode);
  case 'toggleDescriptionEditMode':
    return state.update('inDescriptionEditMode', editMode => !editMode);
  case 'editHeaderTitle':
    return editHeaderTitle(state, payload);
  case 'editHeaderDescription':
    return editDescriptionTitle(state, payload);
  case 'advanceTodoState':
    return advanceTodoState(state, payload);
  case 'setDirty':
    return state.set('dirty', payload.dirty);
  default:
    return state;
  }
}

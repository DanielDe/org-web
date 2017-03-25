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

  const opened = headerWithId(headers, payload.headerId).get('opened');

  if (opened) {
    // Close all subheaders as well.
    const subheaders = subheadersOfHeaderWithId(headers, payload.headerId);
    subheaders.forEach((subheader, index) => {
      state = state.setIn(['parsedFile', headerIndex + index + 1, 'opened'], false);
    });
  }

  return state.setIn(['parsedFile', headerIndex, 'opened'], !opened);
};

const selectHeader = (state, payload) => {
  state = state.set('inTitleEditMode', false);
  state = state.set('inDescriptionEditMode', false);
  return state.set('selectedHeaderId', payload.headerId);
};

const removeHeader = (state, payload) => {
  let headers = state.get('parsedFile');
  const headerIndex = indexOfHeaderWithId(headers, payload.headerId);

  const subheaders = subheadersOfHeaderWithId(headers, payload.headerId);
  const numHeadersToRemove = 1 + subheaders.size;
  Array(numHeadersToRemove).fill().forEach(() => {
    headers = headers.delete(headerIndex);
  });

  return state.set('parsedFile', headers);
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

const moveHeaderLeft = (state, payload) => {
  const headers = state.get('parsedFile');
  const headerIndex = indexOfHeaderWithId(headers, payload.headerId);

  return state.updateIn(['parsedFile', headerIndex, 'nestingLevel'],
                        nestingLevel => Math.max(nestingLevel - 1, 1));
};

const moveHeaderRight = (state, payload) => {
  const headers = state.get('parsedFile');
  const headerIndex = indexOfHeaderWithId(headers, payload.headerId);

  return state.updateIn(['parsedFile', headerIndex, 'nestingLevel'],
                        nestingLevel => nestingLevel + 1);
};

const selectNextSiblingHeader = (state, payload) => {
  const headers = state.get('parsedFile');
  const headerIndex = indexOfHeaderWithId(headers, payload.headerId);
  const subheaders = subheadersOfHeaderWithId(headers, payload.headerId);

  const nextSibling = headers.get(headerIndex + subheaders.size + 1);

  return state.set('selectedHeaderId', nextSibling.get('id'));
};

const displayFile = (state, payload) => {
  localStorage.setItem('filePath', payload.filePath);
  return state.set('filePath', payload.filePath)
    .set('fileContents', payload.fileContents)
    .set('parsedFile', Immutable.fromJS(parseOrg.default(payload.fileContents)));
};

const stopDisplayingFile = (state, payload) => {
  localStorage.setItem('filePath', '');
  return state.set('filePath', null).set('fileContents', null).set('parsedFile', null);
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
    return moveHeaderLeft(state, payload);
  case 'moveHeaderRight':
    return moveHeaderRight(state, payload);
  case 'toggleHeaderOpened':
    return toggleHeaderOpened(state, payload);
  case 'openHeader':
    return openHeader(state, payload);
  case 'selectHeader':
    return selectHeader(state, payload);
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
  case 'displayFile':
    return displayFile(state, payload);
  case 'displaySampleFile':
    return state.set('fileContents', payload.sampleFileContents)
      .set('parsedFile', Immutable.fromJS(parseOrg.default(payload.sampleFileContents)));
  case 'enterSampleMode':
    return state.set('sampleMode', true);
  case 'exitSampleMode':
    return state.set('sampleMode', false).set('fileContents', null);
  case 'stopDisplayingFile':
    return stopDisplayingFile(state, payload);
  default:
    return state;
  }
}

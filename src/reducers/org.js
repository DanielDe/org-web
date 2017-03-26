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

const directParentIdOfHeaderWithId = (headers, headerId) => {
  const header = headerWithId(headers, headerId);
  const headerIndex = indexOfHeaderWithId(headers, headerId);

  for (let i = headerIndex - 1; i >= 0; --i) {
    const previousHeader = headers.get(i);

    if (previousHeader.get('nestingLevel') === header.get('nestingLevel') - 1) {
      return previousHeader.get('id');
    }

    if (previousHeader.get('nestingLevel') < header.get('nestingLevel')) {
      return null;
    }
  }

  return null;
};

const openDirectParent = (state, headerId) => {
  const parentHeaderId = directParentIdOfHeaderWithId(state.get('parsedFile'), headerId);
  if (parentHeaderId !== null) {
    const parentHeaderIndex = indexOfHeaderWithId(state.get('parsedFile'), parentHeaderId);
    state = state.setIn(['parsedFile', parentHeaderIndex, 'opened'], true);
  }

  return state;
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

  state = state.updateIn(['parsedFile', headerIndex, 'nestingLevel'],
                         nestingLevel => nestingLevel + 1);

  state = openDirectParent(state, payload.headerId);

  return state;
};

const moveTreeLeft = (state, payload) => {
  const headers = state.get('parsedFile');
  const header = headerWithId(headers, payload.headerId);
  const headerIndex = indexOfHeaderWithId(headers, payload.headerId);

  if (header.get('nestingLevel') === 1) {
    return state;
  }

  const subheaders = subheadersOfHeaderWithId(headers, payload.headerId);

  state = state.updateIn(['parsedFile', headerIndex],
                         header => header.set('nestingLevel', header.get('nestingLevel') - 1));
  subheaders.forEach((_, index) => {
    state = state.updateIn(['parsedFile', headerIndex + index + 1],
                           header => header.set('nestingLevel', header.get('nestingLevel') - 1));
  });

  return state;
};

const moveTreeRight = (state, payload) => {
  const headers = state.get('parsedFile');
  const headerIndex = indexOfHeaderWithId(headers, payload.headerId);

  const subheaders = subheadersOfHeaderWithId(headers, payload.headerId);

  state = state.updateIn(['parsedFile', headerIndex],
                         header => header.set('nestingLevel', header.get('nestingLevel') + 1));
  subheaders.forEach((_, index) => {
    state = state.updateIn(['parsedFile', headerIndex + index + 1],
                           header => header.set('nestingLevel', header.get('nestingLevel') + 1));
  });

  state = openDirectParent(state, payload.headerId);

  return state;
};

const indexOfPreviousSibling = (headers, headerIndex) => {
  const nestingLevel = headers.getIn([headerIndex, 'nestingLevel']);

  for (let i = headerIndex - 1; i >= 0; --i) {
    const header = headers.get(i);

    if (header.get('nestingLevel') < nestingLevel) {
      return null;
    }

    if (header.get('nestingLevel') === nestingLevel) {
      return i;
    }
  }

  return null;
};

const moveHeaderUp = (state, payload) => {
  let headers = state.get('parsedFile');
  const headerIndex = indexOfHeaderWithId(headers, payload.headerId);

  const previousSiblingIndex = indexOfPreviousSibling(headers, headerIndex);
  if (previousSiblingIndex === null) {
    return state;
  }

  const subheaders = subheadersOfHeaderWithId(headers, payload.headerId);
  Array(1 + subheaders.size).fill().forEach(() => {
    headers = headers.insert(previousSiblingIndex, headers.get(headerIndex + subheaders.size));
    headers = headers.delete(headerIndex + subheaders.size + 1);
  });

  return state.set('parsedFile', headers);
};

const moveHeaderDown = (state, payload) => {
  let headers = state.get('parsedFile');
  const header = headerWithId(headers, payload.headerId);
  const headerIndex = indexOfHeaderWithId(headers, payload.headerId);

  const subheaders = subheadersOfHeaderWithId(headers, payload.headerId);
  const nextSiblingIndex = headerIndex + subheaders.size + 1;
  const nextSibling = headers.get(nextSiblingIndex);
  if (nextSibling.get('nestingLevel') < header.get('nestingLevel')) {
    return state;
  }

  const nextSiblingSubheaders = subheadersOfHeaderWithId(headers, nextSibling.get('id'));
  Array(1 + nextSiblingSubheaders.size).fill().forEach(() => {
    headers = headers.insert(headerIndex, headers.get(nextSiblingIndex + nextSiblingSubheaders.size));
    headers = headers.delete(nextSiblingIndex + nextSiblingSubheaders.size + 1);
  });

  return state.set('parsedFile', headers);
};

const selectNextSiblingHeader = (state, payload) => {
  // TODO: Account for the case where the header doesn't have a next sibling.

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
  switch (payload.type) {
  case 'addHeader':
    return addHeader(state, payload);
  case 'removeHeader':
    return removeHeader(state, payload);
  case 'moveHeaderUp':
    return moveHeaderUp(state, payload);
  case 'moveHeaderDown':
    return moveHeaderDown(state, payload);
  case 'moveHeaderLeft':
    return moveHeaderLeft(state, payload);
  case 'moveHeaderRight':
    return moveHeaderRight(state, payload);
  case 'moveTreeLeft':
    return moveTreeLeft(state, payload);
  case 'moveTreeRight':
    return moveTreeRight(state, payload);
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

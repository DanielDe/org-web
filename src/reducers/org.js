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

const headerWithId = (state, headerId) => {
  const augmentedIndexPath = augmentedIndexPathForHeaderWithId(headerId,
                                                               state.get('parsedFile'));
  return state.getIn(['parsedFile', ...augmentedIndexPath]);
};

// Given a header and an ID List, sets this headers parent ID to the specified List, and
// updates all children as well.
// A header's ID is a list of floats, where all but the last element of the list is the
// parent's ID list.
const setNewParentHeaderId = (header, newParentId) => {
  const currentId = header.get('id');
  const uniqueIdPart = currentId.get(currentId.size - 1);

  const newHeaderId = newParentId.concat(uniqueIdPart);
  return header.set('id', newHeaderId).update('subheaders', subheaders => {
    return subheaders.map(subheader => {
      return setNewParentHeaderId(subheader, newHeaderId);
    });
  });
};

const moveHeaderLeft = (state, headerId) => {
  // If the header is already at the top level, it can't move any further left.
  if (headerId.size === 1) {
    return state;
  }

  let header = headerWithId(state, headerId);

  console.log('before');
  console.log(state.toJS().parsedFile);

  // If the header has subheaders, add a new EMPTY header below the header and give the
  // header's subheaders to the new empty header.
  if (header.get('subheaders').size !== 0) {
    let emptyHeader = Immutable.fromJS(parseOrg.newHeaderWithTitle('', header.get('id'), true));
    emptyHeader = emptyHeader.set('subheaders', header.get('subheaders').map(subheader => {
      return setNewParentHeaderId(subheader, emptyHeader.get('id'));
    }));
    header = header.set('subheaders', Immutable.fromJS([emptyHeader.toJS()]));
  }

  // TODO: comment this.
  const parentId = headerId.slice(0, -1);
  let parent = headerWithId(state, parentId);

  const siblings = parent.get('subheaders');
  const headerIndex = siblings.findIndex(item => item.get('id').equals(headerId));

  const beforeSiblings = siblings.slice(0, headerIndex);
  const afterSiblings = siblings.slice(headerIndex + 1, Math.Infinity);

  parent = parent.set('subheaders', beforeSiblings);

  header = header.update('subheaders', subheaders => {
    return subheaders.concat(afterSiblings.map(subheader =>  {
      return setNewParentHeaderId(subheader, header.get('id'));
    }));
  });

  // TODO: comment this.
  const grandparentId = parentId.slice(0, -1);
  let grandparent = headerWithId(state, grandparentId);

  const parentIndex = grandparent.get('subheaders').findIndex(item => item.get('id').equals(parentId));
  grandparent = grandparent.update('subheaders', subheaders => {
    return subheaders
      .slice(0, parentIndex)
      .concat(Immutable.fromJS([parent.toJS()]))
      .concat(Immutable.fromJS([setNewParentHeaderId(header, grandparentId).toJS()]))
      .concat(subheaders.slice(parentIndex + 1, Math.Infinity));
  });

  // TODO: account for case where there is no grandparent.

  // TODO: Maintain currently selected header

  const grandparentAugmentedIndexPath = augmentedIndexPathForHeaderWithId(grandparentId,
                                                                          state.get('parsedFile'));

  return state.setIn(['parsedFile', ...grandparentAugmentedIndexPath], grandparent);
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
  case 'moveHeaderLeft':
    return moveHeaderLeft(state, payload.headerId);
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

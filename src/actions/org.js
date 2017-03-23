import { push } from './dropbox';

export const addHeader = (headerId) => {
  return {
    type: 'addHeader',
    headerId
  };
};

export const selectLastHeader = (parentHeaderId) => {
  return {
    type: 'selectLastHeader',
    parentHeaderId
  };
};

export const selectNextSiblingHeader = (headerId) => {
  return {
    type: 'selectNextSiblingHeader',
    headerId
  };
};

export const removeHeader = (headerId) => {
  return {
    type: 'removeHeader',
    headerId
  };
};

export const displayFile = (fileContents, filePath) => {
  return {
    type: 'displayFile',
    fileContents,
    filePath
  };
};

export const enterSampleMode = () => {
  return {
    type: 'enterSampleMode'
  };
};

export const exitSampleMode = () => {
  return {
    type: 'exitSampleMode'
  };
};

export const displaySampleFile = (sampleFileContents) => {
  return {
    type: 'displaySampleFile',
    sampleFileContents
  };
};

export const displaySample = (sampleFileContents) => {
  return (dispatch, getState) => {
    dispatch(displaySampleFile(sampleFileContents));
    dispatch(enterSampleMode());
  };
};

export const stopDisplayingFile = () => {
  return {
    type: 'stopDisplayingFile'
  };
};

export const toggleHeaderOpened = (headerId) => {
  return {
    type: 'toggleHeaderOpened',
    headerId
  };
};

export const openHeader = (headerId) => {
  return {
    type: 'openHeader',
    headerId
  };
};

export const selectHeader = (headerId) => {
  return {
    type: 'selectHeader',
    headerId
  };
};

export const moveHeaderUp = (headerId) => {
  return {
    type: 'moveHeaderUp',
    headerId
  };
};

export const moveHeaderDown = (headerId) => {
  return {
    type: 'moveHeaderDown',
    headerId
  };
};

export const moveHeaderLeft = (headerId) => {
  return {
    type: 'moveHeaderLeft',
    headerId
  };
};

export const moveHeaderRight = (headerId) => {
  return {
    type: 'moveHeaderRight',
    headerId
  };
};

export const advanceTodoState = (headerId) => {
  return {
    type: 'advanceTodoState',
    headerId
  };
};

export const editHeaderTitle = (headerId, newTitle) => {
  return {
    type: 'editHeaderTitle',
    headerId,
    newTitle
  };
};

export const toggleTitleEditMode = () => {
  return {
    type: 'toggleTitleEditMode'
  };
};

export const enterTitleEditMode = () => {
  return {
    type: 'enterTitleEditMode'
  };
};

export const toggleDescriptionEditMode = () => {
  return {
    type: 'toggleDescriptionEditMode'
  };
};

export const editHeaderDescription = (headerId, newDescription) => {
  return {
    type: 'editHeaderDescription',
    headerId,
    newDescription
  };
};

export const setDirty = (dirty) => {
  return {
    type: 'setDirty',
    dirty
  };
};

export const syncChanges = () => {
  return (dispatch, getState) => {
    dispatch(setDirty(true));

    if (getState().dropbox.get('liveSync')) {
      dispatch(push(getState().org.get('filePath')));
    }
  };
};

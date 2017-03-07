export const addHeader = (parentHeaderId, headerText) => {
  return {
    type: 'addHeader',
    headerText,
    parentHeaderId
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

export const setFileContents = (fileContents) => {
  return {
    type: 'setFileContents',
    fileContents
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

export const editHeaderDescription = (headerId, newDescription) => {
  return {
    type: 'editHeaderDescription',
    headerId,
    newDescription
  };
};

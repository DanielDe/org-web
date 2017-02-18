export const addHeader = (parentHeaderId, headerText) => {
  return {
    type: 'addHeader',
    headerText,
    parentHeaderId
  };
};

export const displayFile = (fileContents, filePath) => {
  return {
    type: 'displayFile',
    fileContents,
    filePath
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

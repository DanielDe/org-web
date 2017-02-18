export const addHeader = (parentHeaderId, headerText) => {
  return {
    type: 'addHeader',
    headerText,
    parentHeaderId
  };
};

export const displayFile = (fileContents) => {
  return {
    type: 'displayFile',
    fileContents
  };
};

export const toggleHeaderOpened = (headerId) => {
  return {
    type: 'toggleHeaderOpened',
    headerId
  };
};

export const advanceTodoState = (headerId) => {
  return {
    type: 'advanceTodoState',
    headerId
  };
};

export const addHeader = (header) => {
    return {
        type: 'addHeader',
        header
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

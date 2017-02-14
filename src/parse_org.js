const TODO_KEYWORDS = ['TODO', 'DONE'];

const newHeaderWithTitle = (titleLine, parentId = []) => {
  const todoKeyword = TODO_KEYWORDS.filter(keyword => titleLine.startsWith(keyword))[0];
  let title = titleLine;
  if (todoKeyword) {
    title = title.substr(todoKeyword.length + 1);
  }

  return {
    titleLine: {
      title, todoKeyword
    },
    subheaders: [],
    description: '',
    opened: false,
    id: [...parentId, Math.random()]
  };
};

const addDescriptionToLastHeader = (header, description) => {
  if (header.subheaders.length === 0) {
    // Description belongs to this header.
    header.description += description + '\n';
  } else {
    addDescriptionToLastHeader(header.subheaders[header.subheaders.length - 1], description);
  }
};

const insertHeaderWithNestingLevel = (parentHeader, nestingLevel, title) => {
  if (nestingLevel === 2) {
    parentHeader.subheaders.push(newHeaderWithTitle(title, parentHeader.id));
  } else if (nestingLevel > 2) {
    if (parentHeader.subheaders.length === 0) {
      parentHeader.subheaders.push(newHeaderWithTitle('', parentHeader.id));
    }
    let lastSubheader = parentHeader.subheaders[parentHeader.subheaders.length - 1];
    insertHeaderWithNestingLevel(lastSubheader, nestingLevel - 1, title);
  } else {
    console.error('Something went wrng inserting a header with nesting level...');
  }
};

const parseOrg = (fileContents) => {
  let headers = [];

  const lines = fileContents.split('\n');

  lines.forEach(line => {
    if (line.startsWith('* ')) {
      // Top level header.
      headers.push(newHeaderWithTitle(line.substr(2)));
    } else if (line.startsWith('*')) {
      // Subheader.
      const nestingLevel = line.indexOf(' ');
      const title = line.substr(nestingLevel + 1);
      // TODO: handle case where there is no space in the line.

      if (headers.length === 0) {
        headers.push(newHeaderWithTitle(''));
      }
      let lastHeader = headers[headers.length - 1];
      insertHeaderWithNestingLevel(lastHeader, nestingLevel, title);
    } else {
      if (headers.length > 0) {
        let lastHeader = headers[headers.length - 1];
        if (lastHeader) {
          addDescriptionToLastHeader(lastHeader, line);
        }
      }
    }
  });

  return headers;
};

export default parseOrg;

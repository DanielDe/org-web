const TODO_KEYWORDS = ['TODO', 'DONE'];

const newHeaderWithTitle = (titleLine) => {
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
    content: ''
  };
};

const addContentToLastHeader = (header, content) => {
  if (header.subheaders.length === 0) {
    // Content belongs to this header.
    header.content += content + '\n';
  } else {
    addContentToLastHeader(header.subheaders[header.subheaders.length - 1], content);
  }
};

const insertHeaderWithNestingLevel = (parentHeader, nestingLevel, title) => {
  if (nestingLevel === 2) {
    parentHeader.subheaders.push(newHeaderWithTitle(title));
  } else if (nestingLevel > 2) {
    if (parentHeader.subheaders.length === 0) {
      parentHeader.subheaders.push(newHeaderWithTitle(''));
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
      let lastHeader = headers[headers.length - 1];
      if (lastHeader) {
        addContentToLastHeader(lastHeader, line);
      }
    }
  });

  return headers;
};

export default parseOrg;

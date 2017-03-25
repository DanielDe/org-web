export const TODO_KEYWORDS = ['TODO', 'DONE'];

export const newHeaderWithTitle = (titleLine, nestingLevel) => {
  const todoKeyword = TODO_KEYWORDS.filter(keyword => titleLine.startsWith(keyword))[0];
  let title = titleLine;
  if (todoKeyword) {
    title = title.substr(todoKeyword.length + 1);
  }

  return {
    titleLine: {
      title, todoKeyword
    },
    description: '',
    opened: false,
    id: Math.random(),
    nestingLevel
  };
};

const parseOrg = (fileContents) => {
  let headers = [];
  const lines = fileContents.split('\n');

  lines.forEach(line => {
    if (line.startsWith('*')) {
      // TODO: handle the case where there's no space at the end of the line
      const nestingLevel = line.indexOf(' ');
      const title = line.substr(nestingLevel + 1);
      headers.push(newHeaderWithTitle(title, nestingLevel));
    } else {
      if (headers.length === 0) {
        return;
      }

      const lastHeader = headers[headers.length - 1];
      lastHeader.description += '\n' + line;
    }
  });

  return headers;
};

export default parseOrg;

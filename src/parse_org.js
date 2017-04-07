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
    rawDescription: '',
    description: [],
    opened: false,
    id: Math.random(),
    nestingLevel
  };
};

// Accepts a raw string description and returns a list of objects representing it.
export const parseDescription = (description) => {
  // Match strings containing either [[uri]] or [[uri][title]].
  const linkRegex = /(\[\[([^\]]*)\]\]|\[\[([^\]]*)\]\[([^\]]*)\]\])/g;
  let matches = [];
  let match = linkRegex.exec(description);
  while (match) {
    if (match[2]) {
      matches.push({
        rawText: match[0],
        uri: match[2],
        index: match.index
      });
    } else {
      matches.push({
        rawText: match[0],
        uri: match[3],
        title: match[4],
        index: match.index
      });
    }
    match = linkRegex.exec(description);
  }

  let descriptionParts = [];
  let startIndex = 0;
  matches.forEach(match => {
    let index = match.index;

    // Add the text part before this link if necessary
    if (index !== startIndex) {
      const text = description.substring(startIndex, index);
      descriptionParts.push({
        type: 'text',
        contents: text
      });
    }

    // Add the link part.
    let linkPart = {
      type: 'link',
      contents: {
        uri: match.uri
      }
    };
    if (match.title) {
      linkPart.contents.title = match.title;
    }
    descriptionParts.push(linkPart);

    // Adjust the start index.
    startIndex = match.index + match.rawText.length;
  });

  // Add on any trailing text if necessary.
  if (startIndex !== description.length) {
    const text = description.substring(startIndex, description.length);
    descriptionParts.push({
      type: 'text',
      contents: text
    });
  }

  return descriptionParts;
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
      lastHeader.rawDescription += '\n' + line;
    }
  });

  headers.forEach(header => {
    header.description = parseDescription(header.rawDescription);
  });

  return headers;
};

export default parseOrg;

// Accepts a raw string description and returns a list of objects representing it.
export const parseLinks = (description) => {
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

export const newHeaderWithTitle = (titleLine, nestingLevel, todoKeywordSets) => {
  const allKeywords = [].concat.apply([], todoKeywordSets.map(todoKeywordSet => {
    return todoKeywordSet.keywords;
  }));
  const todoKeyword = allKeywords.filter(keyword => titleLine.startsWith(keyword))[0];
  let rawTitle = titleLine;
  if (todoKeyword) {
    rawTitle = rawTitle.substr(todoKeyword.length + 1);
  }
  const title = parseLinks(rawTitle);

  return {
    titleLine: {
      title, rawTitle, todoKeyword
    },
    rawDescription: '',
    description: [],
    opened: false,
    id: Math.random(),
    nestingLevel
  };
};

const parseOrg = (fileContents) => {
  let headers = [];
  const lines = fileContents.split('\n');

  let todoKeywordSets = [];

  lines.forEach(line => {
    if (line.startsWith('*')) {
      let nestingLevel = line.indexOf(' ');
      if (nestingLevel === -1) {
        nestingLevel = line.length;
      }
      const title = line.substr(nestingLevel + 1);
      headers.push(newHeaderWithTitle(title, nestingLevel, todoKeywordSets));
    } else {
      if (headers.length === 0) {
        if (line.startsWith('#+TODO: ') || line.startsWith('#+TYP_TODO: ')) {
          const keywordsString = line.substr(line.indexOf(':') + 2);
          const keywordStrings = keywordsString.split(/\s/).filter(keyword => {
            return keyword !== '|';
          });
          const keywords = keywordStrings.map(keywordString => {
            const todoRegex = /([^\(]*)(\(.*\))?/g;
            const match = todoRegex.exec(keywordString);
            const keyword = match[1];

            return keyword;
          });
          todoKeywordSets.push({
            keywords,
            configLine: line,
            default: false
          });
        }
      } else {
        const lastHeader = headers[headers.length - 1];
        lastHeader.rawDescription += '\n' + line;
      }
    }
  });

  const defaultTodoKeywords = ['TODO', 'DONE'];
  if (todoKeywordSets.length === 0) {
    todoKeywordSets = [{
      keywords: defaultTodoKeywords,
      default: true
    }];
  }

  headers.forEach(header => {
    header.description = parseLinks(header.rawDescription);
  });

  return {
    headers, todoKeywordSets
  };
};

export default parseOrg;

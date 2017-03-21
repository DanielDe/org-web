const exportHeader = (header, nestingLevel = 0) => {
  let contents = '';

  if (!header.empty) {
    contents += '*'.repeat(nestingLevel + 1);

    if (header.titleLine.todoKeyword) {
      contents += ` ${header.titleLine.todoKeyword}`;
    }
    contents += ` ${header.titleLine.title}`;

    if (header.description) {
      contents += '\n' + header.description;
    }
  }

  if (header.subheaders.length > 0) {
    contents += (header.empty ? '' : '\n') + header.subheaders.map(subheader => {
      return exportHeader(subheader, nestingLevel + 1);
    }).join('\n');
  }

  return contents;
};

const exportOrg = (headers) => {
  return headers.map(header => exportHeader(header.toJS())).join('\n');
};

export default exportOrg;

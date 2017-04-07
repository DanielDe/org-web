const exportOrg = (headers) => {
  return headers.toJS().map(header => {
    let contents = '';
    contents += '*'.repeat(header.nestingLevel);

    if (header.titleLine.todoKeyword) {
      contents += ` ${header.titleLine.todoKeyword}`;
    }
    contents += ` ${header.titleLine.title}`;

    if (header.description) {
      contents += header.rawDescription;
    }

    return contents;
  }).join('\n');
};

export default exportOrg;

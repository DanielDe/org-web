import generateId from './id_generator';

import { List, fromJS } from 'immutable';

export const indexOfHeaderWithId = (headers, headerId) => {
  return headers.findIndex(header => header.get('id') === headerId);
};

export const headerWithId = (headers, headerId) => {
  return headers.get(indexOfHeaderWithId(headers, headerId));
};

export const subheadersOfHeaderWithId = (headers, headerId) => {
  const header = headerWithId(headers, headerId);
  const headerIndex = indexOfHeaderWithId(headers, headerId);

  const afterHeaders = headers.slice(headerIndex + 1);
  const nextSiblingHeaderIndex = afterHeaders.findIndex(siblingHeader => {
    return siblingHeader.get('nestingLevel') <= header.get('nestingLevel');
  });

  if (nextSiblingHeaderIndex === -1) {
    return afterHeaders;
  } else {
    return afterHeaders.slice(0, nextSiblingHeaderIndex);
  }
};

export const numSubheadersOfHeaderWithId = (headers, headerId) =>
  subheadersOfHeaderWithId(headers, headerId).size;

export const directParentIdOfHeaderWithId = (headers, headerId) => {
  const header = headerWithId(headers, headerId);
  const headerIndex = indexOfHeaderWithId(headers, headerId);

  for (let i = headerIndex - 1; i >= 0; --i) {
    const previousHeader = headers.get(i);

    if (previousHeader.get('nestingLevel') === header.get('nestingLevel') - 1) {
      return previousHeader.get('id');
    }

    if (previousHeader.get('nestingLevel') < header.get('nestingLevel')) {
      return null;
    }
  }

  return null;
};

export const parentIdOfHeaderWithId = (headers, headerId) => {
  const header = headerWithId(headers, headerId);
  const headerIndex = indexOfHeaderWithId(headers, headerId);

  const previousHeaders = headers.slice(0, headerIndex).reverse();
  const parentHeader = previousHeaders.find(
    previousHeader => previousHeader.get('nestingLevel') < header.get('nestingLevel')
  );

  if (!parentHeader) {
    return null;
  }

  return parentHeader.get('id');
};

export const indexOfPreviousSibling = (headers, headerIndex) => {
  const nestingLevel = headers.getIn([headerIndex, 'nestingLevel']);

  for (let i = headerIndex - 1; i >= 0; --i) {
    const header = headers.get(i);

    if (header.get('nestingLevel') < nestingLevel) {
      return null;
    }

    if (header.get('nestingLevel') === nestingLevel) {
      return i;
    }
  }

  return null;
};

const isHeaderVisible = (headers, headerId) => {
  const parentHeaderId = parentIdOfHeaderWithId(headers, headerId);
  if (!parentHeaderId) {
    return true;
  }

  const parentHeader = headerWithId(headers, parentHeaderId);
  return parentHeader.get('opened') && isHeaderVisible(headers, parentHeader.get('id'));
};

export const nextVisibleHeaderAfterIndex = (headers, headerIndex) => {
  const followingHeaders = headers.slice(headerIndex + 1);
  return followingHeaders.find(header => isHeaderVisible(headers, header.get('id')));
};

export const previousVisibleHeaderAfterIndex = (headers, headerIndex) => {
  const previousHeaders = headers.slice(0, headerIndex).reverse();
  return previousHeaders.find(header => isHeaderVisible(headers, header.get('id')));
};

export const openDirectParent = (state, headerId) => {
  const parentHeaderId = directParentIdOfHeaderWithId(state.get('headers'), headerId);
  if (parentHeaderId !== null) {
    const parentHeaderIndex = indexOfHeaderWithId(state.get('headers'), parentHeaderId);
    state = state.setIn(['headers', parentHeaderIndex, 'opened'], true);
  }

  return state;
};

export const getOpenHeaderPaths = headers => {
  let openedHeaders = [];
  for (let i = 0; i < headers.size; ++i) {
    const header = headers.get(i);
    if (!header.get('opened')) {
      continue;
    }

    const title = header.getIn(['titleLine', 'rawTitle']);

    const subheaders = subheadersOfHeaderWithId(headers, header.get('id'));
    const openSubheaderPaths = getOpenHeaderPaths(subheaders);

    if (openSubheaderPaths.length > 0) {
      openSubheaderPaths.forEach(openedSubheaderPath => {
        openedHeaders.push([title].concat(openedSubheaderPath));
      });
    } else {
      openedHeaders.push([title]);
    }

    i += subheaders.size;
  }

  return openedHeaders;
};

export const headerWithPath = (headers, headerPath) => {
  if (headerPath.size === 0) {
    return null;
  }

  const firstHeader = headers.find(
    header =>
      parentIdOfHeaderWithId(headers, header.get('id')) === null &&
      header.getIn(['titleLine', 'rawTitle']).trim() === headerPath.first().trim()
  );
  if (!firstHeader) {
    return null;
  }

  if (headerPath.size === 1) {
    return firstHeader;
  }

  const subheaders = subheadersOfHeaderWithId(headers, firstHeader.get('id'));
  return headerWithPath(subheaders, headerPath.skip(1));
};

export const openHeaderWithPath = (headers, headerPath, maxNestingLevel = 1) => {
  if (headerPath.size === 0) {
    return headers;
  }

  const firstTitle = headerPath.first();
  const headerIndex = headers.findIndex(header => {
    const rawTitle = header.getIn(['titleLine', 'rawTitle']);
    const nestingLevel = header.get('nestingLevel');
    return rawTitle === firstTitle && nestingLevel <= maxNestingLevel;
  });
  if (headerIndex === -1) {
    return headers;
  }

  headers = headers.update(headerIndex, header => header.set('opened', true));

  let subheaders = subheadersOfHeaderWithId(headers, headers.getIn([headerIndex, 'id']));
  subheaders = openHeaderWithPath(subheaders, headerPath.rest(), maxNestingLevel + 1);

  headers = headers
    .take(headerIndex + 1)
    .concat(subheaders)
    .concat(headers.takeLast(headers.size - (headerIndex + 1 + subheaders.size)));

  return headers;
};

const tablePartContainsCellId = (tablePart, cellId) =>
  tablePart
    .get('contents')
    .some(row => row.get('contents').some(cell => cell.get('id') === cellId));

const doesAttributedStringContainTableCellId = (parts, cellId) =>
  parts
    .filter(part => ['table', 'list'].includes(part.get('type')))
    .some(
      part =>
        part.get('type') === 'table'
          ? tablePartContainsCellId(part, cellId)
          : part
              .get('items')
              .some(item => doesAttributedStringContainTableCellId(item.get('contents'), cellId))
    );

export const headerThatContainsTableCellId = (headers, cellId) =>
  headers.find(header => doesAttributedStringContainTableCellId(header.get('description'), cellId));

export const pathAndPartOfTimestampItemWithIdInAttributedString = (parts, timestampId) =>
  parts
    .map((part, partIndex) => {
      if (part.get('type') === 'timestamp' && part.get('id') === timestampId) {
        return {
          path: [partIndex],
          timestampPart: part,
        };
      } else if (part.get('type') === 'list') {
        return part
          .get('items')
          .map((item, itemIndex) => {
            let pathAndPart = pathAndPartOfTimestampItemWithIdInAttributedString(
              item.get('contents'),
              timestampId
            );
            if (!!pathAndPart) {
              const { path, timestampPart } = pathAndPart;
              return {
                path: [partIndex, 'items', itemIndex, 'contents'].concat(path),
                timestampPart,
              };
            } else {
              let pathAndPart = pathAndPartOfTimestampItemWithIdInAttributedString(
                item.get('titleLine'),
                timestampId
              );
              if (!!pathAndPart) {
                const { path, timestampPart } = pathAndPart;
                return {
                  path: [partIndex, 'items', itemIndex, 'titleLine'].concat(path),
                  timestampPart,
                };
              } else {
                return null;
              }
            }
          })
          .filter(result => !!result)
          .first();
      } else if (part.get('type') === 'table') {
        return part
          .get('contents')
          .map((row, rowIndex) => {
            return row
              .get('contents')
              .map((cell, cellIndex) => {
                const pathAndPart = pathAndPartOfTimestampItemWithIdInAttributedString(
                  cell.get('contents'),
                  timestampId
                );
                if (!!pathAndPart) {
                  const { path, timestampPart } = pathAndPart;
                  return {
                    path: [
                      partIndex,
                      'contents',
                      rowIndex,
                      'contents',
                      cellIndex,
                      'contents',
                    ].concat(path),
                    timestampPart,
                  };
                } else {
                  return null;
                }
              })
              .filter(result => !!result)
              .first();
          })
          .filter(result => !!result)
          .first();
      } else {
        return null;
      }
    })
    .filter(result => !!result)
    .first();

const listPartContainsItemId = (listPart, itemId) =>
  listPart.get('items').some(item => item.get('id') === itemId);

export const headerThatContainsListItemId = (headers, listItemId) => {
  const pathAndPart = pathAndPartOfListItemWithIdInHeaders(headers, listItemId);
  const headerIndex = pathAndPart.path[0];
  return headers.get(headerIndex);
};

export const pathAndPartOfListItemWithIdInAttributedString = (parts, listItemId) =>
  parts
    .map((part, partIndex) => {
      if (part.get('type') === 'list') {
        return part
          .get('items')
          .map((item, itemIndex) => {
            if (item.get('id') === listItemId) {
              return {
                path: [partIndex, 'items', itemIndex],
                listItemPart: item,
              };
            } else {
              const pathAndPart = pathAndPartOfListItemWithIdInAttributedString(
                item.get('contents'),
                listItemId
              );
              if (!!pathAndPart) {
                const { path, listItemPart } = pathAndPart;
                return {
                  path: [partIndex, 'items', itemIndex, 'contents'].concat(path),
                  listItemPart,
                };
              } else {
                return null;
              }
            }
          })
          .filter(result => !!result)
          .first();
      } else {
        return null;
      }
    })
    .filter(result => !!result)
    .first();

export const pathAndPartOfTableContainingCellIdInAttributedString = (parts, cellId) =>
  parts
    .map((part, partIndex) => {
      if (part.get('type') === 'table') {
        if (tablePartContainsCellId(part, cellId)) {
          return { path: [partIndex], tablePart: part };
        } else {
          return null;
        }
      } else if (part.get('type') === 'list') {
        return part
          .get('items')
          .map((item, itemIndex) => {
            const pathAndPart = pathAndPartOfTableContainingCellIdInAttributedString(
              item.get('contents'),
              cellId
            );
            if (!!pathAndPart) {
              const { path, tablePart } = pathAndPart;
              return {
                path: [partIndex, 'items', itemIndex, 'contents'].concat(path),
                tablePart,
              };
            } else {
              return null;
            }
          })
          .filter(result => !!result)
          .first();
      } else {
        return null;
      }
    })
    .filter(result => !!result)
    .first();

export const pathAndPartOfListContainingItemIdInHeaders = (headers, itemId) =>
  headers
    .map((header, headerIndex) => {
      const pathAndPart = pathAndPartOfListContainingItemIdInAttributedString(
        header.get('description'),
        itemId
      );
      if (!pathAndPart) {
        return null;
      }

      const { path, listPart } = pathAndPart;
      return {
        path: [headerIndex, 'description'].concat(path),
        listPart,
      };
    })
    .filter(result => !!result)
    .first();

export const pathAndPartOfListContainingItemIdInAttributedString = (parts, itemId) =>
  parts
    .map((part, partIndex) => {
      if (part.get('type') === 'list') {
        if (listPartContainsItemId(part, itemId)) {
          return { path: [partIndex], listPart: part };
        } else {
          return part
            .get('items')
            .map((item, itemIndex) => {
              const pathAndPart = pathAndPartOfListContainingItemIdInAttributedString(
                item.get('contents'),
                itemId
              );
              if (!!pathAndPart) {
                const { path, listPart } = pathAndPart;
                return {
                  path: [partIndex, 'items', itemIndex, 'contents'].concat(path),
                  listPart,
                };
              } else {
                return null;
              }
            })
            .filter(result => !!result)
            .first();
        }
      } else {
        return null;
      }
    })
    .filter(result => !!result)
    .first();

export const pathAndPartOfTimestampItemWithIdInHeaders = (headers, timestampId) =>
  headers
    .map((header, headerIndex) => {
      let pathAndPart = pathAndPartOfTimestampItemWithIdInAttributedString(
        header.getIn(['titleLine', 'title']),
        timestampId
      );
      if (!!pathAndPart) {
        const { path, timestampPart } = pathAndPart;
        return {
          path: [headerIndex, 'titleLine', 'title'].concat(path),
          timestampPart,
        };
      }

      pathAndPart = pathAndPartOfTimestampItemWithIdInAttributedString(
        header.get('description'),
        timestampId
      );
      if (!!pathAndPart) {
        const { path, timestampPart } = pathAndPart;
        return {
          path: [headerIndex, 'description'].concat(path),
          timestampPart,
        };
      }

      pathAndPart = header
        .get('propertyListItems')
        .map((propertyListItem, propertyListItemIndex) => {
          if (!propertyListItem.get('value')) {
            return null;
          }

          const plistPathAndPart = pathAndPartOfTimestampItemWithIdInAttributedString(
            propertyListItem.get('value'),
            timestampId
          );
          if (!!plistPathAndPart) {
            const { path, timestampPart } = plistPathAndPart;
            return {
              path: [headerIndex, 'propertyListItems', propertyListItemIndex, 'value'].concat(path),
              timestampPart,
            };
          }

          return null;
        })
        .filter(result => !!result)
        .first();
      if (!!pathAndPart) {
        return pathAndPart;
      }

      return null;
    })
    .filter(result => !!result)
    .first();

export const pathAndPartOfListItemWithIdInHeaders = (headers, listItemId) =>
  headers
    .map((header, headerIndex) => {
      const pathAndPart = pathAndPartOfListItemWithIdInAttributedString(
        header.get('description'),
        listItemId
      );
      if (!pathAndPart) {
        return null;
      }

      const { path, listItemPart } = pathAndPart;
      return {
        path: [headerIndex, 'description'].concat(path),
        listItemPart,
      };
    })
    .filter(result => !!result)
    .first();

export const pathAndPartOfTableContainingCellIdInHeaders = (headers, cellId) =>
  headers
    .map((header, headerIndex) => {
      const pathAndPart = pathAndPartOfTableContainingCellIdInAttributedString(
        header.get('description'),
        cellId
      );
      if (!pathAndPart) {
        return null;
      }

      const { path, tablePart } = pathAndPart;
      return {
        path: [headerIndex, 'description'].concat(path),
        tablePart,
      };
    })
    .filter(result => !!result)
    .first();

export const updateTableContainingCellId = (headers, cellId, updaterCallbackGenerator) => {
  const { path, tablePart } = pathAndPartOfTableContainingCellIdInHeaders(headers, cellId);

  const rowIndexContainingCellId = tablePart
    .get('contents')
    .findIndex(row => row.get('contents').some(cell => cell.get('id') === cellId));
  const columnIndexContainingCellId = tablePart
    .getIn(['contents', rowIndexContainingCellId, 'contents'])
    .findIndex(cell => cell.get('id') === cellId);

  return headers.updateIn(
    path.concat(['contents']),
    updaterCallbackGenerator(rowIndexContainingCellId, columnIndexContainingCellId)
  );
};

export const newEmptyTableRowLikeRows = rows =>
  rows
    .get(0)
    .set('id', generateId())
    .update('contents', contents =>
      contents.map(cell =>
        cell
          .set('id', generateId())
          .set('contents', new List())
          .set('rawContents', '')
      )
    );

export const newEmptyTableCell = () =>
  fromJS({
    id: generateId(),
    contents: [],
    rawContents: '',
  });

export const newListPart = () =>
  fromJS({
    type: 'list',
    id: generateId(),
    items: [],
    bulletCharacter: '-',
    numberTerminatorCharacter: null,
    isOrdered: false,
  });

export const newListPartLikePart = part => part.set('id', generateId()).set('items', new List());

export const newListItem = () =>
  fromJS({
    id: generateId(),
    titleLine: [],
    contents: [],
    forceNumber: null,
    isCheckbox: false,
  });

export const parentListItemWithIdInHeaders = (headers, listItemId) => {
  const pathAndPart = pathAndPartOfListItemWithIdInHeaders(headers, listItemId);
  let { path } = pathAndPart;
  return headers.getIn(path.slice(0, path.length - 4));
};

export const updateListContainingListItemId = (headers, listItemId, updaterCallbackGenerator) => {
  const { path, listPart } = pathAndPartOfListContainingItemIdInHeaders(headers, listItemId);

  const itemIndexContainingId = listPart
    .get('items')
    .findIndex(item => item.get('id') === listItemId);

  return headers.updateIn(path.concat(['items']), updaterCallbackGenerator(itemIndexContainingId));
};

export const updateContentsWithListItemAddition = (parts, listItem, listPart = null) => {
  if ((parts.size === 0) || (parts.last().get('type') !== 'list')) {
    const insertIdx = parts.size;
    if (!!listPart) {
      parts = parts.insert(insertIdx, newListPartLikePart(listPart));
    } else {
      parts = parts.insert(insertIdx, newListPart());
    }
  }

  return parts.map(part => {
    switch (part.get('type')) {
      case 'list':
        return part.update('items', items => items.push(listItem));
      default:
        return part;
    }
  });
};

export const timestampWithIdInAttributedString = (parts, timestampId) => {
  if (!parts) {
    return null;
  }

  const pathAndPart = pathAndPartOfTimestampItemWithIdInAttributedString(parts, timestampId);
  if (!!pathAndPart) {
    return pathAndPart.timestampPart;
  } else {
    return null;
  }
};

export const timestampWithId = (headers, timestampId) =>
  headers
    .map(
      header =>
        timestampWithIdInAttributedString(header.getIn(['titleLine', 'title']), timestampId) ||
        timestampWithIdInAttributedString(header.get('description'), timestampId) ||
        header
          .get('propertyListItems')
          .map(propertyListItem =>
            timestampWithIdInAttributedString(propertyListItem.get('value'), timestampId)
          )
          .filter(result => !!result)
          .first()
    )
    .find(result => !!result);

export const todoKeywordSetForKeyword = (todoKeywordSets, keyword) =>
  todoKeywordSets.find(keywordSet => keywordSet.get('keywords').contains(keyword)) ||
  todoKeywordSets.first();

export const isTodoKeywordCompleted = (todoKeywordSets, keyword) =>
  todoKeywordSetForKeyword(todoKeywordSets, keyword)
    .get('completedKeywords')
    .includes(keyword);

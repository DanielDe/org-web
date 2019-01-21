import generateId from './id_generator';

import { List, fromJS } from 'immutable';

import {
  AttributedString,
  ASTablePart,
  ASTablePartRow,
  makeTablePartCell,
  ASListPart,
  ASListPartItem,
  ASTimestampRangePart,
} from '../types/attributed_string';
import { Header } from '../types/header';
import { OrgState } from '../types/org_state';
import { TodoKeywordSet } from '../types/todo_keyword_set';

export const indexOfHeaderWithId = (headers: List<Header>, headerId: number) =>
  headers.findIndex(header => header.id === headerId);

export const headerWithId = (headers: List<Header>, headerId: number) =>
  headers.get(indexOfHeaderWithId(headers, headerId));

export const subheadersOfHeaderWithId = (headers: List<Header>, headerId: number): List<Header> => {
  const header = headerWithId(headers, headerId);
  if (!header) {
    return List();
  }

  const headerIndex = indexOfHeaderWithId(headers, headerId);

  const afterHeaders = headers.slice(headerIndex + 1);
  const nextSiblingHeaderIndex = afterHeaders.findIndex(
    siblingHeader => siblingHeader.nestingLevel <= header.nestingLevel
  );

  if (nextSiblingHeaderIndex === -1) {
    return afterHeaders;
  } else {
    return afterHeaders.slice(0, nextSiblingHeaderIndex);
  }
};

export const numSubheadersOfHeaderWithId = (headers: List<Header>, headerId: number) =>
  subheadersOfHeaderWithId(headers, headerId).size;

export const directParentIdOfHeaderWithId = (headers: List<Header>, headerId: number) => {
  const header = headerWithId(headers, headerId);
  if (!header) {
    return null;
  }

  const headerIndex = indexOfHeaderWithId(headers, headerId);

  for (let i = headerIndex - 1; i >= 0; --i) {
    const previousHeader = headers.get(i);
    if (!previousHeader) {
      return null;
    }

    if (previousHeader.nestingLevel === header.nestingLevel - 1) {
      return previousHeader.id;
    }

    if (previousHeader.nestingLevel < header.nestingLevel) {
      return null;
    }
  }

  return null;
};

export const parentIdOfHeaderWithId = (headers: List<Header>, headerId: number) => {
  const header = headerWithId(headers, headerId);
  if (!header) {
    return null;
  }

  const headerIndex = indexOfHeaderWithId(headers, headerId);

  const previousHeaders = headers.slice(0, headerIndex).reverse();
  const parentHeader = previousHeaders.find(
    previousHeader => previousHeader.nestingLevel < header.nestingLevel
  );

  if (!parentHeader) {
    return null;
  }

  return parentHeader.id;
};

export const indexOfPreviousSibling = (headers: List<Header>, headerIndex: number) => {
  const nestingLevel = headers.getIn([headerIndex, 'nestingLevel']);

  for (let i = headerIndex - 1; i >= 0; --i) {
    const header = headers.get(i);
    if (!header) {
      return null;
    }

    if (header.nestingLevel < nestingLevel) {
      return null;
    }

    if (header.nestingLevel === nestingLevel) {
      return i;
    }
  }

  return null;
};

const isHeaderVisible = (headers: List<Header>, headerId: number): boolean => {
  const parentHeaderId = parentIdOfHeaderWithId(headers, headerId);
  if (!parentHeaderId) {
    return true;
  }

  const parentHeader = headerWithId(headers, parentHeaderId);
  if (!parentHeader) {
    return false;
  }

  return parentHeader.opened && isHeaderVisible(headers, parentHeader.id);
};

export const nextVisibleHeaderAfterIndex = (
  headers: List<Header>,
  headerIndex: number
): Header | null =>
  headers.slice(headerIndex + 1).find(header => isHeaderVisible(headers, header.id)) || null;

export const previousVisibleHeaderAfterIndex = (
  headers: List<Header>,
  headerIndex: number
): Header | null =>
  headers
    .slice(0, headerIndex)
    .reverse()
    .find(header => isHeaderVisible(headers, header.id)) || null;

export const openDirectParent = (state: OrgState, headerId: number) => {
  const parentHeaderId = directParentIdOfHeaderWithId(state.get('headers'), headerId);
  if (parentHeaderId !== null) {
    const parentHeaderIndex = indexOfHeaderWithId(state.get('headers'), parentHeaderId);
    state = state.setIn(['headers', parentHeaderIndex, 'opened'], true);
  }

  return state;
};

export const getOpenHeaderPaths = (headers: List<Header>) => {
  let openedHeaders = [];
  for (let i = 0; i < headers.size; ++i) {
    const header = headers.get(i);
    if (!header || !header.opened) {
      continue;
    }

    const title = header.titleLine.rawTitle;

    const subheaders = subheadersOfHeaderWithId(headers, header.id);
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

export const headerWithPath = (headers: List<Header>, headerPath: List<string>): Header | null => {
  if (headerPath.size === 0) {
    return null;
  }

  const firstHeader = headers.find(
    header =>
      parentIdOfHeaderWithId(headers, header.id) === null &&
      header.titleLine.rawTitle.trim() === headerPath.first('').trim()
  );
  if (!firstHeader) {
    return null;
  }

  if (headerPath.size === 1) {
    return firstHeader;
  }

  const subheaders = subheadersOfHeaderWithId(headers, firstHeader.id);
  return headerWithPath(subheaders, headerPath.skip(1));
};

export const openHeaderWithPath = (
  headers: List<Header>,
  headerPath: List<string>,
  maxNestingLevel = 1
) => {
  if (headerPath.size === 0) {
    return headers;
  }

  const firstTitle = headerPath.first(null);
  const headerIndex = headers.findIndex(header => {
    const rawTitle = header.titleLine.rawTitle;
    const nestingLevel = header.nestingLevel;
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

const tablePartContainsCellId = (tablePart: ASTablePart, cellId: number) =>
  tablePart.contents.some(row => row.contents.some(cell => cell.id === cellId));

const doesAttributedStringContainTableCellId = (
  attributedString: AttributedString,
  cellId: number
): boolean =>
  attributedString
    .filter(part => ['table', 'list'].includes(part.type))
    .some(
      part =>
        part.type === 'table'
          ? tablePartContainsCellId(part, cellId)
          : (part as ASListPart).items.some(item =>
            doesAttributedStringContainTableCellId(item.contents, cellId)
          )
    );

export const headerThatContainsTableCellId = (headers: List<Header>, cellId: number) =>
  headers.find(header => doesAttributedStringContainTableCellId(header.description, cellId)) ||
  null;

export const pathAndPartOfTimestampItemWithIdInAttributedString = (
  attributedString: AttributedString,
  timestampId: number
): { path: (string | number)[]; timestampPart: ASTimestampRangePart } | null =>
  attributedString
    .map((part, partIndex) => {
      if (part.type === 'timestamp-range' && part.id === timestampId) {
        return {
          path: [partIndex],
          timestampPart: part,
        };
      } else if (part.type === 'list') {
        return part.items
          .map((item, itemIndex) => {
            let pathAndPart = pathAndPartOfTimestampItemWithIdInAttributedString(
              item.contents,
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
                item.titleLine,
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
          .first(null);
      } else if (part.type === 'table') {
        return part.contents
          .map((row, rowIndex) => {
            return row.contents
              .map((cell, cellIndex) => {
                const pathAndPart = pathAndPartOfTimestampItemWithIdInAttributedString(
                  cell.contents,
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
              .first(null);
          })
          .filter(result => !!result)
          .first(null);
      } else {
        return null;
      }
    })
    .filter(result => !!result)
    .first(null);

export const pathAndPartOfListItemWithIdInAttributedString = (
  atttributedString: AttributedString,
  listItemId: number
): { path: (string | number)[]; listItemPart: ASListPartItem } | null =>
  atttributedString
    .map((part, partIndex) => {
      if (part.type === 'list') {
        return part.items
          .map((item, itemIndex) => {
            if (item.id === listItemId) {
              return {
                path: [partIndex, 'items', itemIndex],
                listItemPart: item,
              };
            } else {
              const pathAndPart = pathAndPartOfListItemWithIdInAttributedString(
                item.contents,
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
          .first(null);
      } else {
        return null;
      }
    })
    .filter(result => !!result)
    .first(null);

export const pathAndPartOfTableContainingCellIdInAttributedString = (
  attributedString: AttributedString,
  cellId: number
): { path: (string | number)[]; tablePart: ASTablePart } | null =>
  attributedString
    .map((part, partIndex) => {
      if (part.type === 'table') {
        if (tablePartContainsCellId(part, cellId)) {
          return { path: [partIndex], tablePart: part };
        } else {
          return null;
        }
      } else if (part.type === 'list') {
        return part.items
          .map((item, itemIndex) => {
            const pathAndPart = pathAndPartOfTableContainingCellIdInAttributedString(
              item.contents,
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
          .first(null);
      } else {
        return null;
      }
    })
    .filter(result => !!result)
    .first(null);

export const pathAndPartOfTimestampItemWithIdInHeaders = (
  headers: List<Header>,
  timestampId: number
): { path: (string | number)[]; timestampPart: ASTimestampRangePart } | null =>
  headers
    .map((header, headerIndex) => {
      let pathAndPart = pathAndPartOfTimestampItemWithIdInAttributedString(
        header.titleLine.title,
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
        header.description,
        timestampId
      );
      if (!!pathAndPart) {
        const { path, timestampPart } = pathAndPart;
        return {
          path: [headerIndex, 'description'].concat(path),
          timestampPart,
        };
      }

      pathAndPart = header.propertyListItems
        .map((propertyListItem, propertyListItemIndex) => {
          if (!propertyListItem.value) {
            return null;
          }

          const plistPathAndPart = pathAndPartOfTimestampItemWithIdInAttributedString(
            propertyListItem.value,
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
        .first(null);
      if (!!pathAndPart) {
        return pathAndPart;
      }

      return null;
    })
    .filter(result => !!result)
    .first(null);

export const pathAndPartOfListItemWithIdInHeaders = (
  headers: List<Header>,
  listItemId: number
): { path: (string | number)[]; listItemPart: ASListPartItem } | null =>
  headers
    .map((header, headerIndex) => {
      const pathAndPart = pathAndPartOfListItemWithIdInAttributedString(
        header.description,
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
    .first(null);

export const pathAndPartOfTableContainingCellIdInHeaders = (
  headers: List<Header>,
  cellId: number
): { path: (string | number)[]; tablePart: ASTablePart } | null =>
  headers
    .map((header, headerIndex) => {
      const pathAndPart = pathAndPartOfTableContainingCellIdInAttributedString(
        header.description,
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
    .first(null);

export const updateTableContainingCellId = (
  headers: List<Header>,
  cellId: number,
  updaterCallbackGenerator: (
    rowIndex: number,
    columnIndex?: number
  ) => (rows: List<ASTablePartRow>) => List<ASTablePartRow>
) => {
  const pathAndPart = pathAndPartOfTableContainingCellIdInHeaders(headers, cellId);
  if (!pathAndPart) {
    return null;
  }
  const { path, tablePart } = pathAndPart;

  const rowIndexContainingCellId = tablePart.contents.findIndex(row =>
    row.contents.some(cell => cell.id === cellId)
  );
  const row = tablePart.contents.get(rowIndexContainingCellId);
  if (!row) {
    return null;
  }
  const columnIndexContainingCellId = row.contents.findIndex(cell => cell.id === cellId);

  return headers.updateIn(
    path.concat(['contents']),
    updaterCallbackGenerator(rowIndexContainingCellId, columnIndexContainingCellId)
  );
};

export const newEmptyTableRowLikeRows = (rows: List<ASTablePartRow>) => {
  const firstRow = rows.get(0);
  if (!firstRow) {
    return null;
  }

  return firstRow.set('id', generateId()).update('contents', contents =>
    contents.map(cell =>
      cell
        .set('id', generateId())
        .set('contents', List())
        .set('rawContents', '')
    )
  );
};

export const newEmptyTableCell = () =>
  makeTablePartCell({
    id: generateId(),
    contents: List(),
    rawContents: '',
  });

export const timestampWithIdInAttributedString = (
  attributedString: AttributedString,
  timestampId: number
) => {
  if (!attributedString) {
    return null;
  }

  const pathAndPart = pathAndPartOfTimestampItemWithIdInAttributedString(
    attributedString,
    timestampId
  );
  if (!!pathAndPart) {
    return pathAndPart.timestampPart;
  } else {
    return null;
  }
};

export const timestampWithId = (headers: List<Header>, timestampId: number) =>
  headers
    .map(
      header =>
        timestampWithIdInAttributedString(header.titleLine.title, timestampId) ||
        timestampWithIdInAttributedString(header.description, timestampId) ||
        header.propertyListItems
          .map(propertyListItem =>
            timestampWithIdInAttributedString(propertyListItem.value, timestampId)
          )
          .filter(result => !!result)
          .first(null)
    )
    .find(result => !!result) || null;

export const todoKeywordSetForKeyword = (todoKeywordSets: List<TodoKeywordSet>, keyword: string) =>
  todoKeywordSets.find(keywordSet => keywordSet.keywords.includes(keyword)) ||
  todoKeywordSets.first(null);

export const isTodoKeywordCompleted = (todoKeywordSets: List<TodoKeywordSet>, keyword: string) => {
  const todoKeywordSet = todoKeywordSetForKeyword(todoKeywordSets, keyword);
  if (!todoKeywordSet) {
    return false;
  }

  return todoKeywordSet.completedKeywords.includes(keyword);
};

import _ from 'lodash';
import { List } from 'immutable';

import { renderAsText } from './timestamps';
import { convertRawAttributedStringToAttributedString } from './attributed_string';
import {
  AttributedString,
  ASPart,
  ASPartType,
  ASLinkPart,
  ASTablePartCell,
  ASTablePartRow,
  ASTablePart,
  ASListPart,
  ASListPartItem,
  ASTimestampRangePart,
} from '../types/attributed_string';
import { makeTimestamp, Timestamp } from '../types/timestamps';
import { TodoKeywordSet } from '../types/org';

const linkPartToRawText = (linkPart: ASLinkPart) =>
  !!linkPart.title ? `[[${linkPart.uri}][${linkPart.title}]]` : `[[${linkPart.uri}]]`;

const formattedAttributedStringText = (attributedString: AttributedString) =>
  attributedString
    .map(
      (part): string => {
        switch (part.type) {
          case 'text':
            return part.contents;
          case 'link':
            if (part.title) {
              return part.title;
            } else {
              return part.uri;
            }
          case 'percentage-cookie':
          case 'fraction-cookie':
          case 'table':
          case 'list':
          case 'inline-markup':
          case 'timestamp-range':
            return '';
        }
      }
    )
    .join('');

const tablePartToRawText = (tablePart: ASTablePart) => {
  const rowHeights = tablePart.contents
    .map(row =>
      Math.max(...row.contents.map(cell => (_.countBy(cell.rawContents)['\n'] || 0) + 1).toJS())
    )
    .toJS();

  const numColumns = tablePart.getIn(['contents', 0, 'contents']).size;
  const columnWidths = _.times(numColumns).map(columnIndex =>
    Math.max(
      ...tablePart.contents
        .map(row => {
          const content = row.getIn(['contents', columnIndex, 'contents']);
          const formattedText = formattedAttributedStringText(content);
          const lineLengths = formattedText.split('\n').map(line => line.trim().length);
          return Math.max(...lineLengths);
        })
        .toJS()
    )
  );

  const rowStrings = _.dropRight(
    _.flatten(
      tablePart.contents
        .map((row, rowIndex) => {
          const rowHeight = rowHeights[rowIndex];

          const contentRows = _.times(rowHeight)
            .map(lineIndex =>
              row.contents
                .map((cell, columnIndex) => {
                  const content = cell.get('contents');
                  const formattedText = formattedAttributedStringText(content);
                  const formattedLineLengths = formattedText
                    .split('\n')
                    .map(line => line.trim().length);
                  const line = (cell.get('rawContents').split('\n')[lineIndex] || '').trim();

                  const padCount = columnWidths[columnIndex] - formattedLineLengths[lineIndex];

                  return line + ' '.repeat(padCount);
                })
                .toJS()
                .join(' | ')
            )
            .map(contentRow => `| ${contentRow} |`);

          const separator =
            '|' + columnWidths.map(columnWidth => '-'.repeat(columnWidth + 2)).join('+') + '|';

          return contentRows.concat(separator);
        })
        .toJS()
    )
  );

  return rowStrings.join('\n');
};

const listPartToRawText = (listPart: ASListPart) => {
  const bulletCharacter = listPart.bulletCharacter;

  let previousNumber = 0;
  return listPart.items
    .map(item => {
      const optionalLeadingSpace = !listPart.isOrdered && bulletCharacter === '*' ? ' ' : '';

      const titleText = attributedStringToRawText(item.titleLine);

      const contentText = attributedStringToRawText(item.contents);
      const indentedContentText = contentText
        .split('\n')
        .map(line => (!!line.trim() ? `${optionalLeadingSpace}  ${line}` : ''))
        .join('\n');

      let listItemText = null;
      if (listPart.get('isOrdered')) {
        let number = ++previousNumber;
        let forceNumber = item.forceNumber;
        if (!!forceNumber) {
          number = forceNumber;
          previousNumber = number;
        }

        listItemText = `${number}${listPart.get('numberTerminatorCharacter')}`;

        if (!!forceNumber) {
          listItemText += ` [@${forceNumber}]`;
        }

        if (item.isCheckbox) {
          const stateCharacter = ({
            checked: 'X',
            unchecked: ' ',
            partial: '-',
          } as { [key: string]: string })[item.checkboxState];

          listItemText += ` [${stateCharacter}]`;
        }

        listItemText += ` ${titleText}`;
      } else {
        listItemText = `${optionalLeadingSpace}${bulletCharacter}`;

        if (item.isCheckbox) {
          const stateCharacter = ({
            checked: 'X',
            unchecked: ' ',
            partial: '-',
          } as { [key: string]: string })[item.checkboxState];

          listItemText += ` [${stateCharacter}]`;
        }

        listItemText += ` ${titleText}`;
      }

      if (!!contentText) {
        listItemText += `\n${indentedContentText}`;
      }

      return listItemText;
    })
    .join('\n');
};

const timestampRangePartToRawText = (part: ASTimestampRangePart) => {
  let text = renderAsText(part.firstTimestamp);
  if (part.secondTimestamp) {
    text += `--${renderAsText(part.secondTimestamp)}`;
  }

  return text;
};

export const attributedStringToRawText = (parts: AttributedString): string => {
  if (!parts) {
    return '';
  }

  const prevPartTypes = (parts.map(part => part.type) as List<ASPartType | null>).unshift(null);

  return parts
    .zip(prevPartTypes)
    .map(([part, prevPartType]) => {
      let text = '';
      switch (part.type) {
        case 'text':
          text = part.contents;
          break;
        case 'link':
          text = linkPartToRawText(part);
          break;
        case 'fraction-cookie':
          text = `[${part.getIn(['fraction', 0]) || ''}/${part.getIn(['fraction', 1]) || ''}]`;
          break;
        case 'percentage-cookie':
          text = `[${part.percentage || ''}%]`;
          break;
        case 'table':
          text = tablePartToRawText(part);
          break;
        case 'list':
          text = listPartToRawText(part);
          break;
        case 'timestamp-range':
          text = timestampRangePartToRawText(part);
          break;
        default:
          console.error(
            `Unknown attributed string part type in attributedStringToRawText: ${part.type}`
          );
      }

      const optionalNewlinePrefix = ['list', 'table'].includes(prevPartType || '') ? '\n' : '';
      return optionalNewlinePrefix + text;
    })
    .join('');
};

export default (headers: List<any>, todoKeywordSets: List<TodoKeywordSet>) => {
  let configContent = '';
  const firstTodoKeywordSet = todoKeywordSets.first(null);
  if (firstTodoKeywordSet && !firstTodoKeywordSet.default) {
    configContent =
      todoKeywordSets
        .map(todoKeywordSet => {
          return todoKeywordSet.get('configLine');
        })
        .join('\n') + '\n\n';
  }

  const headerContent = headers
    .toJS()
    .map(header => {
      let contents = '';
      contents += '*'.repeat(header.nestingLevel);

      if (header.titleLine.todoKeyword) {
        contents += ` ${header.titleLine.todoKeyword}`;
      }
      contents += ` ${header.titleLine.rawTitle}`;

      if (header.titleLine.tags.length > 0) {
        contents += ` :${header.titleLine.tags.filter((tag: string | null) => !!tag).join(':')}:`;
      }

      if (header.planningItems) {
        // fix this `any`.
        header.planningItems.forEach((planningItem: any) => {
          contents += `\n${planningItem.type}: ${renderAsText(
            makeTimestamp(planningItem.timestamp)
          )}`;
        });
      }

      if (header.propertyListItems.length > 0) {
        contents += '\n:PROPERTIES:';
        // TODO: fix this `any`.
        header.propertyListItems.forEach((propertyListItem: any) => {
          contents += `\n:${propertyListItem.property}: ${
            propertyListItem.value
              ? attributedStringToRawText(
                convertRawAttributedStringToAttributedString(propertyListItem.value)
              )
              : null
            }`;
        });
        contents += '\n:END:\n';
      }

      if (header.description) {
        if (!header.rawDescription.startsWith('\n') && header.rawDescription.length !== 0) {
          contents += '\n';
        }
        contents += header.rawDescription;
      }

      return contents;
    })
    .join('\n');

  return configContent + headerContent;
};

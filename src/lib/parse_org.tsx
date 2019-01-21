import generateId from './id_generator';
import { convertRawAttributedStringToAttributedString } from './attributed_string';

import { List } from 'immutable';
import _ from 'lodash';

import {
  TimestampProps,
  Timestamp,
  TimestampRepeaterType,
  TimestampRepeaterTypeString,
  timestampRepeaterTypeForString,
  TimestampDelayType,
  TimestampDelayTypeString,
  timestampDelayTypeForString,
  TimestampRepeaterDelayUnit,
  TimestampRepeaterDelayUnitString,
  timestampRepeaterDelayUnitForString,
  makeTimestamp,
  timestampDefaultValues,
} from '../types/timestamps';
import {
  RawASLinkPart,
  RawASPart,
  RawASTablePart,
  RawASListPart,
  RawASListPartItem,
  MarkupType,
  markupTypeForStringType,
  AttributedString,
  RawAttributedString,
  CheckboxState,
  checkboxStateForString,
} from '../types/attributed_string';
import { TodoKeywordSet, makeTodoKeywordSet } from '../types/todo_keyword_set';
import {
  PlanningItem,
  makePlanningItem,
  planningItemTypeForStringType,
} from '../types/planning_item';
import { PropertyListItem, makePropertyListItem } from '../types/property_list_item';
import { TitleLine, makeTitleLine } from '../types/title_line';
import { Header, makeHeader } from '../types/header';
import { makeOrgFile } from '../types/org_file';

// Yeah, this thing is pretty wild. I use https://www.debuggex.com/ to edit it, then paste the results in here.
// But fixing this mess is on my todo list...
const markupAndCookieRegex = /(\[\[([^\]]*)\]\]|\[\[([^\]]*)\]\[([^\]]*)\]\])|(\[((\d*%)|(\d*\/\d*))\])|(([\s({'"]?)([*/~=_+])([^\s,'](.*)[^\s,'])\11([\s\-.,:!?'")}]?))|(([<[])(\d{4})-(\d{2})-(\d{2})(?: (Mon|Tue|Wed|Thu|Fri|Sat|Sun))?(?: ([012]?\d:[0-5]\d))?(?:-([012]?\d:[0-5]\d))?(?: ((?:\+)|(?:\+\+)|(?:\.\+)|(?:-)|(?:--))(\d+)(h|d|w|m|y))?(?: ((?:\+)|(?:\+\+)|(?:\.\+)|(?:-)|(?:--))(\d+)(h|d|w|m|y))?[>\]](?:--([<[])(\d{4})-(\d{2})-(\d{2})(?: (Mon|Tue|Wed|Thu|Fri|Sat|Sun))?(?: ([012]?\d:[0-5]\d))?(?:-([012]?\d:[0-5]\d))?(?: ((?:\+)|(?:\+\+)|(?:\.\+)|(?:-)|(?:--))(\d+)(h|d|w|m|y))?(?: ((?:\+)|(?:\+\+)|(?:\.\+)|(?:-)|(?:--))(\d+)(h|d|w|m|y))?[>\]])?)/g;
const timestampRegex = /([<[])(\d{4})-(\d{2})-(\d{2})(?: (Mon|Tue|Wed|Thu|Fri|Sat|Sun))?(?: ([012]?\d:[0-5]\d))?(?:-([012]?\d:[0-5]\d))?(?: ((?:\+)|(?:\+\+)|(?:\.\+)|(?:-)|(?:--))(\d+)(h|d|w|m|y))?(?: ((?:\+)|(?:\+\+)|(?:\.\+)|(?:-)|(?:--))(\d+)(h|d|w|m|y))?[>\]]/;

const timestampFromRegexMatch = (
  match: RegExpExecArray | RegExpMatchArray,
  partIndices: Array<number>
): TimestampProps | null => {
  const [
    typeBracket,
    year,
    month,
    day,
    dayName,
    timeStart,
    timeEnd,
    firstDelayRepeatType,
    firstDelayRepeatValue,
    firstDelayRepeatUnit,
    secondDelayRepeatType,
    secondDelayRepeatValue,
    secondDelayRepeatUnit,
  ] = partIndices.map(partIndex => match[partIndex]);

  if (!year) {
    return null;
  }

  const [startHour, startMinute] = !!timeStart ? timeStart.split(':') : [null, null];
  const [endHour, endMinute] = !!timeEnd ? timeEnd.split(':') : [null, null];

  let repeaterType = null,
    repeaterValue = null,
    repeaterUnit = null;
  let delayType = null,
    delayValue = null,
    delayUnit = null;

  // TODO: use the timestamp enums here.
  if (['+', '++', '.+'].includes(firstDelayRepeatType)) {
    repeaterType = timestampRepeaterTypeForString(
      firstDelayRepeatType as TimestampRepeaterTypeString
    );
    repeaterValue = firstDelayRepeatValue === null ? null : parseInt(firstDelayRepeatValue);
    repeaterUnit = timestampRepeaterDelayUnitForString(
      firstDelayRepeatUnit as TimestampRepeaterDelayUnitString
    );
  } else if (['-', '--'].includes(firstDelayRepeatType)) {
    delayType = timestampDelayTypeForString(firstDelayRepeatType as TimestampDelayTypeString);
    delayValue = firstDelayRepeatValue === null ? null : parseInt(firstDelayRepeatValue);
    delayUnit = timestampRepeaterDelayUnitForString(
      firstDelayRepeatUnit as TimestampRepeaterDelayUnitString
    );
  }
  if (['+', '++', '.+'].includes(secondDelayRepeatType)) {
    repeaterType = timestampRepeaterTypeForString(
      secondDelayRepeatType as TimestampRepeaterTypeString
    );
    repeaterValue = secondDelayRepeatValue === null ? null : parseInt(secondDelayRepeatValue);
    repeaterUnit = timestampRepeaterDelayUnitForString(
      secondDelayRepeatUnit as TimestampRepeaterDelayUnitString
    );
  } else if (['-', '--'].includes(secondDelayRepeatType)) {
    delayType = timestampDelayTypeForString(secondDelayRepeatType as TimestampDelayTypeString);
    delayValue = secondDelayRepeatValue === null ? null : parseInt(secondDelayRepeatValue);
    delayUnit = timestampRepeaterDelayUnitForString(
      secondDelayRepeatUnit as TimestampRepeaterDelayUnitString
    );
  }

  return {
    isActive: typeBracket === '<',
    year,
    month,
    day,
    dayName,
    startHour,
    startMinute,
    endHour,
    endMinute,
    repeaterType,
    repeaterValue,
    repeaterUnit,
    delayType,
    delayValue,
    delayUnit,
  };
};

export const parseMarkupAndCookies = (
  rawText: string,
  { shouldAppendNewline = false, excludeCookies = true } = {}
): RawAttributedString => {
  const matches = [];
  let match = markupAndCookieRegex.exec(rawText);
  while (match) {
    if (!!match[2]) {
      matches.push({
        type: 'link',
        rawText: match[0],
        uri: match[2],
        index: match.index,
      });
    } else if (!!match[3] && !!match[4]) {
      matches.push({
        type: 'link',
        rawText: match[0],
        uri: match[3],
        title: match[4],
        index: match.index,
      });
    } else if (!!match[7]) {
      const percentCookieMatch = match[7].match(/(\d*)%/);
      if (percentCookieMatch !== null) {
        matches.push({
          type: 'percentage-cookie',
          rawText: match[0],
          percentage: percentCookieMatch[1],
          index: match.index,
        });
      }
    } else if (!!match[8]) {
      const fractionCookieMatch = match[8].match(/(\d*)\/(\d*)/);
      if (fractionCookieMatch !== null) {
        matches.push({
          type: 'fraction-cookie',
          rawText: match[0],
          fraction: [fractionCookieMatch[1], fractionCookieMatch[2]],
          index: match.index,
        });
      }
    } else if (!!match[11]) {
      // TODO: make this an enum type.
      const markupType = ({
        '~': 'inline-code',
        '*': 'bold',
        '/': 'italic',
        '+': 'strikethrough',
        _: 'underline',
        '=': 'verbatim',
      } as { [key: string]: string })[match[11]];

      const markupPrefixLength = match[10].length;

      matches.push({
        type: 'inline-markup',
        rawText: match[0].substring(markupPrefixLength, match[12].length + 2 + markupPrefixLength),
        index: match.index + markupPrefixLength,
        content: match[12],
        markupType,
      });
    } else if (!!match[15]) {
      const firstTimestamp = timestampFromRegexMatch(match, _.range(16, 29));
      const secondTimestamp = timestampFromRegexMatch(match, _.range(29, 42));

      matches.push({
        type: 'timestamp-range',
        rawText: match[0],
        index: match.index,
        firstTimestamp,
        secondTimestamp,
      });
    }
    match = markupAndCookieRegex.exec(rawText);
  }

  const lineParts: RawAttributedString = [];
  let startIndex = 0;
  matches.forEach(match => {
    let index = match.index;

    if (index !== startIndex) {
      const text = rawText.substring(startIndex, index);
      lineParts.push({
        id: generateId(),
        type: 'text',
        contents: text,
      });
    }

    if (match.type === 'link') {
      const linkPart: RawASLinkPart = {
        id: generateId(),
        type: 'link',
        title: null,
        uri: match.uri || '',
      };
      if (match.title) {
        linkPart.title = match.title;
      }
      lineParts.push(linkPart);
    } else if (match.type === 'percentage-cookie') {
      lineParts.push({
        id: generateId(),
        type: 'percentage-cookie',
        percentage: parseInt(match.percentage || '0'), // TODO: find a better way to ensure match.percentage exists.
      });
    } else if (match.type === 'fraction-cookie') {
      lineParts.push({
        id: generateId(),
        type: 'fraction-cookie',
        fraction:
          match && match.fraction
            ? [parseInt(match.fraction[0] || '0'), parseInt(match.fraction[1] || '0')]
            : [0, 0],
      });
    } else if (match.type === 'inline-markup') {
      lineParts.push({
        id: generateId(),
        type: 'inline-markup',
        content: match.content || '',
        markupType: markupTypeForStringType(match.markupType) || MarkupType.InlineCode,
      });
    } else if (match.type === 'timestamp-range') {
      lineParts.push({
        id: generateId(),
        type: 'timestamp-range',
        firstTimestamp: match.firstTimestamp || timestampDefaultValues,
        secondTimestamp: match.secondTimestamp || null,
      });
    }

    startIndex = match.index + match.rawText.length;
  });

  if (startIndex !== rawText.length || shouldAppendNewline) {
    const trailingText =
      rawText.substring(startIndex, rawText.length) + (shouldAppendNewline ? '\n' : '');
    lineParts.push({
      id: generateId(),
      type: 'text',
      contents: trailingText,
    });
  }

  return lineParts;
};

const parseTable = (tableLines: string[]): RawASTablePart => {
  const table: RawASTablePart = {
    id: generateId(),
    type: 'table',
    rawContents: [[]],
    contents: [],
  };

  tableLines.map(line => line.trim()).forEach(line => {
    if (line.startsWith('|-')) {
      table.rawContents.push([]);
    } else {
      const lastRow = _.last(table.rawContents);
      const lineCells = line.substr(1, line.length - 2).split('|');

      if (lastRow) {
        if (lastRow.length === 0) {
          lineCells.forEach(cell => lastRow.push(cell));
        } else {
          lineCells.forEach((cellContents, cellIndex) => {
            lastRow[cellIndex] += `\n${cellContents}`;
          });
        }
      }
    }
  });

  // Parse the contents of each cell.
  table.contents = table.rawContents.map(row => ({
    id: generateId(),
    contents: row.map(rawContents => ({
      id: generateId(),
      contents: parseMarkupAndCookies(rawContents, {
        excludeCookies: true,
      }),
      rawContents,
    })),
  }));

  // We sometimes end up with an extra, empty row - remove it if so.
  const lastRow = _.last(table.contents);
  if (lastRow && lastRow.contents.length === 0) {
    table.contents = table.contents.slice(0, table.contents.length - 1);
  }

  // Make sure each row has the same number of columns.
  const maxNumColumns = Math.max(...table.contents.map(row => row.contents.length));
  table.contents.forEach(row => {
    if (row.contents.length < maxNumColumns) {
      _.times(maxNumColumns - row.contents.length, () => {
        row.contents.push({
          id: generateId(),
          contents: [],
          rawContents: '',
        });
      });
    }
  });

  return table;
};

export const parseRawTextAsRawAttributedString = (
  rawText: string,
  { excludeContentElements = false } = {}
): RawAttributedString => {
  const lines = rawText.split('\n');

  const LIST_HEADER_REGEX = /^\s*([-+*]|(\d+(\.|\)))) (.*)/;

  interface RawLine {
    type: 'raw-list-content' | 'raw-list-header' | 'raw-table';
    line: string;
  }
  type RawLineOrASPart = RawASPart | RawLine;

  let currentListHeaderNestingLevel: number | null = null;
  const rawLineParts = _.flatten(
    lines.map(
      (line, lineIndex): RawLineOrASPart[] => {
        const numLeadingSpaces = (line.match(/^( *)/) as RegExpExecArray)[0].length;

        if (
          currentListHeaderNestingLevel !== null &&
          (numLeadingSpaces > currentListHeaderNestingLevel || !line.trim())
        ) {
          return [
            {
              type: 'raw-list-content',
              line,
            },
          ];
        } else {
          currentListHeaderNestingLevel = null;

          if (!!line.match(LIST_HEADER_REGEX) && !excludeContentElements) {
            currentListHeaderNestingLevel = numLeadingSpaces;

            return [
              {
                type: 'raw-list-header',
                line,
              },
            ];
          } else if (line.trim().startsWith('|') && !excludeContentElements) {
            return [
              {
                type: 'raw-table',
                line,
              },
            ];
          } else {
            return parseMarkupAndCookies(line, {
              shouldAppendNewline: lineIndex !== lines.length - 1,
              excludeCookies: true,
            });
          }
        }
      }
    )
  );

  const processedLineParts: RawAttributedString = [];
  for (let partIndex = 0; partIndex < rawLineParts.length; ++partIndex) {
    const linePart = rawLineParts[partIndex];
    if (linePart.type === 'raw-table') {
      const tableLines = _.takeWhile(
        rawLineParts.slice(partIndex),
        part => part.type === 'raw-table'
      ).map(part => (part as RawLine).line);

      processedLineParts.push(parseTable(tableLines));

      partIndex += tableLines.length - 1;
    } else if (linePart.type === 'raw-list-header') {
      const numLeadingSpaces = (linePart.line.match(/^( *)/) as RegExpExecArray)[0].length;
      const contentLines = _.takeWhile(
        rawLineParts.slice(partIndex + 1),
        part => part.type === 'raw-list-content'
      )
        .map(part => (part as RawLine).line)
        .map(
          line =>
            line.startsWith(' '.repeat(numLeadingSpaces + 2))
              ? line.substr(numLeadingSpaces + 2)
              : line.substr(numLeadingSpaces + 1)
        );
      if (contentLines[contentLines.length - 1] === '') {
        contentLines[contentLines.length - 1] = ' ';
      }
      const contents = parseRawTextAsRawAttributedString(contentLines.join('\n'));

      partIndex += contentLines.length;

      const isOrdered = !!linePart.line.match(/^\s*\d+[.)]/);

      // Remove the leading -, +, *, or number characters.
      let line = (linePart.line.match(LIST_HEADER_REGEX) as RegExpExecArray)[4];

      let forceNumber = null;
      if (line.match(/^\s*\[@\d+\]/)) {
        const match = line.match(/^\s*\[@(\d+)\]/);
        forceNumber = !!match ? parseInt(match[1]) : null;
        line = line.replace(/^\s*\[@\d+\]\s*/, '');
      }

      let checkboxState: CheckboxState | undefined = undefined;
      const isCheckbox = !!line.match(/^\s*\[[ X-]\]/);
      if (isCheckbox) {
        const match = line.match(/^\s*\[([ X-])\]/);
        const stateCharacter = !!match ? match[1] : null;

        checkboxState = checkboxStateForString(stateCharacter);

        line = line.replace(/^\s*\[[ X-]\]\s*/, '');
      }

      const newListItem: RawASListPartItem = {
        id: generateId(),
        titleLine: parseMarkupAndCookies(line),
        contents,
        forceNumber,
        isCheckbox,
        checkboxState,
      };

      const lastIndex = processedLineParts.length - 1;
      if (lastIndex >= 0 && processedLineParts[lastIndex].type === 'list') {
        (processedLineParts[lastIndex] as RawASListPart).items.push(newListItem);
      } else {
        const numberTerminatorCharacterMatch = linePart.line.match(/\s*\d+([.)])/);
        processedLineParts.push({
          type: 'list',
          id: generateId(),
          items: [newListItem],
          bulletCharacter: linePart.line.trim()[0],
          numberTerminatorCharacter:
            isOrdered && !!numberTerminatorCharacterMatch
              ? numberTerminatorCharacterMatch[1]
              : undefined,
          isOrdered,
        });
      }
    } else {
      processedLineParts.push(linePart as RawASPart);
    }
  }

  return processedLineParts;
};

export const parseRawTextAsAttributedString = (rawText: string, options = {}) =>
  convertRawAttributedStringToAttributedString(parseRawTextAsRawAttributedString(rawText, options));

function notEmpty<TValue>(value: TValue | null): value is TValue {
  return value !== null;
}

const parsePlanningItems = (
  rawText: string
): { planningItems: List<PlanningItem>; strippedDescription: string } => {
  const singlePlanningItemRegex = concatRegexes(/(DEADLINE|SCHEDULED|CLOSED):\s*/, timestampRegex);
  const optionalSinglePlanningItemRegex = RegExp(
    '(' +
    singlePlanningItemRegex
      .toString()
      .substring(1, singlePlanningItemRegex.toString().length - 1) +
    ')?'
  );
  const planningRegex = concatRegexes(
    /^\s*/,
    optionalSinglePlanningItemRegex,
    /\s*/,
    optionalSinglePlanningItemRegex,
    /\s*/,
    optionalSinglePlanningItemRegex,
    /\s*/
  );
  const planningMatch = rawText.match(planningRegex);
  if (!planningMatch) {
    return { planningItems: List(), strippedDescription: rawText };
  }

  const planningItems = List(
    [2, 17, 32]
      .map(planningTypeIndex => {
        const type = planningItemTypeForStringType(planningMatch[planningTypeIndex]);
        if (!type) {
          return null;
        }

        const timestamp = makeTimestamp(timestampFromRegexMatch(
          planningMatch,
          _.range(planningTypeIndex + 1, planningTypeIndex + 1 + 13)
        ) as TimestampProps);

        return makePlanningItem({ type, timestamp, id: generateId() });
      })
      .filter(notEmpty)
  );

  return { planningItems, strippedDescription: rawText.substring(planningMatch[0].length) };
};

const parsePropertyList = (
  rawText: string
): { propertyListItems: List<PropertyListItem>; strippedDescription: string } => {
  const lines = rawText.split('\n');
  const propertiesLineIndex = lines.findIndex(line => line.trim() === ':PROPERTIES:');
  const endLineIndex = lines.findIndex(line => line.trim() === ':END:');

  if (
    propertiesLineIndex === -1 ||
    endLineIndex === -1 ||
    !rawText.trim().startsWith(':PROPERTIES:')
  ) {
    return {
      propertyListItems: List(),
      strippedDescription: rawText,
    };
  }

  const propertyListItems = List(
    lines
      .slice(propertiesLineIndex + 1, endLineIndex)
      .map(line => {
        const match = line.match(/:([^\s]*):(?: (.*))?/);
        if (!match) {
          return null;
        }

        const value = !!match[2]
          ? convertRawAttributedStringToAttributedString(parseMarkupAndCookies(match[2]))
          : List();

        return makePropertyListItem({
          id: generateId(),
          property: match[1],
          value,
        });
      })
      .filter(notEmpty)
  );

  return {
    propertyListItems,
    strippedDescription: lines.slice(endLineIndex + 1).join('\n'),
  };
};

export const parseDescriptionPrefixElements = (rawText: string) => {
  const planningItemsParse = parsePlanningItems(rawText);
  const propertyListParse = parsePropertyList(planningItemsParse.strippedDescription);

  return {
    planningItems: planningItemsParse.planningItems,
    propertyListItems: propertyListParse.propertyListItems,
    strippedDescription: propertyListParse.strippedDescription,
  };
};

const defaultKeywordSets: List<TodoKeywordSet> = List([
  makeTodoKeywordSet({
    keywords: List(['TODO', 'DONE']),
    completedKeywords: List(['DONE']),
    default: true,
  }),
]);

export const parseTitleLine = (
  titleLine: string,
  todoKeywordSets: List<TodoKeywordSet>
): TitleLine => {
  const allKeywords = todoKeywordSets.flatMap(todoKeywordSet => todoKeywordSet.keywords);
  const todoKeyword = allKeywords
    .filter(keyword => titleLine.startsWith(keyword + ' '))
    .first() as string;
  let rawTitle = titleLine;
  if (todoKeyword) {
    rawTitle = rawTitle.substr(todoKeyword.length + 1);
  }

  let tags: string[] = [];
  if (rawTitle.trimRight().endsWith(':')) {
    const titleParts = rawTitle.trimRight().split(' ');
    const possibleTags = titleParts[titleParts.length - 1];
    if (/^:[^\s]+:$/.test(possibleTags)) {
      rawTitle = rawTitle.substr(0, rawTitle.length - possibleTags.length);
      tags = possibleTags.split(':').filter(tag => tag !== '');
    }
  }

  const title = convertRawAttributedStringToAttributedString(parseMarkupAndCookies(rawTitle));

  return makeTitleLine({ title, rawTitle, todoKeyword, tags: List(tags) });
};

export const newHeaderWithTitle = (
  line: string,
  nestingLevel: number,
  todoKeywordSets: List<TodoKeywordSet>
): Header => {
  if (todoKeywordSets.size === 0) {
    todoKeywordSets = defaultKeywordSets;
  }

  const titleLine = parseTitleLine(line, todoKeywordSets);
  return makeHeader({
    titleLine,
    rawDescription: '',
    description: List(),
    opened: false,
    id: generateId(),
    nestingLevel,
    planningItems: List(),
    propertyListItems: List(),
  });
};

const concatRegexes = (...regexes: RegExp[]) =>
  regexes.reduce((prev, curr) =>
    RegExp(
      prev.toString().substring(1, prev.toString().length - 1) +
      curr.toString().substring(1, curr.toString().length - 1)
    )
  );

export const newHeaderFromText = (rawText: string, todoKeywordSets: List<TodoKeywordSet>) => {
  const titleLine = rawText.split('\n')[0].replace(/^\**\s*/, '');
  const description = rawText
    .split('\n')
    .slice(1)
    .join('\n');

  const { planningItems, propertyListItems, strippedDescription } = parseDescriptionPrefixElements(
    description
  );

  return newHeaderWithTitle(titleLine, 1, todoKeywordSets)
    .set('rawDescription', strippedDescription)
    .set('description', parseRawTextAsAttributedString(strippedDescription))
    .set('planningItems', planningItems)
    .set('propertyListItems', propertyListItems);
};

// TODO: strongly type this file.
export const parseOrg = (fileContents: string) => {
  let headers: List<Header> = List();
  const lines = fileContents.split('\n');

  let todoKeywordSets: List<TodoKeywordSet> = List();

  lines.forEach(line => {
    if (line.startsWith('*')) {
      let nestingLevel = line.indexOf(' ');
      if (nestingLevel === -1) {
        nestingLevel = line.length;
      }
      const title = line.substr(nestingLevel + 1);
      headers = headers.push(newHeaderWithTitle(title, nestingLevel, todoKeywordSets));
    } else {
      if (headers.size === 0) {
        if (line.startsWith('#+TODO: ') || line.startsWith('#+TYP_TODO: ')) {
          const keywordsString = line.substr(line.indexOf(':') + 2);
          const keywordTokens = keywordsString.split(/\s/);
          const keywords = keywordTokens.filter(keyword => keyword !== '|');

          const pipeIndex = keywordTokens.indexOf('|');
          const completedKeywords = pipeIndex >= 0 ? keywords.slice(pipeIndex) : [];

          todoKeywordSets = todoKeywordSets.push(
            makeTodoKeywordSet({
              keywords: List(keywords),
              completedKeywords: List(completedKeywords),
              configLine: line,
              default: false,
            })
          );
        }
      } else {
        headers = headers.updateIn(
          [headers.size - 1, 'rawDescription'],
          rawDescription => (rawDescription.length === 0 ? line : rawDescription + '\n' + line)
        );
      }
    }
  });

  if (todoKeywordSets.size === 0) {
    todoKeywordSets = defaultKeywordSets;
  }

  headers = headers.map((header, index) => {
    const {
      planningItems,
      propertyListItems,
      strippedDescription,
    } = parseDescriptionPrefixElements(header.rawDescription);

    return header
      .set('rawDescription', strippedDescription)
      .set('description', parseRawTextAsAttributedString(strippedDescription))
      .set('planningItems', planningItems)
      .set('propertyListItems', propertyListItems);
  });

  return makeOrgFile({
    headers,
    todoKeywordSets,
  });
};

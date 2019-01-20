import { List, fromJS } from 'immutable';

import {
  AttributedString,
  RawAttributedString,
  ASPart,
  RawASPart,
  RawASTablePart,
  ASPartProps,
  ASListPartProps,
  makeTextPart,
  makeLinkPart,
  makePercentageCookiePart,
  makeFractionCookiePart,
  makeTablePart,
  makeTablePartRow,
  makeTablePartCell,
  makeListPartItem,
  makeListPart,
  makeInlineMarkupPart,
  makeTimestampRangePart,
} from '../types/attributed_string';
import { makeTimestamp } from '../types/timestamps';

export const convertRawAttributedStringToAttributedString = (
  rawParts: RawAttributedString
): AttributedString =>
  List(
    rawParts.map(rawPart => {
      switch (rawPart.type) {
        case 'text':
          return makeTextPart(rawPart);
        case 'link':
          return makeLinkPart(rawPart);
        case 'percentage-cookie':
          return makePercentageCookiePart(rawPart);
        case 'fraction-cookie':
          return makeFractionCookiePart(rawPart);
        case 'table':
          return makeTablePart({
            ...rawPart,
            contents: List(
              rawPart.contents.map(row =>
                makeTablePartRow({
                  ...row,
                  contents: List(
                    row.contents.map(cell =>
                      makeTablePartCell({
                        ...cell,
                        contents: convertRawAttributedStringToAttributedString(cell.contents),
                      })
                    )
                  ),
                })
              )
            ),
          });
        case 'list':
          return makeListPart({
            ...rawPart,
            items: List(
              rawPart.items.map(item =>
                makeListPartItem({
                  ...item,
                  titleLine: convertRawAttributedStringToAttributedString(item.titleLine),
                  contents: convertRawAttributedStringToAttributedString(item.contents),
                })
              )
            ),
          });
        case 'inline-markup':
          return makeInlineMarkupPart(rawPart);
        case 'timestamp-range':
          return makeTimestampRangePart({
            type: 'timestamp-range',
            id: rawPart.id,
            firstTimestamp: makeTimestamp(rawPart.firstTimestamp),
            secondTimestamp: rawPart.secondTimestamp
              ? makeTimestamp(rawPart.secondTimestamp)
              : null,
          });
      }
    })
  );

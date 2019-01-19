import { List, fromJS } from 'immutable';

import {
  AttributedString,
  ASPart,
  ASPartProps,
  ASListPartProps,
  makeTextPart,
  makeLinkPart,
  makePercentageCookiePart,
  makeFractionCookiePart,
  makeTablePart,
  makeListPartItem,
  makeListPart,
  makeInlineMarkupPart,
  makeTimestampRangePart,
} from '../types/attributed_string';
import { makeTimestamp } from '../types/timestamps';

export const convertJSToAttributedString = (rawParts: ASPartProps[]): AttributedString =>
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
          // TODO: fix this table creation nonsense.
          return makeTablePart({
            ...rawPart,
            contents: List(
              (rawPart.contents as any[]).map(row =>
                fromJS({ ...row, contents: fromJS(row.contents) })
              )
            ),
          });
        case 'list':
          return makeListPart({
            type: 'list',
            id: rawPart.id,
            items: List((rawPart as ASListPartProps).items).map(makeListPartItem),
            isOrdered: rawPart.isOrdered,
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

import { List, fromJS } from 'immutable';

import { AttributedString, ASPartProps, makeTimestampRangePart } from '../types/attributed_string';
import { makeTimestamp } from '../types/timestamps';

export const convertJSToAttributedString = (rawParts: ASPartProps[]): AttributedString =>
  List(
    rawParts.map(rawPart => {
      switch (rawPart.type) {
        case 'timestamp-range':
          return makeTimestampRangePart({
            type: 'timestamp-range',
            id: rawPart.id,
            firstTimestamp: makeTimestamp(rawPart.firstTimestamp),
            secondTimestamp: rawPart.secondTimestamp
              ? makeTimestamp(rawPart.secondTimestamp)
              : null,
          });
        default:
          return fromJS(rawPart);
      }
    })
  );

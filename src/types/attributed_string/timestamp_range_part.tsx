import { Record } from 'immutable';

import RecordOf from '../record_of';

import { Timestamp, TimestampProps, makeTimestamp } from '../timestamps';

export interface ASTimestampRangePartProps {
  type: 'timestamp-range';
  id: number;
  firstTimestamp: Timestamp | TimestampProps; // TODO: find a way to get rid of this union.
  secondTimestamp: Timestamp | TimestampProps | null; // TODO: find a way to get rid of this union.
}
export type ASTimestampRangePart = RecordOf<ASTimestampRangePartProps>;
const timestampRangePartDefaultValues: ASTimestampRangePartProps = {
  type: 'timestamp-range',
  id: 0,
  firstTimestamp: makeTimestamp(),
  secondTimestamp: null,
};
export const makeTimestampRangePart: Record.Factory<ASTimestampRangePartProps> = Record(
  timestampRangePartDefaultValues
);

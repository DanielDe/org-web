import { Record } from 'immutable';

import RecordOf from '../record_of';

import { Timestamp, TimestampProps, makeTimestamp } from '../timestamps';

export interface ASTimestampRangePartProps {
  type: 'timestamp-range';
  id: number;
  firstTimestamp: Timestamp;
  secondTimestamp: Timestamp | null;
}
export interface RawASTimestampRangePart {
  type: 'timestamp-range';
  id: number;
  firstTimestamp: TimestampProps;
  secondTimestamp: TimestampProps | null;
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

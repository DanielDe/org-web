import { Record } from 'immutable';

import RecordOf from '../record_of';

export interface ASPercentageCookiePartProps {
  type: 'percentage-cookie';
  id: number;
  percentage: number;
}
export type ASPercentageCookiePart = RecordOf<ASPercentageCookiePartProps>;
const percentageCookiePartDefaultValues: ASPercentageCookiePartProps = {
  type: 'percentage-cookie',
  id: 0,
  percentage: 0,
};
export const makePercentageCookiePart: Record.Factory<ASPercentageCookiePartProps> = Record(
  percentageCookiePartDefaultValues
);

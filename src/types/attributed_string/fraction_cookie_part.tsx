import { Record } from 'immutable';

import RecordOf from '../record_of';

export interface ASFractionCookiePartProps {
  type: 'fraction-cookie';
  id: number;
  fraction: [number, number];
}
export type RawASFractionCookiePart = ASFractionCookiePartProps;
export type ASFractionCookiePart = RecordOf<ASFractionCookiePartProps>;

const fractionCookiePartDefaultValues: ASFractionCookiePartProps = {
  type: 'fraction-cookie',
  id: 0,
  fraction: [0, 0],
};
export const makeFractionCookiePart: Record.Factory<ASFractionCookiePartProps> = Record(
  fractionCookiePartDefaultValues
);

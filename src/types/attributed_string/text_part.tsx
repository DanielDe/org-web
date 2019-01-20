import { Record } from 'immutable';

import RecordOf from '../record_of';

export interface ASTextPartProps {
  type: 'text';
  id: number;
  contents: string;
}
export type RawASTextPart = ASTextPartProps;
export type ASTextPart = RecordOf<ASTextPartProps>;

const textPartDefaultValues: ASTextPartProps = {
  type: 'text',
  id: 0,
  contents: '',
};
export const makeTextPart: Record.Factory<ASTextPartProps> = Record(textPartDefaultValues);

import { Record, List } from 'immutable';

import RecordOf from '../record_of';

export interface ASListPartProps {
  type: 'list';
  id: number;
  items: any[] | List<any>; // TODO: make this not `any`. Items is actually a well defined type.
  isOrdered: boolean;
}
export type ASListPart = RecordOf<ASListPartProps>;
const listPartDefaultValues: ASListPartProps = {
  type: 'list',
  id: 0,
  items: [],
  isOrdered: false,
};
export const makeListPart: Record.Factory<ASListPartProps> = Record(listPartDefaultValues);

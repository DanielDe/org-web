import { Record, List } from 'immutable';

import RecordOf from '../record_of';

// TODO: fix this table nonsense.
export interface ASTablePartCellProps {
  id: number;
  contents: List<any>; // TODO: make this not `any`.
  rawContents: string;
}
export interface ASTablePartRowProps {
  id: number;
  contents: ASTablePartCellProps[];
}
export interface ASTablePartProps {
  type: 'table';
  id: number;
  contents: ASTablePartRowProps[] | List<ASTablePartRowProps>; // TODO: make this an array of AS parts.
  rawContents: Array<Array<string>>;
}
export type ASTablePart = RecordOf<ASTablePartProps>;
const tablePartDefaultValues: ASTablePartProps = {
  type: 'table',
  id: 0,
  contents: [],
  rawContents: [['']],
};
export const makeTablePart: Record.Factory<ASTablePartProps> = Record(tablePartDefaultValues);

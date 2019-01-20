import { Record, List } from 'immutable';

import RecordOf from '../record_of';

import { AttributedString } from './index';

export interface ASTablePartCellProps {
  id: number;
  contents: AttributedString; // TODO: make this not `any`.
  rawContents: string;
}
export type ASTablePartCell = RecordOf<ASTablePartCellProps>;
const tablePartCellDefaultValues: ASTablePartCellProps = {
  id: 0,
  contents: List(),
  rawContents: '',
};
export const makeTablePartCell: Record.Factory<ASTablePartCellProps> = Record(
  tablePartCellDefaultValues
);

export interface ASTablePartRowProps {
  id: number;
  contents: ASTablePartCell[] | List<ASTablePartCell> | ASTablePartCellProps[];
}
export type ASTablePartRow = RecordOf<ASTablePartRowProps>;
const tablePartRowDefaultValues: ASTablePartRowProps = {
  id: 0,
  contents: List(),
};
export const makeTablePartRow: Record.Factory<ASTablePartRowProps> = Record(
  tablePartRowDefaultValues
);

export interface ASTablePartProps {
  type: 'table';
  id: number;
  contents: ASTablePartRow[] | List<ASTablePartRow>; // TODO: make this an array of AS parts.
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

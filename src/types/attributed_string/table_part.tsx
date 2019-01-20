import { Record, List } from 'immutable';

import RecordOf from '../record_of';

import { RawAttributedString, AttributedString } from './index';

export interface ASTablePartCellProps {
  id: number;
  contents: AttributedString;
  rawContents: string;
}
export interface RawASTablePartCell {
  id: number;
  contents: RawAttributedString;
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
  contents: List<ASTablePartCell>;
}
export interface RawASTablePartRow {
  id: number;
  contents: RawASTablePartCell[];
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
  contents: List<ASTablePartRow>;
  rawContents: string[][];
}
export interface RawASTablePart {
  type: 'table';
  id: number;
  contents: RawASTablePartRow[];
  rawContents: string[][];
}
export type ASTablePart = RecordOf<ASTablePartProps>;

const tablePartDefaultValues: ASTablePartProps = {
  type: 'table',
  id: 0,
  contents: List(),
  rawContents: [['']],
};
export const makeTablePart: Record.Factory<ASTablePartProps> = Record(tablePartDefaultValues);

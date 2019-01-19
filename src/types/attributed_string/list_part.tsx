import { Record, List } from 'immutable';

import RecordOf from '../record_of';

import { AttributedString } from './index';

export enum CheckboxState {
  Checked = 'X',
  Unchecked = ' ',
  Partial = '-',
}
export interface ASListPartItemProps {
  id: number;
  titleLine: AttributedString;
  contents: AttributedString;
  forceNumber: number | null;
  isCheckbox: boolean;
  checkboxState: CheckboxState;
}
export type ASListPartItem = RecordOf<ASListPartItemProps>;
const listPartItemDefaultValues: ASListPartItemProps = {
  id: 0,
  titleLine: List(),
  contents: List(),
  forceNumber: null,
  isCheckbox: false,
  checkboxState: CheckboxState.Unchecked,
};
export const makeListPartItem: Record.Factory<ASListPartItemProps> = Record(
  listPartItemDefaultValues
);

export interface ASListPartProps {
  type: 'list';
  id: number;
  items: ASListPartItemProps[] | List<ASListPartItem>; // TODO: find a way to get rid of this union.
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

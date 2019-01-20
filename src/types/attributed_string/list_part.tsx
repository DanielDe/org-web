import { Record, List } from 'immutable';

import RecordOf from '../record_of';

import { RawAttributedString, AttributedString } from './index';

export enum CheckboxState {
  Checked = 'X',
  Unchecked = ' ',
  Partial = '-',
}
export const checkboxStateForString = (stateString: string | null): CheckboxState => {
  switch (stateString) {
    case ' ':
      return CheckboxState.Unchecked;
    case 'X':
      return CheckboxState.Checked;
    case '-':
      return CheckboxState.Partial;
    default:
      return CheckboxState.Unchecked;
  }
};

export interface ASListPartItemProps {
  id: number;
  titleLine: AttributedString;
  contents: AttributedString;
  forceNumber: number | null;
  isCheckbox: boolean;
  checkboxState: CheckboxState;
}
export interface RawASListPartItem {
  id: number;
  titleLine: RawAttributedString;
  contents: RawAttributedString;
  forceNumber: number | null;
  isCheckbox: boolean;
  checkboxState?: CheckboxState;
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
  items: List<ASListPartItem>;
  isOrdered: boolean;
  bulletCharacter?: string;
  numberTerminatorCharacter?: string;
}
export interface RawASListPart {
  type: 'list';
  id: number;
  items: RawASListPartItem[];
  isOrdered: boolean;
  bulletCharacter?: string;
  numberTerminatorCharacter?: string;
}
export type ASListPart = RecordOf<ASListPartProps>;

const listPartDefaultValues: ASListPartProps = {
  type: 'list',
  id: 0,
  items: List(),
  isOrdered: false,
};
export const makeListPart: Record.Factory<ASListPartProps> = Record(listPartDefaultValues);

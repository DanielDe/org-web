import { Record, List } from 'immutable';

import RecordOf from './record_of';

import { AttributedString } from './attributed_string';

export interface PropertyListItemProps {
  id: number;
  property: string;
  value: AttributedString;
}
export type PropertyListItem = RecordOf<PropertyListItemProps>;

const defaultPropertyListItemProps: PropertyListItemProps = {
  id: 0,
  property: '',
  value: List(),
};
export const makePropertyListItem: Record.Factory<PropertyListItemProps> = Record(
  defaultPropertyListItemProps
);

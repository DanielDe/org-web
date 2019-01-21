import { Record, List } from 'immutable';

import RecordOf from './record_of';

import { TitleLine, makeTitleLine } from './title_line';
import { PlanningItem } from './planning_item';
import { PropertyListItem } from './property_list_item';
import { AttributedString } from './attributed_string';

export interface HeaderProps {
  titleLine: TitleLine;
  rawDescription: string;
  description: AttributedString;
  opened: boolean;
  id: number;
  nestingLevel: number;
  planningItems: List<PlanningItem>;
  propertyListItems: List<PropertyListItem>;
}
export type Header = RecordOf<HeaderProps>;

const defaultHeaderProps: HeaderProps = {
  titleLine: makeTitleLine(),
  rawDescription: '',
  description: List(),
  opened: false,
  id: 0,
  nestingLevel: 1,
  planningItems: List(),
  propertyListItems: List(),
};
export const makeHeader: Record.Factory<HeaderProps> = Record(defaultHeaderProps);

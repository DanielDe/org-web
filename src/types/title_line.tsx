import { Record, List } from 'immutable';

import RecordOf from './record_of';

import { AttributedString } from './attributed_string';

export interface TitleLineProps {
  title: AttributedString;
  rawTitle: string;
  todoKeyword: string | null;
  tags: List<string>;
}
export type TitleLine = RecordOf<TitleLineProps>;

const defaultTitleLineProps: TitleLineProps = {
  title: List(),
  rawTitle: '',
  todoKeyword: null,
  tags: List(),
};
export const makeTitleLine: Record.Factory<TitleLineProps> = Record(defaultTitleLineProps);

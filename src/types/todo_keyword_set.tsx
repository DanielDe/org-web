import { Record, List } from 'immutable';

import RecordOf from './record_of';

export interface TodoKeywordSetProps {
  keywords: List<string>;
  completedKeywords: List<string>;
  default: boolean;
  configLine?: string;
}
export type TodoKeywordSet = RecordOf<TodoKeywordSetProps>;

const defaultTodoKeywordSetProps: TodoKeywordSetProps = {
  keywords: List(),
  completedKeywords: List(),
  default: false,
  configLine: '',
};
export const makeTodoKeywordSet: Record.Factory<TodoKeywordSetProps> = Record(
  defaultTodoKeywordSetProps
);

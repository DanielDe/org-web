import { Record, List } from 'immutable';

import RecordOf from './record_of';

// TODO: maybe try to encode the fact that default=false implies that configLine must be present.
export interface TodoKeywordSetProps {
  keywords: string[] | List<string>;
  completedKeywords: string[] | List<string>;
  default: boolean;
  configLine?: string;
}
export type TodoKeywordSet = RecordOf<TodoKeywordSetProps>;
const defaultTodoKeywordSetProps: TodoKeywordSetProps = {
  keywords: [],
  completedKeywords: [],
  default: false,
  configLine: '',
};
export const makeTodoKeywordSet: Record.Factory<TodoKeywordSetProps> = Record(
  defaultTodoKeywordSetProps
);

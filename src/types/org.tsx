import { List } from 'immutable';

import RecordOf from './record_of';

export interface TodoKeywordSetProps {
  keywords: string[];
  completedKeywords: string[];
  default: boolean;
}
export type TodoKeywordSet = RecordOf<TodoKeywordSetProps>;

import { Record, List } from 'immutable';

import RecordOf from './record_of';

import { Header } from './header';
import { TodoKeywordSet } from './todo_keyword_set';

export interface OrgStateProps {
  opennessState: { [filePath: string]: string[][] };
  isDirty: boolean;
  lastSyncAt: string | null;
  path: string | null;
  contents: string | null;
  headers: List<Header>;
  todoKeywordSets: List<TodoKeywordSet>;
  noOpCounter: number;
}
export type OrgState = RecordOf<OrgStateProps>;

const defaultOrgStateProps: OrgStateProps = {
  opennessState: {},
  isDirty: false,
  lastSyncAt: null,
  path: null,
  contents: null,
  headers: List(),
  todoKeywordSets: List(),
  noOpCounter: 0,
};
export const makeOrgState: Record.Factory<OrgStateProps> = Record(defaultOrgStateProps);

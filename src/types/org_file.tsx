import { Record, List } from 'immutable';

import RecordOf from './record_of';

import { Header } from './header';
import { TodoKeywordSet } from './todo_keyword_set';

export interface OrgFileProps {
  headers: List<Header>;
  todoKeywordSets: List<TodoKeywordSet>;
}
export type OrgFile = RecordOf<OrgFileProps>;

const defaultOrgFileProps: OrgFileProps = {
  headers: List(),
  todoKeywordSets: List(),
};
export const makeOrgFile: Record.Factory<OrgFileProps> = Record(defaultOrgFileProps);

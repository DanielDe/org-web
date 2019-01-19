import { Record } from 'immutable';

import RecordOf from '../record_of';

export interface ASLinkPartProps {
  type: 'link';
  id: number;
  title: string | null;
  uri: string | null; // TODO: this shouldn't be nullable.
}
export type ASLinkPart = RecordOf<ASLinkPartProps>;
const linkPartDefaultValues: ASLinkPartProps = {
  type: 'link',
  id: 0,
  title: null,
  uri: '',
};
export const makeLinkPart: Record.Factory<ASLinkPartProps> = Record(linkPartDefaultValues);

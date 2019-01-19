import { Record } from 'immutable';

import RecordOf from '../record_of';

// TODO: get rid of this nonsense by flattening the `contents` object.
export interface ASLinkPartContentsProps {
  title: string | null;
  uri: string | null; // TODO: this shouldn't be nullable.
}
export type ASLinkPartContents = RecordOf<ASLinkPartContentsProps>;
const linkPartContentsDefaultValues: ASLinkPartContentsProps = {
  title: null,
  uri: '',
};
export const makeLinkPartContents: Record.Factory<ASLinkPartContentsProps> = Record(
  linkPartContentsDefaultValues
);

export interface ASLinkPartProps {
  type: 'link';
  id: number;
  contents: ASLinkPartContents | ASLinkPartContentsProps;
}
export type ASLinkPart = RecordOf<ASLinkPartProps>;
const linkPartDefaultValues: ASLinkPartProps = {
  type: 'link',
  id: 0,
  contents: makeLinkPartContents(),
};
export const makeLinkPart: Record.Factory<ASLinkPartProps> = Record(linkPartDefaultValues);

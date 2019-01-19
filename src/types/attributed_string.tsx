import { Record, List } from 'immutable';

import RecordOf from './record_of';

import { Timestamp, makeTimestamp } from './timestamps';

export interface ASTextPartProps {
  type: 'text';
  id: number;
  contents: string;
}
export type ASTextPart = RecordOf<ASTextPartProps>;
const textPartDefaultValues: ASTextPartProps = {
  type: 'text',
  id: 0,
  contents: '',
};
export const makeTextPart: Record.Factory<ASTextPartProps> = Record(textPartDefaultValues);

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

export interface ASPercentageCookiePartProps {
  type: 'percentage-cookie';
  id: number;
  percentage: number;
}
export type ASPercentageCookiePart = RecordOf<ASPercentageCookiePartProps>;
const percentageCookiePartDefaultValues: ASPercentageCookiePartProps = {
  type: 'percentage-cookie',
  id: 0,
  percentage: 0,
};
export const makePercentageCookiePart: Record.Factory<ASPercentageCookiePartProps> = Record(
  percentageCookiePartDefaultValues
);

export interface ASFractionCookiePartProps {
  type: 'fraction-cookie';
  id: number;
  fraction: [number, number];
}
export type ASFractionCookiePart = RecordOf<ASFractionCookiePartProps>;
const fractionCookiePartDefaultValues: ASFractionCookiePartProps = {
  type: 'fraction-cookie',
  id: 0,
  fraction: [0, 0],
};
export const makeFractionCookiePart: Record.Factory<ASFractionCookiePartProps> = Record(
  fractionCookiePartDefaultValues
);

// TODO: fix this table nonsense.
export interface ASTablePartCellProps {
  id: number;
  contents: List<any>; // TODO: make this not `any`.
  rawContents: string;
}
export interface ASTablePartRowProps {
  id: number;
  contents: ASTablePartCellProps[];
}
export interface ASTablePartProps {
  type: 'table';
  id: number;
  contents: ASTablePartRowProps[] | List<ASTablePartRowProps>; // TODO: make this an array of AS parts.
  rawContents: Array<Array<string>>;
}
export type ASTablePart = RecordOf<ASTablePartProps>;
const tablePartDefaultValues: ASTablePartProps = {
  type: 'table',
  id: 0,
  contents: [],
  rawContents: [['']],
};
export const makeTablePart: Record.Factory<ASTablePartProps> = Record(tablePartDefaultValues);

export interface ASListPartProps {
  type: 'list';
  id: number;
  items: any[] | List<any>; // TODO: make this not `any`. Items is actually a well defined type.
  isOrdered: boolean;
}
export type ASListPart = RecordOf<ASListPartProps>;
const listPartDefaultValues: ASListPartProps = {
  type: 'list',
  id: 0,
  items: [],
  isOrdered: false,
};
export const makeListPart: Record.Factory<ASListPartProps> = Record(listPartDefaultValues);

export enum MarkupType {
  InlineCode = '~',
  Bold = '*',
  Italic = '/',
  Strikethrough = '+',
  Underline = '_',
  Verbatim = '=',
}
export interface ASInlineMarkupPartProps {
  type: 'inline-markup';
  id: number;
  markupType: MarkupType;
  content: string;
}
export type ASInlineMarkupPart = RecordOf<ASInlineMarkupPartProps>;
const inlineMarkupPartDefaultValues: ASInlineMarkupPartProps = {
  type: 'inline-markup',
  id: 0,
  markupType: MarkupType.InlineCode,
  content: '',
};
export const makeInlineMarkupPart: Record.Factory<ASInlineMarkupPartProps> = Record(
  inlineMarkupPartDefaultValues
);

export interface ASTimestampRangePartProps {
  type: 'timestamp-range';
  id: number;
  firstTimestamp: Timestamp;
  secondTimestamp: Timestamp | null;
}
export type ASTimestampRangePart = RecordOf<ASTimestampRangePartProps>;
const timestampRangePartDefaultValues: ASTimestampRangePartProps = {
  type: 'timestamp-range',
  id: 0,
  firstTimestamp: makeTimestamp(),
  secondTimestamp: null,
};
export const makeTimestampRangePart: Record.Factory<ASTimestampRangePartProps> = Record(
  timestampRangePartDefaultValues
);

export type ASPartProps =
  | ASTextPartProps
  | ASLinkPartProps
  | ASPercentageCookiePartProps
  | ASFractionCookiePartProps
  | ASTablePartProps
  | ASListPartProps
  | ASInlineMarkupPartProps
  | ASTimestampRangePartProps;
export type ASPart =
  | ASTextPart
  | ASLinkPart
  | ASPercentageCookiePart
  | ASFractionCookiePart
  | ASTablePart
  | ASListPart
  | ASInlineMarkupPart
  | ASTimestampRangePart;
export type AttributedString = List<ASPart>;

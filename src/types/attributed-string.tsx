import RecordOf from './record_of';

import { Timestamp } from './timestamps';

export interface ASTextPartProps {
  type: 'text';
  id: number;
  contents: string;
}
export type ASTextPart = RecordOf<ASTextPartProps>;

export interface ASLinkPartProps {
  type: 'link';
  id: number;
  contents: {
    title: string | null;
    uri: string | null; // TODO: this shouldn't be nullable.
  };
}
export type ASLinkPart = RecordOf<ASLinkPartProps>;

export interface ASPercentageCookiePartProps {
  type: 'percentage-cookie';
  id: number;
  percentage: number;
}
export type ASPercentageCookiePart = RecordOf<ASPercentageCookiePartProps>;

export interface ASFractionCookiePartProps {
  type: 'fraction-cookie';
  id: number;
  fraction: [number, number];
}
export type ASFractionCookiePart = RecordOf<ASFractionCookiePartProps>;

export interface ASTablePartCellProps {
  id: number;
  contents: Array<any>; // TODO: make this not `any`.
  rawContents: string;
}
export interface ASTablePartRowProps {
  id: number;
  contents: Array<ASTablePartCellProps>;
}
export interface ASTablePartProps {
  type: 'table';
  id: number;
  contents: Array<ASTablePartRowProps>; // TODO: make this an array of AS parts.
  rawContents: Array<Array<string>>;
}
export type ASTablePart = RecordOf<ASTablePartProps>;

export interface ASListPartProps {
  type: 'list';
  id: number;
  items: Array<any>; // TODO: make this not `any`.
  isOrdered: boolean;
}
export type ASListPart = RecordOf<ASListPartProps>;

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

export interface ASTimestampRangePartProps {
  type: 'timestamp-range';
  firstTimestamp: Timestamp;
  secondTimestamp?: Timestamp;
}
export type ASTimestampRangePart = RecordOf<ASTimestampRangePartProps>;

export type ASPart =
  | ASTextPart
  | ASLinkPart
  | ASPercentageCookiePart
  | ASFractionCookiePart
  | ASTablePart
  | ASListPart
  | ASInlineMarkupPart
  | ASTimestampRangePart;
export type AttributedString = ASPart[];

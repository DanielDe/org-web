import { List } from 'immutable';

import { ASTextPartProps, RawASTextPart, ASTextPart, makeTextPart } from './text_part';
import { ASLinkPartProps, RawASLinkPart, ASLinkPart, makeLinkPart } from './link_part';
import {
  ASPercentageCookiePartProps,
  RawASPercentageCookiePart,
  ASPercentageCookiePart,
  makePercentageCookiePart,
} from './percentage_cookie_part';
import {
  ASFractionCookiePartProps,
  RawASFractionCookiePart,
  ASFractionCookiePart,
  makeFractionCookiePart,
} from './fraction_cookie_part';
import {
  ASTablePartCellProps,
  RawASTablePartCell,
  ASTablePartCell,
  makeTablePartCell,
  ASTablePartRowProps,
  RawASTablePartRow,
  ASTablePartRow,
  makeTablePartRow,
  ASTablePartProps,
  RawASTablePart,
  ASTablePart,
  makeTablePart,
} from './table_part';
import {
  CheckboxState,
  checkboxStateForString,
  ASListPartItemProps,
  RawASListPartItem,
  ASListPartItem,
  makeListPartItem,
  ASListPartProps,
  RawASListPart,
  ASListPart,
  makeListPart,
} from './list_part';
import {
  MarkupType,
  markupTypeForStringType,
  ASInlineMarkupPartProps,
  RawASInlineMarkupPart,
  ASInlineMarkupPart,
  makeInlineMarkupPart,
} from './inline_markup_part';
import {
  ASTimestampRangePartProps,
  RawASTimestampRangePart,
  ASTimestampRangePart,
  makeTimestampRangePart,
} from './timestamp_range_part';

export type ASTextPartProps = ASTextPartProps;
export type RawASTextPart = RawASTextPart;
export type ASTextPart = ASTextPart;
export { makeTextPart };

export type ASLinkPartProps = ASLinkPartProps;
export type RawASLinkPart = RawASLinkPart;
export type ASLinkPart = ASLinkPart;
export { makeLinkPart };

export type ASPercentageCookiePartProps = ASPercentageCookiePartProps;
export type RawASPercentageCookiePart = RawASPercentageCookiePart;
export type ASPercentageCookiePart = ASPercentageCookiePart;
export { makePercentageCookiePart };

export type ASFractionCookiePartProps = ASFractionCookiePartProps;
export type RawASFractionCookiePart = RawASFractionCookiePart;
export type ASFractionCookiePart = ASFractionCookiePart;
export { makeFractionCookiePart };

export type ASTablePartCellProps = ASTablePartCellProps;
export type RawASTablePartCell = RawASTablePartCell;
export type ASTablePartCell = ASTablePartCell;
export { makeTablePartCell };
export type ASTablePartRowProps = ASTablePartRowProps;
export type RawASTablePartRow = RawASTablePartRow;
export type ASTablePartRow = ASTablePartRow;
export { makeTablePartRow };
export type ASTablePartProps = ASTablePartProps;
export type RawASTablePart = RawASTablePart;
export type ASTablePart = ASTablePart;
export { makeTablePart };

export { CheckboxState };
export { checkboxStateForString };
export type ASListPartItemProps = ASListPartItemProps;
export type RawASListPartItem = RawASListPartItem;
export type ASListPartItem = ASListPartItem;
export { makeListPartItem };
export type ASListPartProps = ASListPartProps;
export type RawASListPart = RawASListPart;
export type ASListPart = ASListPart;
export { makeListPart };

export { MarkupType };
export { markupTypeForStringType };
export type ASInlineMarkupPartProps = ASInlineMarkupPartProps;
export type RawASInlineMarkupPart = RawASInlineMarkupPart;
export type ASInlineMarkupPart = ASInlineMarkupPart;
export { makeInlineMarkupPart };

export type ASTimestampRangePartProps = ASTimestampRangePartProps;
export type RawASTimestampRangePart = RawASTimestampRangePart;
export type ASTimestampRangePart = ASTimestampRangePart;
export { makeTimestampRangePart };

export type ASPartType =
  | 'text'
  | 'link'
  | 'percentage-cookie'
  | 'fraction-cookie'
  | 'table'
  | 'list'
  | 'inline-markup'
  | 'timestamp-range';
export type ASPartProps =
  | ASTextPartProps
  | ASLinkPartProps
  | ASPercentageCookiePartProps
  | ASFractionCookiePartProps
  | ASTablePartProps
  | ASListPartProps
  | ASInlineMarkupPartProps
  | ASTimestampRangePartProps;

export type RawASPart =
  | RawASTextPart
  | RawASLinkPart
  | RawASPercentageCookiePart
  | RawASFractionCookiePart
  | RawASTablePart
  | RawASListPart
  | RawASInlineMarkupPart
  | RawASTimestampRangePart;
export type RawAttributedString = RawASPart[];

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

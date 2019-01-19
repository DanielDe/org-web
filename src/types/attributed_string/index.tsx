import { List } from 'immutable';

import { ASTextPartProps, ASTextPart, makeTextPart } from './text_part';
import { ASLinkPartProps, ASLinkPart, makeLinkPart } from './link_part';
import {
  ASPercentageCookiePartProps,
  ASPercentageCookiePart,
  makePercentageCookiePart,
} from './percentage_cookie_part';
import {
  ASFractionCookiePartProps,
  ASFractionCookiePart,
  makeFractionCookiePart,
} from './fraction_cookie_part';
import {
  ASTablePartCellProps,
  ASTablePartRowProps,
  ASTablePartProps,
  ASTablePart,
  makeTablePart,
} from './table_part';
import {
  CheckboxState,
  ASListPartItemProps,
  ASListPartItem,
  makeListPartItem,
  ASListPartProps,
  ASListPart,
  makeListPart,
} from './list_part';
import {
  MarkupType,
  markupTypeForStringType,
  ASInlineMarkupPartProps,
  ASInlineMarkupPart,
  makeInlineMarkupPart,
} from './inline_markup_part';
import {
  ASTimestampRangePartProps,
  ASTimestampRangePart,
  makeTimestampRangePart,
} from './timestamp_range_part';

export type ASTextPartProps = ASTextPartProps;
export type ASTextPart = ASTextPart;
export { makeTextPart };

export type ASLinkPartProps = ASLinkPartProps;
export type ASLinkPart = ASLinkPart;
export { makeLinkPart };

export type ASPercentageCookiePartProps = ASPercentageCookiePartProps;
export type ASPercentageCookiePart = ASPercentageCookiePart;
export { makePercentageCookiePart };

export type ASFractionCookiePartProps = ASFractionCookiePartProps;
export type ASFractionCookiePart = ASFractionCookiePart;
export { makeFractionCookiePart };

export type ASTablePartCellProps = ASTablePartCellProps;
export type ASTablePartRowProps = ASTablePartRowProps;
export type ASTablePartProps = ASTablePartProps;
export type ASTablePart = ASTablePart;
export { makeTablePart };

export { CheckboxState };
export type ASListPartItemProps = ASListPartItemProps;
export type ASListPartItem = ASListPartItem;
export { makeListPartItem };
export type ASListPartProps = ASListPartProps;
export type ASListPart = ASListPart;
export { makeListPart };

export { MarkupType };
export { markupTypeForStringType };
export type ASInlineMarkupPartProps = ASInlineMarkupPartProps;
export type ASInlineMarkupPart = ASInlineMarkupPart;
export { makeInlineMarkupPart };

export type ASTimestampRangePartProps = ASTimestampRangePartProps;
export type ASTimestampRangePart = ASTimestampRangePart;
export { makeTimestampRangePart };

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

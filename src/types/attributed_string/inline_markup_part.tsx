import { Record } from 'immutable';

import RecordOf from '../record_of';

export enum MarkupType {
  InlineCode = '~',
  Bold = '*',
  Italic = '/',
  Strikethrough = '+',
  Underline = '_',
  Verbatim = '=',
}

export const markupTypeForStringType = (type?: string): MarkupType => {
  switch (type) {
    case '~':
      return MarkupType.InlineCode;
    case '*':
      return MarkupType.Bold;
    case '/':
      return MarkupType.Italic;
    case '+':
      return MarkupType.Strikethrough;
    case '_':
      return MarkupType.Underline;
    case '=':
      return MarkupType.Verbatim;
    default:
      return MarkupType.InlineCode;
  }
};

export interface ASInlineMarkupPartProps {
  type: 'inline-markup';
  id: number;
  markupType: MarkupType;
  content: string;
}
export type RawASInlineMarkupPart = ASInlineMarkupPartProps;
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

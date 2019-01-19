import { Record } from 'immutable';

import RecordOf from './record_of';

export enum TimestampRepeaterType {
  SingleAdvance = '+',
  AdvanceUntilFuture = '++',
  AdvanceFromNow = '.+',
}
export type TimestampRepeaterTypeString = '+' | '++' | '.+';

export const timestampRepeaterTypeForString = (
  repeaterTypeString: TimestampRepeaterTypeString
): TimestampRepeaterType => {
  switch (repeaterTypeString) {
    case '+':
      return TimestampRepeaterType.SingleAdvance;
    case '++':
      return TimestampRepeaterType.AdvanceUntilFuture;
    case '.+':
      return TimestampRepeaterType.AdvanceFromNow;
  }
};

export enum TimestampDelayType {
  StandardDelay = '-',
  FirstOnlyDelay = '--',
}
export type TimestampDelayTypeString = '-' | '--';

export const timestampDelayTypeForString = (
  delayTypeString: TimestampDelayTypeString
): TimestampDelayType => {
  switch (delayTypeString) {
    case '-':
      return TimestampDelayType.StandardDelay;
    case '--':
      return TimestampDelayType.FirstOnlyDelay;
  }
};

export enum TimestampRepeaterDelayUnit {
  hour = 'h',
  day = 'd',
  week = 'w',
  month = 'm',
  year = 'y',
}
export type TimestampRepeaterDelayUnitString = 'h' | 'd' | 'w' | 'm' | 'y';

export const timestampRepeaterDelayUnitForString = (
  repeaterTypeString: TimestampRepeaterDelayUnitString
): TimestampRepeaterDelayUnit => {
  switch (repeaterTypeString) {
    case 'h':
      return TimestampRepeaterDelayUnit.hour;
    case 'd':
      return TimestampRepeaterDelayUnit.day;
    case 'w':
      return TimestampRepeaterDelayUnit.week;
    case 'm':
      return TimestampRepeaterDelayUnit.month;
    case 'y':
      return TimestampRepeaterDelayUnit.year;
  }
};

export type TimestampProps = {
  isActive: boolean;
  year: string | null;
  month: string | null;
  day: string | null;
  dayName: string | null;
  startHour: string | null;
  startMinute: string | null;
  endHour: string | null;
  endMinute: string | null;
  repeaterType: TimestampRepeaterType | null;
  repeaterValue: number | null;
  repeaterUnit: TimestampRepeaterDelayUnit | null;
  delayType: TimestampDelayType | null;
  delayValue: number | null;
  delayUnit: TimestampRepeaterDelayUnit | null;
};
export type Timestamp = RecordOf<TimestampProps>;
export const timestampDefaultValues: TimestampProps = {
  isActive: true,
  year: null,
  month: null,
  day: null,
  dayName: null,
  startHour: null,
  startMinute: null,
  endHour: null,
  endMinute: null,
  repeaterType: null,
  repeaterValue: null,
  repeaterUnit: null,
  delayType: null,
  delayValue: null,
  delayUnit: null,
};
export const makeTimestamp: Record.Factory<TimestampProps> = Record(timestampDefaultValues);

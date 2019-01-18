import { Record } from 'immutable';

type RecordOf<T> = T & Record<T>;

export enum TimestampRepeaterType {
  SingleAdvance = '+',
  AdvanceUntilFuture = '++',
  AdvanceFromNow = '.+',
}

export enum TimestampDelayType {
  StandardDelay = '-',
  FirstOnlyDelay = '--',
}

export enum TimestampRepeaterDelayUnit {
  hour,
  day,
  week,
  month,
  year,
}

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

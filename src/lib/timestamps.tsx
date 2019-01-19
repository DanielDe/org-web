import moment, { Moment } from 'moment';

import {
  TimestampRepeaterType,
  TimestampRepeaterDelayUnit,
  TimestampProps,
  Timestamp,
} from '../types/timestamps';

export const renderAsText = (timestamp: Timestamp) => {
  const {
    isActive,
    year,
    month,
    day,
    dayName,
    startHour,
    startMinute,
    endHour,
    endMinute,
    repeaterType,
    repeaterValue,
    repeaterUnit,
    delayType,
    delayValue,
    delayUnit,
  } = timestamp;

  let timestampText = '';
  timestampText += isActive ? '<' : '[';
  timestampText += `${year}-${month}-${day}`;
  timestampText += !!dayName ? ` ${dayName}` : '';
  timestampText += !!startHour ? ` ${startHour}:${startMinute}` : '';
  timestampText += !!endHour ? `-${endHour}:${endMinute}` : '';
  timestampText += repeaterType !== null ? ` ${repeaterType}${repeaterValue}${repeaterUnit}` : '';
  timestampText += delayType !== null ? ` ${delayType}${delayValue}${delayUnit}` : '';
  timestampText += isActive ? '>' : ']';

  return timestampText;
};

export const getCurrentTimestamp = ({ isActive = true, withStartTime = false } = {}) => {
  const time = moment();

  const timestamp: TimestampProps = {
    isActive,
    year: time.format('YYYY'),
    month: time.format('MM'),
    day: time.format('DD'),
    dayName: time.format('ddd'),
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

  if (withStartTime) {
    timestamp.startHour = time.format('HH');
    timestamp.startMinute = time.format('mm');
  }

  return timestamp;
};

// TODO: update references.
export const getCurrentTimestampAsText = () => `<${moment().format('YYYY-MM-DD ddd')}>`;

// TODO: update references to this to pass in a Timestamp record.
export const momentDateForTimestamp = (timestamp: Timestamp) => {
  const { year, month, day, startHour, startMinute } = timestamp;

  let timestampString = `${year}-${month}-${day}`;
  if (!!startHour && !!startMinute) {
    timestampString += ` ${startHour.padStart(2, '0')}:${startMinute}`;
  }

  return moment(timestampString);
};

// TODO: update references
export const momentUnitForTimestampUnit = (timestampUnit: TimestampRepeaterDelayUnit): string => {
  switch (timestampUnit) {
    case TimestampRepeaterDelayUnit.hour:
      return 'hours';
    case TimestampRepeaterDelayUnit.day:
      return 'days';
    case TimestampRepeaterDelayUnit.week:
      return 'weeks';
    case TimestampRepeaterDelayUnit.month:
      return 'months';
    case TimestampRepeaterDelayUnit.year:
      return 'years';
  }
};

// TODO: update references
export const applyRepeater = (timestamp: Timestamp, currentDate: Moment): Timestamp => {
  if (
    timestamp.repeaterType === null ||
    timestamp.repeaterUnit === null ||
    timestamp.repeaterValue === null
  ) {
    return timestamp;
  }

  const momentUnit = momentUnitForTimestampUnit(timestamp.repeaterUnit);

  const newDate = (() => {
    switch (timestamp.repeaterType) {
      case TimestampRepeaterType.SingleAdvance:
        return momentDateForTimestamp(timestamp).add(
          timestamp.repeaterValue,
          momentUnit as moment.unitOfTime.DurationConstructor
        );
      case TimestampRepeaterType.AdvanceUntilFuture:
        let tempDate = momentDateForTimestamp(timestamp).add(
          timestamp.repeaterValue,
          momentUnit as moment.unitOfTime.DurationConstructor
        );
        while (tempDate < currentDate) {
          tempDate = tempDate.add(
            timestamp.repeaterValue,
            momentUnit as moment.unitOfTime.DurationConstructor
          );
        }
        return tempDate;
      case TimestampRepeaterType.AdvanceFromNow:
        return currentDate
          .clone()
          .add(timestamp.repeaterValue, momentUnit as moment.unitOfTime.DurationConstructor);
        break;
    }
  })();

  timestamp = timestamp
    .set('day', newDate.format('DD'))
    .set('dayName', newDate.format('ddd'))
    .set('month', newDate.format('MM'))
    .set('year', newDate.format('YYYY'));

  if (timestamp.startHour !== undefined && timestamp.startHour !== null) {
    timestamp = timestamp
      .set('startHour', newDate.format('HH'))
      .set('startMinute', newDate.format('mm'));
  }

  return timestamp;
};

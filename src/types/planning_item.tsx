import { Record } from 'immutable';

import RecordOf from './record_of';

import { Timestamp, makeTimestamp } from './timestamps';

export enum PlanningItemType {
  DEADLINE = 'DEADLINE',
  SCHEDULED = 'SCHEDULED',
  CLOSED = 'CLOSED',
}
export const planningItemTypeForStringType = (stringType?: string): PlanningItemType | null => {
  switch (stringType) {
    case 'DEADLINE':
      return PlanningItemType.DEADLINE;
    case 'SCHEDULED':
      return PlanningItemType.SCHEDULED;
    case 'CLOSED':
      return PlanningItemType.CLOSED;
    default:
      return null;
  }
};

export interface PlanningItemProps {
  id: number;
  type: PlanningItemType;
  timestamp: Timestamp;
}
export type PlanningItem = RecordOf<PlanningItemProps>;

const defaultPlanningItemProps: PlanningItemProps = {
  id: 0,
  type: PlanningItemType.DEADLINE,
  timestamp: makeTimestamp(),
};
export const makePlanningItem: Record.Factory<PlanningItemProps> = Record(defaultPlanningItemProps);

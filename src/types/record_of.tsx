import { Record } from 'immutable';

type RecordOf<T> = T & Record<T>;
export default RecordOf;

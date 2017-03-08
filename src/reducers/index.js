import org from './org';
import dropbox from './dropbox';
import base from './base';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
  org, dropbox, base
});
export default rootReducer;

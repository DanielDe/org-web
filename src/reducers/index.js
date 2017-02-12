import org from './org';
import dropbox from './dropbox';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
    org, dropbox
});
export default rootReducer;

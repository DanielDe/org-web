import { combineReducers } from 'redux';
import undoable, { includeAction } from 'redux-linear-undo';

import baseReducer from './base';
import syncBackendReducer from './sync_backend';
import orgReducer from './org';
import captureReducer from './capture';

const UNDOABLE_ACTIONS = [
  'ADD_HEADER',
  'REMOVE_HEADER',
  'MOVE_HEADER_UP',
  'MOVE_HEADER_DOWN',
  'MOVE_HEADER_LEFT',
  'MOVE_HEADER_RIGHT',
  'MOVE_SUBTREE_LEFT',
  'MOVE_SUBTREE_RIGHT',
  'ADVANCE_TODO_STATE',
  'EDIT_HEADER_TITLE',
  'EDIT_HEADER_DESCRIPTION',
  'NO_OP',
  'ADD_NEW_TABLE_ROW',
  'ADD_NEW_TABLE_COLUMN',
  'MOVE_TABLE_ROW_DOWN',
  'MOVE_TABLE_ROW_UP',
  'MOVE_TABLE_COLUMN_LEFT',
  'MOVE_TABLE_COLUMN_RIGHT',
  'ADD_NEW_LIST_ITEM',
  'REMOVE_LIST_ITEM',
  'MOVE_LIST_ITEM_UP',
  'MOVE_LIST_ITEM_DOWN',
  'MOVE_LIST_ITEM_LEFT',
  'MOVE_LIST_ITEM_RIGHT',
  'MOVE_LIST_SUBTREE_LEFT',
  'MOVE_LIST_SUBTREE_RIGHT',
  'INSERT_CAPTURE',
];

export default combineReducers({
  base: baseReducer,
  syncBackend: syncBackendReducer,
  org: undoable(orgReducer, {
    filter: includeAction(UNDOABLE_ACTIONS),
    linearizeHistory: true,
  }),
  capture: captureReducer,
});

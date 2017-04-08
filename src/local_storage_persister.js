/* globals localStorage */
import Immutable from 'immutable';

// Read initial state from localStorage.
export const readInitialState = () => {
  let initialState = {
    org: Immutable.fromJS({}),
    dropbox: Immutable.fromJS({})
  };

  const fields = [
    {
      category: 'org',
      name: 'showingColoredHeaders',
      type: 'boolean'
    },
    {
      category: 'org',
      name: 'filePath',
      type: 'nullable'
    },
    {
      category: 'dropbox',
      name: 'liveSync',
      type: 'boolean'
    },
    {
      category: 'dropbox',
      name: 'dropboxAccessToken',
      type: 'nullable'
    }
  ];

  fields.forEach(field => {
    let value = localStorage.getItem(field.name);
    if (field.type === 'nullable') {
      if (value === 'null') {
        value = null;
      }
    } else if (field.type === 'boolean') {
      value = value === 'true';
    }
    initialState[field.category] = initialState.org.set(field.name, value);
  });

  return initialState;
};

// Persist some fields to localStorage;
export const subscribeToChanges = storeInstance => {
  return () => {
    const state = storeInstance.getState();

    ['showingColoredHeaders', 'filePath'].forEach(field => {
      localStorage.setItem(field, state.org.get(field));
    });
    ['liveSync', 'dropboxAccessToken'].forEach(field => {
      localStorage.setItem(field, state.dropbox.get(field));
    });
  };
};

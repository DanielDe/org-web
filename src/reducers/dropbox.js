/* globals localStorage */
import Immutable from 'immutable';

export default (state = new Immutable.Map(), payload) => {
  if (state.get('currentDirectoryListing') === undefined) {
    state = state.set('currentDirectoryListing', new Immutable.List());
  }

  switch (payload.type) {
  case 'setDirectoryListing':
    state = state.set('currentDirectoryPath', payload.directoryPath);
    return state.set('currentDirectoryListing', Immutable.fromJS(payload.directoryListing));
  case 'authenticate':
    localStorage.setItem('dropboxAccessToken', payload.accessToken);
    return state.set('dropboxAccessToken', payload.accessToken);
  case 'unauthenticate':
    localStorage.setItem('dropboxAccessToken', '');
    return state.set('dropboxAccessToken', null);
  case 'setLiveSync':
    localStorage.setItem('liveSyncToDropbox', payload.liveSync);
    return state.set('liveSync', payload.liveSync);
  default:
    return state;
  }
};

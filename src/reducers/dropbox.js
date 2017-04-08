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
    return state.set('dropboxAccessToken', payload.accessToken);
  case 'unauthenticate':
    return state.set('dropboxAccessToken', null).set('filePath', null);
  case 'setLiveSync':
    return state.set('liveSync', payload.liveSync);
  default:
    return state;
  }
};

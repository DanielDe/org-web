import Immutable from 'immutable';

export default (state = new Immutable.Map(), payload) => {
  if (state.get('files') === undefined) {
    state = state.set('files', new Immutable.List());
  }

  switch (payload.type) {
  case 'addFile':
    const newFile = Immutable.fromJS({
      id: payload.fileId,
      name: payload.filename,
      path: payload.path
    });
    return state.update('files', files => files.push(newFile));
  case 'selectFile':
    return state.update('files', files => {
      return files.update(files.findIndex(file => file.get('id') === payload.fileId),
                          file => file.set('selected', !file.get('selected')));
    });
  case 'authenticate':
    return state.set('dropboxAccessToken', payload.accessToken);
  default:
    return state;
  }
};

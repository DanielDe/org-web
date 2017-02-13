/* globals Dropbox, FileReader */
import { displayFile } from './org';

export const addFile = (filename, fileId, path) => {
  return {
    type: 'addFile',
    filename,
    fileId,
    path
  };
};

export const downloadFile = (filePath) => {
  return (dispatch, getState) => {
    const dropbox = new Dropbox({ accessToken: getState().dropbox.get('dropboxAccessToken') });

    dropbox.filesDownload({ path: filePath }).then(response => {
      const reader = new FileReader();
      reader.addEventListener('loadend', () => {
        const contents = reader.result;
        dispatch(displayFile(contents));
      });
      reader.readAsText(response.fileBlob);
    });
  };
};

export const authenticate = (accessToken) => {
  return {
    type: 'authenticate',
    accessToken
  };
};

export const getFileList = (path = '') => {
  return (dispatch, getState) => {
    const dropbox = new Dropbox({ accessToken: getState().dropbox.get('dropboxAccessToken') });

    dropbox.filesListFolder({ path }).then(response => {
      response.entries.forEach(entry => {
        let name = entry.name;
        if (entry['.tag'] === 'folder') {
          name += '/';
        }

        dispatch(addFile(name, entry.id, entry.path_display));
      });
    }).catch(error => {
      console.error('There was an error retriving files!');
      console.error(error);
    });
  };
};

/* globals Dropbox, FileReader */
import { displayFile, stopDisplayingFile, setDirty } from './org';
import { setLoadingMessage } from './base';
import exportOrg from '../export_org';

export const downloadFile = (filePath) => {
  return (dispatch, getState) => {
    const dropbox = new Dropbox({ accessToken: getState().dropbox.get('dropboxAccessToken') });

    dispatch(setLoadingMessage('Downloading file...'));
    dropbox.filesDownload({ path: filePath }).then(response => {
      const reader = new FileReader();
      reader.addEventListener('loadend', () => {
        const contents = reader.result;
        dispatch(displayFile(contents, filePath));
        dispatch(setLoadingMessage(null));
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

export const unauthenticate = () => {
  return {
    type: 'unauthenticate'
  };
};

export const setLiveSync = (liveSync) => {
  return {
    type: 'setLiveSync',
    liveSync
  };
};

export const signOut = () => {
  return (dispatch, getState) => {
    dispatch(stopDisplayingFile());
    dispatch(unauthenticate());
  };
};

export const setDirectoryListing = (directoryPath, directoryListing) => {
  return {
    type: 'setDirectoryListing',
    directoryPath,
    directoryListing
  };
};

export const getFileList = (path = '') => {
  return (dispatch, getState) => {
    const dropbox = new Dropbox({ accessToken: getState().dropbox.get('dropboxAccessToken') });

    dispatch(setLoadingMessage('Getting listing...'));
    dropbox.filesListFolder({ path }).then(response => {
      const directoryListing = response.entries.map(entry => {
        return {
          id: entry.id,
          name: entry.name,
          directory: entry['.tag'] === 'folder',
          path: entry.path_display
        };
      });

      dispatch(setDirectoryListing(path, directoryListing));
      dispatch(setLoadingMessage(null));
    }).catch(error => {
      console.error('There was an error retriving files!');
      console.error(error);
    });
  };
};

export const push = (filePath) => {
  return (dispatch, getState) => {
    const contents = exportOrg(getState().org.get('parsedFile'));

    dispatch(setLoadingMessage('Pushing...'));
    const dropbox = new Dropbox({ accessToken: getState().dropbox.get('dropboxAccessToken') });
    dropbox.filesUpload({
      path: filePath + '.reactorg-bak',
      contents: getState().org.get('fileContents'),
      mode: {
        '.tag': 'overwrite'
      },
      autorename: true
    }).then(() => {
      dropbox.filesUpload({
        path: filePath,
        contents: contents,
        mode: {
          '.tag' : 'overwrite'
        },
        autorename: true
      }).then(response => {
        dispatch(setDirty(false));
        dispatch(setLoadingMessage(null));
      }).catch(error => {
        alert(`There was an error pushing the file: ${error}`);
      });
    });
  };
};

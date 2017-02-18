/* globals Dropbox, FileReader */
import { displayFile } from './org';
import exportOrg from '../export_org';

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
        dispatch(displayFile(contents, filePath));
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

export const push = (filePath) => {
  return (dispatch, getState) => {
    const contents = exportOrg(getState().org.get('parsedFile'));

    const dropbox = new Dropbox({ accessToken: getState().dropbox.get('dropboxAccessToken') });
    dropbox.filesUpload({
      path: filePath,
      contents: contents,
      mode: {
        '.tag' : 'overwrite'
      },
      autorename: true
    }).then(response => {
      console.log('File pushed!');
    }).catch(error => {
      console.error('There was an error pushing the file!');
      console.error(error);
    });
  };
};

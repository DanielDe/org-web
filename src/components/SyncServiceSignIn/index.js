/* global process, gapi, google */

import React, { PureComponent } from 'react';

import './stylesheet.css';

import DropboxLogo from './dropbox.svg';
import GoogleDriveLogo from './google_drive.png';

import { persistField } from '../../util/settings_persister';

import { Dropbox } from 'dropbox';

import _ from 'lodash';

export default class SyncServiceSignIn extends PureComponent {
  constructor(props) {
    super(props);

    _.bindAll(this, ['handleDropboxClick', 'handleGoogleDriveClick']);
  }

  handleDropboxClick() {
    persistField('authenticatedSyncService', 'Dropbox');

    const dropbox = new Dropbox({ clientId: process.env.REACT_APP_DROPBOX_CLIENT_ID, fetch });
    const authURL = dropbox.getAuthenticationUrl(window.location.origin + '/');
    window.location = authURL;
  }

  handleGoogleDriveClick() {
    try {
      gapi.load('client', () => {
        window.gapi.client
          .init({
            apiKey: process.env.REACT_APP_GOOGLE_DRIVE_API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          })
          .then(async () => {
            const tokenClient = google.accounts.oauth2.initTokenClient({
              client_id: process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_ID,
              scope: 'https://www.googleapis.com/auth/drive.file',
              callback: (accessToken) => {
                persistField('authenticatedSyncService', 'Google Drive');
                persistField('googleDriveAccessToken', JSON.stringify(accessToken));
                window.location.reload();
              },
            });
            tokenClient.requestAccessToken({ prompt: 'consent' });
          });
      });
    } catch (error) {
      alert(
        `The Google Drive API client isn't available - you might be blocking it with an ad blocker`
      );
      return;
    }
  }

  render() {
    return (
      <div className="sync-service-sign-in-container">
        <p className="sync-service-sign-in__help-text">
          org-web syncs your files with Dropbox or Google Drive. Choose your preferred sync backend
          below to sign in.
        </p>

        <div className="sync-service-container" onClick={this.handleDropboxClick}>
          <img src={DropboxLogo} alt="Dropbox logo" className="dropbox-logo" />
        </div>

        <div className="sync-service-container" onClick={this.handleGoogleDriveClick}>
          <img src={GoogleDriveLogo} alt="Google Drive logo" className="google-drive-logo" />
        </div>
      </div>
    );
  }
}

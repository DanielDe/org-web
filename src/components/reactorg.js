/* globals Dropbox */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dropboxActions from '../actions/dropbox';
import * as orgActions from '../actions/org';
import FileChooser from './file_chooser';
import OrgFile from './org_file';
import parseQueryString from '../parse_query_string';

class Reactorg extends Component {
  constructor(props) {
    super(props);
    this.authenticateWithDropbox = this.authenticateWithDropbox.bind(this);
    this.handlePushToDropbox = this.handlePushToDropbox.bind(this);
    this.handleBackToFileChooser = this.handleBackToFileChooser.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);

    this.state = {};
  }

  componentDidMount() {
    const accessToken = parseQueryString(window.location.hash).access_token;
    if (accessToken) {
      this.props.actions.authenticate(accessToken);
      window.location.hash = '';
    } else {
      const accessToken = localStorage.getItem('dropboxAccessToken');
      if (accessToken) {
        this.props.actions.authenticate(accessToken);
      }
    }

    const filePath = localStorage.getItem('filePath');
    if (filePath) {
      this.props.actions.downloadFile(filePath);
    }
  }

  authenticateWithDropbox() {
    const dropbox = new Dropbox({ clientId: 'hw7j3cwzcg3r5mn' });
    const authUrl = dropbox.getAuthenticationUrl(window.location.href);
    window.location = authUrl;
  }

  handlePushToDropbox() {
    this.props.actions.push(this.props.filePath);
  }

  handleBackToFileChooser() {
    this.props.orgActions.stopDisplayingFile();
  }

  handleSignOut() {
    this.props.actions.signOut();
  }

  render() {
    const signOutButton = (
      <button onClick={() => this.handleSignOut()} className="btn">Sign out</button>
    );

    if (this.props.fileContents) {
      return (
        <div style={{ margin: 5 }}>
          <OrgFile />
          <button onClick={() => this.handlePushToDropbox()}
                  style={{marginTop: 20}}
                  className="btn">Push to Dropbox</button>
          <br />
          <br />
          <button onClick={() => this.handleBackToFileChooser()}
                  className="btn">Back to file chooser</button>
          <br />
          <br />
          {signOutButton}
        </div>
      );
    } else {
      if (this.props.dropboxAccessToken) {
        return (
          <div>
            <FileChooser />
            {signOutButton}
          </div>
        );
      } else {
        return (
          <div className="dropbox-authenticate">
            <h3 className="dropbox-authenticate__header">Authenticate with Dropbox</h3>
            <br />
            <button className="btn" onClick={() => this.authenticateWithDropbox()}>Authenticate</button>
          </div>
        );
      }
    }
  }
}

function mapStateToProps(state, props) {
  return {
    dropboxAccessToken: state.dropbox.get('dropboxAccessToken'),
    fileContents: state.org.get('fileContents'),
    filePath: state.org.get('filePath')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(dropboxActions, dispatch),
    orgActions: bindActionCreators(orgActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Reactorg);

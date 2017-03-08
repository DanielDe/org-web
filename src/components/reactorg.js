/* globals Dropbox */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dropboxActions from '../actions/dropbox';
import * as orgActions from '../actions/org';
import * as baseActions from '../actions/base';
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
    this.viewSampleFile = this.viewSampleFile.bind(this);
    this.exitSampleMode = this.exitSampleMode.bind(this);

    this.state = {};
  }

  componentDidMount() {
    const accessToken = parseQueryString(window.location.hash).access_token;
    if (accessToken) {
      this.props.dropboxActions.authenticate(accessToken);
      window.location.hash = '';
    } else {
      const accessToken = localStorage.getItem('dropboxAccessToken');
      if (accessToken) {
        this.props.dropboxActions.authenticate(accessToken);
      }
    }

    const filePath = localStorage.getItem('filePath');
    if (filePath) {
      this.props.dropboxActions.downloadFile(filePath);
    }
  }

  authenticateWithDropbox() {
    const dropbox = new Dropbox({ clientId: 'hw7j3cwzcg3r5mn' });
    const authUrl = dropbox.getAuthenticationUrl(window.location.href);
    window.location = authUrl;
  }

  handlePushToDropbox() {
    this.props.dropboxActions.push(this.props.filePath);
  }

  handleBackToFileChooser() {
    this.props.orgActions.stopDisplayingFile();
  }

  handleSignOut() {
    this.props.dropboxActions.signOut();
  }

  viewSampleFile() {
    const sampleFileContents = "\n* This is a top level header\nHere is the contents of the top level header.\n** This is a subheader\n** Todos\n*** TODO Todo item 1\n*** DONE Todo item 2\nCLOSED: [2017-03-06 Mon 21:30]\n*** TODO Todo item 3\n* This is another top level header\n** Tags                                                          :tag1:tag2:\nTags aren't natively supported, but Org mode is text based, so you can still edit tags yourself!\n";
    this.props.orgActions.displaySample(sampleFileContents);
  }

  exitSampleMode() {
    this.props.orgActions.exitSampleMode();
  }

  render() {
    let loadingIndicator = '';
    if (this.props.loadingMessage) {
      loadingIndicator = (
        <div className="loading-indicator">{this.props.loadingMessage}</div>
      );
    }

    const signOutButton = (
      <button onClick={() => this.handleSignOut()} className="btn">Sign out</button>
    );

    const nonSampleModeButtons = (
      <div>
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

    const exitSampleButton = (
      <div>
        <br />
        <br />
        <button onClick={() => this.exitSampleMode()} className="btn">Exit sample</button>
      </div>
    );

    const trailingContents = this.props.sampleMode ? exitSampleButton : nonSampleModeButtons;

    if (this.props.fileContents) {
      return (
        <div style={{ margin: 5 }}>
          {loadingIndicator}
          <OrgFile />
          {trailingContents}
        </div>
      );
    } else {
      if (this.props.dropboxAccessToken) {
        return (
          <div>
            {loadingIndicator}
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
            <br />
            <br />
            <button className="btn" onClick={() => this.viewSampleFile()}>View sample file</button>
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
    filePath: state.org.get('filePath'),
    sampleMode: state.org.get('sampleMode'),
    loadingMessage: state.base.get('loadingMessage')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dropboxActions: bindActionCreators(dropboxActions, dispatch),
    orgActions: bindActionCreators(orgActions, dispatch),
    baseActions: bindActionCreators(baseActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Reactorg);

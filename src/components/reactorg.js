/* globals Dropbox */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dropboxActions from '../actions/dropbox';
import FileChooser from './file_chooser';
import OrgFile from './org_file';
import parseQueryString from '../parse_query_string';

class Reactorg extends Component {
  constructor(props) {
    super(props);
    this.authenticateWithDropbox = this.authenticateWithDropbox.bind(this);
    this.handlePushToDropbox = this.handlePushToDropbox.bind(this);

    this.state = {};
  }

  componentDidMount() {
    const accessToken = parseQueryString(window.location.hash).access_token;
    if (accessToken) {
      this.props.actions.authenticate(accessToken);
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

  render() {
    if (this.props.fileContents) {
      return (
        <div style={{ margin: 5 }}>
          <OrgFile />
          <button onClick={() => this.handlePushToDropbox()}
                  style={{marginTop: 20}}
                  className="btn">Push to Dropbox</button>
        </div>
      );
    } else {
      if (this.props.dropboxAccessToken) {
        return (
          <FileChooser />
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
    actions: bindActionCreators(dropboxActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Reactorg);

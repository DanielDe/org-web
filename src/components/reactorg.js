import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dropboxActions from '../actions/dropbox';
import FileList from './file_list';
import OrgFile from './org_file';

class Reactorg extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.authenticateWithDropbox = this.authenticateWithDropbox.bind(this);

    // TODO: Remove this.
    this.authenticateWithDropbox();
    this.props.actions.downloadFile('/test.org');
  }

  authenticateWithDropbox() {
    const accessToken = 'xjL5YiLomCoAAAAAAAAFHzssa4Ru2ehTY02jjuH3_1f0JrRNV8fP-Q1ScH_I9rcR';
    this.props.actions.authenticate(accessToken);
  }

  render() {
    if (this.props.fileContents) {
      return (
        <div style={{ margin: 5 }}>
          <OrgFile />
        </div>
      );
    } else {
      if (this.props.dropboxAccessToken) {
        return (
          <FileList />
        );
      } else {
        return (
          <div>
            You need to authenticate with Dropbox
            <br />
            <button onClick={() => this.authenticateWithDropbox()}>Authenticate</button>
          </div>
        );
      }
    }
  }
}

function mapStateToProps(state, props) {
  return {
    dropboxAccessToken: state.dropbox.get('dropboxAccessToken'),
    fileContents: state.org.get('fileContents')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(dropboxActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Reactorg);

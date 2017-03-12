import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dropboxActions from '../actions/dropbox';

class Settings extends Component {
  constructor(props) {
    super(props);

    this.handleLiveSyncClick = this.handleLiveSyncClick.bind(this);
  }

  handleLiveSyncClick() {
    this.props.dropboxActions.setLiveSync(!this.props.liveSyncToDropbox);
  }

  render() {
    let liveSyncText = '';
    let liveSyncButtonText = '';
    if (this.props.liveSyncToDropbox) {
      liveSyncText = 'Currently live syncing';
      liveSyncButtonText = 'Disable';
    } else {
      liveSyncText = 'Not currently live syncing';
      liveSyncButtonText = 'Enable';
    }

    const settingStyle = {
      display: 'flex',
      alignItems: 'center',
      margin: 10
    };
    const textStyle = {
      marginLeft: 10
    };
    const buttonStyle = {
      width: 90
    };
    return (
      <div>
        <div style={settingStyle}>
          <button className="btn"
                  style={buttonStyle}
                  onClick={() => this.handleLiveSyncClick()}>{liveSyncButtonText}</button>
          <div style={textStyle}>{liveSyncText}</div>
        </div>

        <button style={{margin: 10}}
                className="btn"
                onClick={() => this.props.settingsClose()}>Close</button>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    liveSyncToDropbox: state.dropbox.get('liveSync')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dropboxActions: bindActionCreators(dropboxActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);

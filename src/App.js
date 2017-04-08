/* globals localStorage */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dropboxActions from './actions/dropbox';
import * as orgActions from './actions/org';
import logo from './org-web.svg';
import './App.css';
import './stylesheets/normalize.css';
import './stylesheets/base.css';
import './stylesheets/org.css';
import './stylesheets/dropbox.css';
import OrgWeb from './components/org_web';
import Settings from './components/settings';
import parseQueryString from './parse_query_string';

class App extends Component {
  constructor(props) {
    super(props);
    this.handleSettingsClick = this.handleSettingsClick.bind(this);
    this.handleSettingsClose = this.handleSettingsClose.bind(this);

    this.state = {
      showingSettings: false
    };
  }

  componentDidMount() {
    const accessToken = parseQueryString(window.location.hash).access_token;
    if (accessToken) {
      this.props.dropboxActions.authenticate(accessToken);
      window.location.hash = '';
    } else {
      const accessToken = this.props.dropboxAccessToken;
      if (accessToken) {
        this.props.dropboxActions.authenticate(accessToken);
      }
    }

    if (this.props.filePath) {
      this.props.dropboxActions.downloadFile(this.props.filePath);
    }
  }

  handleSettingsClick() {
    this.setState({ showingSettings: !this.state.showingSettings });
  }

  handleSettingsClose() {
    this.setState({ showingSettings: false });
  }

  render() {
    let mainComponent = <OrgWeb />;
    if (this.state.showingSettings) {
      mainComponent = <Settings settingsClose={() => this.handleSettingsClose()} />;
    }

    return (
      <div>
        <div className="app-header">
          <img className="logo" src={logo} alt="Logo" />
          <h2 className="app-header__title">org-web</h2>
          <div style={{marginLeft: 'auto', color: 'white'}} onClick={() => this.handleSettingsClick()}>
            <i className="fa fa-cogs"></i>
          </div>
        </div>

        {mainComponent}
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    filePath: state.org.get('filePath'),
    dropboxAccessToken: state.dropbox.get('dropboxAccessToken')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dropboxActions: bindActionCreators(dropboxActions, dispatch),
    orgActions: bindActionCreators(orgActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

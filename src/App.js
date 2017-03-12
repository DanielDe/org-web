import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './stylesheets/normalize.css';
import './stylesheets/base.css';
import './stylesheets/org.css';
import './stylesheets/dropbox.css';
import Reactorg from './components/reactorg';
import Settings from './components/settings';

class App extends Component {
  constructor(props) {
    super(props);
    this.handleSettingsClick = this.handleSettingsClick.bind(this);
    this.handleSettingsClose = this.handleSettingsClose.bind(this);

    this.state = {
      showingSettings: false
    };
  }

  handleSettingsClick() {
    this.setState({ showingSettings: !this.state.showingSettings });
  }

  handleSettingsClose() {
    this.setState({ showingSettings: false });
  }

  render() {
    let mainComponent = <Reactorg />;
    if (this.state.showingSettings) {
      mainComponent = <Settings settingsClose={() => this.handleSettingsClose()} />;
    }

    return (
      <div>
        <div className="app-header">
          <img className="logo" src={logo} alt="Logo" />
          <h2 className="app-header__title">Reactorg</h2>
          <div style={{marginLeft: 'auto', color: 'white'}} onClick={() => this.handleSettingsClick()}>
            <i className="fa fa-cogs"></i>
          </div>
        </div>

        {mainComponent}
      </div>
    );
  }
}

export default App;

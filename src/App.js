import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './stylesheets/normalize.css';
import './stylesheets/base.css';
import './stylesheets/org.css';
import './stylesheets/dropbox.css';
import Reactorg from './components/reactorg';

class App extends Component {
  render() {
    return (
      <div>
        <div className="app-header">
          <img className="logo" src={logo} alt="Logo" />
          <h2 className="app-header__title">Reactorg</h2>
        </div>

        <Reactorg />
      </div>
    );
  }
}

export default App;

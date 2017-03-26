import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { Provider } from 'react-redux';
import Store from './store';

const StoreInstance = Store();

ReactDOM.render(
    <Provider store={StoreInstance}>
      <App />
    </Provider>,
    document.getElementById('root')
);

// Disable double tap to zoom.
window.lastTouchEnd = 0;
document.documentElement.addEventListener('touchend', event => {
  const now = (new Date()).getTime();
  if (now - window.lastTouchEnd <= 350) {
    event.preventDefault();
    event.target.click();
  }
  window.lastTouchEnd = now;
}, false);

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import './index.css';
import AppContainer from './AppContainer';
import registerServiceWorker from './registerServiceWorker';


let t = 0;
window.dispatch = store.dispatch;

ReactDOM.render(
  <Provider store={store}>
    <AppContainer time={t++}/>
  </Provider>,
  document.getElementById('root'),
);

registerServiceWorker();

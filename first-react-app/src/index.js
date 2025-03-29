import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Global from './Global';
import AdditionalHeader from './AdditionalHeader';
import reportWebVitals from './reportWebVitals';

const global = ReactDOM.createRoot(document.getElementById('global'));
global.render(
  <React.StrictMode>
    <Global />
  </React.StrictMode>
);
reportWebVitals();

const additionalHeader = ReactDOM.createRoot(document.getElementById('additionalHeader'));
additionalHeader.render(
  <React.StrictMode>
    <AdditionalHeader />
  </React.StrictMode>
);
reportWebVitals();
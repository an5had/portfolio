import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
// Caveat (handwriting on the hero's sticky notes), self-hosted; the browser only fetches the
// latin woff2 it needs via unicode-range.
import '@fontsource/caveat/600.css';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

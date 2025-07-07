// pages/main.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './Mint';
import { createRoot } from 'react-dom/client';
import Deploy from './Deploy';


const container = document.getElementById('app');
const root = createRoot(container);
root.render(<Deploy />);

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';
import { BridgeProvider } from './BridgeProvider';

import './index.css';

ReactDOM.render(
    <BridgeProvider>
        <Router>
            <App/>
        </Router>
    </BridgeProvider>,
    document.getElementById('root')
);

import React from 'react';
import { Switch, Route } from 'react-router-dom';

import HomePage from './HomePage'
import AccountDetail from './AccountDetail';


const App = () => {
  return (
    <Switch>
      <Route path='/accounts/:id' component={AccountDetail} />
      <Route path='/' component={HomePage}/>
    </Switch>
  );
};

export default App;

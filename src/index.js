import React from 'react';
import ReactDOM from 'react-dom';
//import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import UserPage from './components/UserPage';
import { Router as BrowserRouter, Switch, Route, Link } from 'react-router-dom';

import {createBrowserHistory} from 'history';
import LogInPage from './components/LogInPage';

const history =  createBrowserHistory();
const routing = (
    <BrowserRouter history={history}>
        <div>
            <Switch>
                <Route path="/" component={App}/>
                <Route path="/login" component={LogInPage}/>
                <Route path="/user" component={UserPage} />

            </Switch>
        </div>
    </BrowserRouter>
)

ReactDOM.render(routing, document.getElementById('root'));

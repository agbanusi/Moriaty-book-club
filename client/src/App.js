import React from 'react'
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import First from './First/First'
import Landing from './Landing/Landing'
import User from './User/User'
import Purchase from './Purchase/Purchase'
import Group from './group/Group'
import Grouproom from   './grouplist/Grouproom'
import Podroom from './Podlist/Podroom'
import Podcast from './podcast/Podcast'
import NotFound from './unfound/NotFound'

function App() {
    return (
        <div>
        <BrowserRouter>
        <Switch>
            <Route exact path='/' component={First} />
            <Route exact path='/home' component={Landing} />
            <Route exact path='/user' component={User} />
            <Route exact path='/purchase' component={Purchase} />
            <Route exact path='/bookclubs' component={Grouproom} />
            <Route exact path='/bookclub' component={Group} />
            <Route exact path='/podcasts' component={Podroom} />
            <Route exact path='/podcast' component={Podcast} />
            <Route component={NotFound} />
        </Switch>
        </BrowserRouter>
        </div>
    )
}

export default App;

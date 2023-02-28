import React, { Component } from 'react'

import BridgeContext from './BridgeProvider'
import { AccountList } from './AccountList'


export default class HomePage extends Component {
    static contextType = BridgeContext;

    state = {
        accounts: [],
        accountsLoaded: false
    };

    async componentDidMount() {
        await this.requestAccounts()
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        const { accountsLoaded } = this.state;

        if (!accountsLoaded) {
            await this.requestAccounts();
        }
    }

    async requestAccounts() {
        const { loadingBridge, pulsarDataRequester } = this.context;
        const { accountsLoaded } = this.state;

        if (accountsLoaded || loadingBridge) return;

        try {
            const accounts = await pulsarDataRequester.getThreeAccounts();
            this.setState({ accountsLoaded: true, accounts })
        } catch (err) {
            console.error(err);
        }
    }

    render() {
        const { loadingBridge }  = this.context;
        const { accounts, accountsLoaded } = this.state;

        if (loadingBridge || !accountsLoaded) {
            return <h1>Loading...</h1>
        }

        return (
            <div>
                <h1>Accounts</h1>
                <AccountList accounts={accounts} />
            </div>
        )
    }
}

import React, { Component } from 'react'

import BridgeContext from './BridgeProvider'
import { AccountCompactLayout } from './AccountCompactLayout';
import { AccountDetailLayout } from './AccountDetailLayout';


export default class AccountDetail extends Component {
    static contextType = BridgeContext;

    state = {
        account: null,
        layoutDetails: {},
        compactLayoutDetails: [],
    };

    async componentDidMount() {
        await this.loadAccountAndLayoutInformation();
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        const { account } = this.state;
        if (!account) {
            await this.loadAccountAndLayoutInformation();
        }
    }

    async loadAccountAndLayoutInformation() {
        const { id } = this.props.match.params;
        const { pulsarDataRequester, loadingBridge } = this.context;

        if (loadingBridge) return;

        try {
            const [ account, layoutDetails, compactLayoutDetails ] = await Promise.all([
                pulsarDataRequester.getAccountById(id),
                pulsarDataRequester.getAccountLayout(),
                pulsarDataRequester.getAccountCompactLayout(),
            ]);
            this.setState({ account, layoutDetails, compactLayoutDetails });
        } catch (err) {
            console.error(err);
        }
    }

    render() {
        const { loadingBridge } = this.context;
        const { account, layoutDetails, compactLayoutDetails } = this.state;

        if (loadingBridge || !account) {
            return <h1>Loading...</h1>
        }

        return (
            <div>
                <AccountCompactLayout account={account} compactLayoutDetails={compactLayoutDetails} />
                <AccountDetailLayout account={account} layoutDetails={layoutDetails} />
            </div>
        )
    }
}

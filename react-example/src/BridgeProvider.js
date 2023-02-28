import React from 'react';

import setUpBridge from './bridgeSetup';
import PulsarDataRequester from './PulsarDataRequester';


const BridgeContext = React.createContext({});

export class BridgeProvider extends React.Component {
    state = {
        pulsarDataRequester: null,
        loadingBridge: true,
    };

    async componentDidMount() {
        this.setState({ loadingBridge: true });
        try {
            const initializedBridge = await setUpBridge;
            const pulsarDataRequester = new PulsarDataRequester(initializedBridge);
            this.setState({
                pulsarDataRequester,
                loadingBridge: false
            });
        } catch (err) {
            console.error(err);
        }
    }

    render() {
        const { children } = this.props;
        const { loadingBridge, pulsarDataRequester } = this.state;
        return (
            <BridgeContext.Provider value={{loadingBridge, pulsarDataRequester}}>
                {children}
            </BridgeContext.Provider>
        )
    }
}

export default BridgeContext

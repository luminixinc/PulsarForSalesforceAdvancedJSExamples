export default class PulsarDataRequester {

    constructor(pulsarBridge) {
        this.bridge = pulsarBridge;
    }

    getThreeAccounts() {
        return new Promise((resolve, reject) => {
            try {
                this.bridge.sendRequest({
                    type: 'select',
                    object: 'Account',
                    data: {
                        query: 'select Id, Name from Account limit 3',
                    },
                }, response => {
                    resolve(response.data);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    getAccountById(id) {
        return new Promise((resolve, reject) => {
            try {
                this.bridge.sendRequest({
                    type: 'read',
                    object: 'Account',
                    data: {
                        Id: id,
                    },
                }, response => {
                    resolve(response.data[0]);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    getAccountLayout() {
        return new Promise((resolve, reject) => {
            try {
                this.bridge.sendRequest({
                    'type': 'getLayout',
                    'object': 'Account',
                    'data': {
                        RecordTypeId: '012000000000000AAA', // Master Record Type ID
                    }
                }, response => {
                    const describeLayout = JSON.parse(response.data);
                    resolve(describeLayout);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    getAccountCompactLayout() {
        return new Promise((resolve, reject) => {
            try {
                this.bridge.sendRequest({
                    'type': 'getCompactLayoutFields',
                    'object': 'Account',
                    'data': {
                        ObjectType: 'Account',
                        RecordTypeId: '012000000000000AAA', // Master Record Type ID
                    }
                }, response => {
                    resolve(response.data);
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}

/* *********************************
 * Bridge initialization
 * *********************************/

const setUpBridge = new Promise((resolve, reject) => {
    document.addEventListener('WebViewJavascriptBridgeReady', function(event) {

        bridge.init(event.bridge);

        /* Note: If we are receiving this event, window.pulsar is undefined */
        window.pulsar = {};
        window.pulsar.bridge = event.bridge; // save initial bridge (for propagation to other pages)

        /* !!!! IMPORTANT !!!!
         * The bridge has been initialized and your app is ready for launch.
         */
        resolve(bridge);
    }, false);

    /* ******************************
     * BEGIN Pulsar onload definition
     * ******************************/
    const runningEmbedded = (window.top !== window.self);
    window.onload = function() {

        if (runningEmbedded && window.parent.pulsar && window.parent.pulsar.bridge) {

            /* ************************************************************
             * If the above is true, we are running in an embedded state.
             * In this case, the above registered event listener will never
             * fire as the webview we are running in already has
             * established a Pulsar JS bridge.
             * ************************************************************/
            window.pulsar = window.parent.pulsar; // ensure we will pass down the embedded window.pulsar
            console.assert(window.pulsar.bridge !== undefined);
            reject('Couldn\'t set up bridge: window.pulsar.bridge is undefined, but it should be present.');
            bridge.setup(window.pulsar.bridge);

            /* At this point we have the correct Pulsar JS Bridge object from the window itself.
             * Start your app! */
            resolve(bridge);
        } else {
            if (runningEmbedded) {
                /* ************************************************************
                 * Something has gone wrong if we are running embedded and find
                 * ourselves without a window.parent.pulsar.bridge or
                 * window.parent.pulsar object.
                 * ************************************************************/
                console.log('OOPS, running embedded, but no window.parent.pulsar.bridge!');
                reject('Couldn\'t set up bridge: running embedded, but no window.parent.pulsar.bridge!');
            } else {
                /* ************************************************************
                 * Otherwise we are running in a stand-alone state in our own
                 * webview context. The Pulsar JS bridge will be established by
                 * the event listener above. So we do nothing here.
                 * ************************************************************/
            }
        }
    };
});

/* ******************************
 * BEGIN Pulsar bridge definition
 * ******************************/
var BRIDGE_ON = true; // set to false to test file in desktop browser

export var bridge = function() {

    var jsbridge;
    var _bridge = {};

    /** **************************************************************
     *  Sends a request (object containing type,
     *  object, and data properties) across the JS Bridge,
     *  and results are delivered to the callback function
     *  @param {object} request data
     *  @param {function} callback result function (called asynchronously)
     * ***************************************************************/
    _bridge.sendRequest = function(request, callbackFn) {
        try {
            if (BRIDGE_ON) {
                jsbridge.send(request, callbackFn);
            } else {
                callbackFn({});
            }
        } catch (err) {
            alert('Javascript-App bridge error: ' + err);
        }
    };

    /** **************************************************************
     * Add a handler for a particular notification
     * @param {string} handlerName name of notification
     * @param {function} handlerFn function called for notification
     * ***************************************************************/
    _bridge.addHandler = function(handlerName, handlerFn) {
        jsbridge.registerHandler(handlerName, handlerFn);
    };

    /** **************************************************************
     * Remove handler for a particular notification
     * @param {string} handlerName name of notification
     * ***************************************************************/
    _bridge.removeHandler = function(handlerName) {
        jsbridge.deregisterHandler(handlerName);
    };

    /** **************************************************************
     * Initializes the JS Bridge.
     * This should only be called once.
     * @param {WebViewJavascriptBridge} _jsbridge the bridge
     * ***************************************************************/
    _bridge.init = function(_jsbridge) {
        if (BRIDGE_ON) {
            _jsbridge.init(function(message, responseCallback) {
                console.log('Received message: ' + message);
            });

            jsbridge = _jsbridge;
        }
    };

    /** **************************************************************
     * Sets up JS Bridge without reinitializing.
     * @param {WebViewJavascriptBridge} _jsbridge the bridge
     * ***************************************************************/
    _bridge.setup = function(_jsbridge) {
        jsbridge = _jsbridge;
    }

    return _bridge;
}();
/* ******************************
 *  END Pulsar bridge definition
 * ******************************/

export default setUpBridge;

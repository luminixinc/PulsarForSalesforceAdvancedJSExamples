/* ******************************
* BEGIN Pulsar bridge boilerplate
* ***************************** */

var BRIDGE_ON = true; // set to false to test file in desktop browser

var bridge = function () {

    var jsbridge;
    var _bridge = {};

    /** **************************************************************
     *  Sends a request (object containing type,
     *  object, and data properties) across the JS Bridge,
     *  and results are delivered to the callback function
     *  @param {object} request data
     *  @param {function} callback result function (called asynchronously)
     * ***************************************************************/
    _bridge.sendRequest = function (request, callbackFn) {
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
    _bridge.addHandler = function (handlerName, handlerFn) {
        jsbridge.registerHandler(handlerName, handlerFn);
    };

    /** **************************************************************
     * Remove handler for a particular notification
     * @param {string} handlerName name of notification
     * ***************************************************************/
    _bridge.removeHandler = function (handlerName) {
        jsbridge.deregisterHandler(handlerName);
    };

    /** **************************************************************
     * Initializes the JS Bridge.
     * This should only be called once.
     * @param {WebViewJavascriptBridge} _jsbridge the bridge
     * ***************************************************************/
    _bridge.init = function (_jsbridge) {
        if (BRIDGE_ON) {
            _jsbridge.init(function (message, responseCallback) {
                console.log('Received message: ' + message);
            });

            jsbridge = _jsbridge;
        }
    };

    /** **************************************************************
     * Sets up JS Bridge without reinitializing.
     * @param {WebViewJavascriptBridge} _jsbridge the bridge
     * ***************************************************************/
    _bridge.setup = function (_jsbridge) {
        jsbridge = _jsbridge;
    }

    return _bridge;
}();
/* ******************************
 * END Pulsar bridge boilerplate
 * ******************************/

/* ******************************
 * BEGIN Pulsar bootstrap boilerplate
 * ******************************/

const runningEmbedded = (window.top !== window.self); // are we running embedded in an iframe?
const runningStandAlone = !runningEmbedded;           // are we running in a stand-alone state in our own webview context?
var runningEmbeddedInFSL = false;                     // are we running embedded in an iframe within Pulsar for FSL context?
var refObjectId = undefined;                          // if launched from a record, this is the object Id in question

/* ************************************************************************
 * This is the entry point when running your app stand-alone (directly from
 * Pulsar, not embedded in an iframe).
 * ************************************************************************/
document.addEventListener('WebViewJavascriptBridgeReady', standAloneBootstrap, false);

function standAloneBootstrap(event) {
    bridge.init(event.bridge);

    // if we are receiving this event, window.pulsar should be undefined
    console.assert(window.pulsar === undefined);
    window.pulsar = {};
    window.pulsar.bridge = event.bridge; // save initial bridge (for propagation to other pages)

    commonBootstrap();
}

/* ************************************************************************
 * This is the entry point when running your app embedded in another web
 * view in Pulsar.
 * ************************************************************************/
window.onload = embeddedBootstrap;

function embeddedBootstrap() {
    if (runningEmbedded && window.parent.pulsar && window.parent.pulsar.bridge) {
        window.pulsar = window.parent.pulsar; // ensure we will pass down the embedded window.pulsar
        bridge.setup(window.pulsar.bridge); // ensure we are setup properly for this embedded context

        // FSL toplevel app sets additional methods you can use
        runningEmbeddedInFSL = (window.pulsar['displayContentDocument'] !== undefined);

        commonBootstrap();
    } else {
        if (runningEmbedded) {
            /* ************************************************************
             * Something has gone wrong if we are running embedded and find
             * ourselves without window.parent.pulsar.bridge or
             * window.parent.pulsar objects.
             * ************************************************************/
            console.log('OOPS, running embedded, but no window.parent.pulsar.bridge!');
            throw 'embedded misconfiguration!';
        } else {
            /* ************************************************************
             * 2021/02/04 NOTE: on iOS platform, windows.onload is called
             * after `WebViewJavascriptBridgeReady` is sent, but on Windows
             * and Android it is called before. So, because we may not have
             * the initial bridge setup at this point, do nothing here.
             * ************************************************************/
            console.assert(runningStandAlone);
        }
    }
}

/* ************************************************************************
 * This is the common secondary-stage bootstrap where we perform sanity-
 * checks and basic logging before launching your custom code.
 * ************************************************************************/
function commonBootstrap() {

    /* ************************************************************
     * At this point we should have the Pulsar JS Bridge either from
     * `WebViewJavascriptBridgeReady` event (stand-alone) or via the
     * parent context (running embedded).
     * ************************************************************/
    console.assert(window.pulsar.bridge !== undefined);
    console.assert(!(runningEmbedded && runningStandAlone));
    console.assert(runningEmbedded || runningStandAlone);

    refObjectId = getQueryVariable('ref_id');

    // log the launch context
    console.log('Starting Custom Pulsar App' + (runningEmbedded ? ' embedded' : '') + (runningEmbeddedInFSL ? ' in FSL' : '') + (runningStandAlone ? ' stand alone' : '') + (refObjectId ? ' launched from record: ' + refObjectId : ''));

    // log any query variables
    console.log('query variables ' + stringify(getQueryVariables()));

    /* !!!! IMPORTANT !!!!
     * The bridge has been initialized and your app is ready for launch.
     * startPulsarApp() is any arbitrary method that a developer may (re-)define
     * to start their application using the Pulsar JS bridge.
     */
    startPulsarApp();
};

/* ******************************
 * END Pulsar bootstrap boilerplate
 * ******************************/

/**
     * Helper function to extract URL query variables
     * @param {string} variable name
     */
function getQueryVariable(variable) {
    const varDict = getQueryVariables();
    return varDict[variable];
}

/**
 * Helper function to extra all URL query variables into dict
 * @returns {dict} Dictionary of query variables
 */
function getQueryVariables() {
    const query = window.location.search.substring(1);
    const vars = query.split("&");
    let varDict = {};
    for (var i = 0; i < vars.length; i++) {
        const pair = vars[i].split("=");
        const key = pair[0];
        const val = pair[1];
        varDict[key] = val;
    }
    return varDict;
}

/**
 * Helper function to pretty-print data as JSON
 * @param {any} obj
 * @returns {string} stringified object
 */
function stringify(obj) {
    return JSON.stringify(obj, null, 4);
}


/* !!!! IMPORTANT !!!!
 * Here we define a custom starting point for the app. This function is
 * called above once we are certain that we have established a functional
 * Pulsar JS Bridge.
 */
function startPulsarApp() {
    // what environment are we running on?
    getPlatform();

    // what user are we running on behalf of?
    getUserInfo();

    // populate inital sync status
    getSyncInfo();
}

function getPlatform() {
    var request = {};
    var obj = {};
    request["type"] = 'getPlatform';
    request["data"] = obj;
    bridge.sendRequest(request, function (responseData) {
        console.log('platformInfo: ' + stringify(responseData));

        if (responseData.type === "getplatformResponse" || responseData.type === "platformResponse") {
            var platform = responseData.data;
            platformStr = 'Running on the ' + platform + ' platform';
            if (refObjectId) {
                platformStr += ', launched from record: ' + refObjectId;
            }
            console.log(platformStr);
        } else {
            console.assert(responseData.type == 'error');
            var errStr = responseData.data;
            console.log('A problem occurred:\n' + errStr);
            console.log('Couldnt get platform!');
        }
    });
}

function getUserInfo() {
    var request = {};
    var obj = {};
    request["type"] = 'userInfo';
    request["data"] = obj;
    bridge.sendRequest(request, function (responseData) {
        console.log('userInfo: ' + stringify(responseData));

        if (responseData.type === "userInfoResponse") {

        } else {
            console.assert(responseData.type == 'error');
            console.log('A problem occurred:\n' + responseData.data);
        }
    });
}

function getSyncInfo() {
    var request = {};
    var obj = {};
    request["type"] = 'syncInfo';
    request["data"] = obj;
    bridge.sendRequest(request, function (responseData) {
        console.log('syncInfo: ' + stringify(responseData));

        if (responseData.type === "syncinfoResponse") {

        } else {
            console.assert(responseData.type == 'error');
            console.log('A problem occurred:\n' + responseData.data);
        }
    });
}
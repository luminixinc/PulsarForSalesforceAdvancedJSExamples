/* eslint-disable */

/* ******************************
* BEGIN Pulsar bridge boilerplate
* ******************************/
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

/* ******************************
* Photo Gallery specific code below
* ******************************/

// Adds the image to the Gallery

const addImageToGallery = (imageData) => {
  document.getElementById(imageData.buttonId).classList.remove("d-none")
  document.getElementById(imageData.buttonId).src = imageData.url;
  document.getElementById(imageData.textId).innerHTML = imageData.text;
}

// Quick check to see if the response object is empty -> error

const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
}

// API: readSFFile

// This API call returns an array containing a dictionary with the ContentVersion object for the ContentDocument or ContentVersion matching the Id specified.
// Important returned fields:
// VersionData – base64 encoded file data (if ReturnBase64Data is not false)
// ThumbBody – base64 encoded file thumbnail data (if ReturnBase64Data is not false and the file is an image)
// FileURL – local URL to the file
// ThumbURL – local URL to the file thumbnail (empty string if file is not an image)
// https://luminix.atlassian.net/wiki/spaces/PD/pages/601817089/Salesforce+Files+API

const readSFFile = (id, buttonId, textId) => {
  const request = {
    type: 'readSFFile',
    data: {
      Id: id,    // Required ContentDocument or ContentVersion Id
      // "ReturnBase64Data" : false  // Optional, default true.  If false you will still have access to URL of file
    }
  };

  bridge.sendRequest(request, (responseData) => {
    const addImageData = {
      buttonId: buttonId,
      textId: textId,
      text: '',
      url: ''
    }

    if (isEmpty(responseData.data)) {
      addImageData.url = 'assets/batman.jpeg'
      addImageData.text = 'Something went wrong'

      addImageToGallery(addImageData)
    } else {
      addImageData.url = responseData.data[0].FileURL
      addImageData.textId = ''
      console.log('The File is located here: ' + responseData.data[0].FileURL)

      addImageToGallery(addImageData)
    }
  });
}

// API: createSFFileFromFilePath

// The createSFFileFromFilePath method allows creation of Salesforce Files directly from valid, accessible, device file paths. 
// The intended File parent SObject Id and FilePath are required arguments. The ContentType of the File may be optionally specified in MIME type format, 
// as in the example below. Optionally, you can specify a file name, instead of using the name of the original file. 
// On success, the response data contains the Id of the created ContentDocument.
// https://luminix.atlassian.net/wiki/spaces/PD/pages/601817089/Salesforce+Files+API

const createSFFileFromFilePath = (filePath) => {
  const request = {
    type: 'createSFFileFromFilePath',
    data: {
      ParentId: '0015e00000AZCmrAAH', // Hard coded. You'll need to use your own
      // Name: "FileName.jpg",                    // Optional
		  // ContentType: "image/jpeg",               // Optional -- manual entry of content type
      FilePath: filePath
    }
  };

  bridge.sendRequest(request, (responseData) => {
    if (responseData.type == 'createSFFileResponse') {
      console.log('Created ContentDocument Id: ' + JSON.stringify(responseData.data));

      readSFFile(responseData.data.AttachmentId, 'gallery-image', 'gallery-image-text')
    } else {
      console.log('World is on fire..' + JSON.stringify(responseData))
    }
  });
}

// Select Image from Gallery

// API: cameraPhotoPicker
// The cameraPhotoPicker command opens the device photo library, allowing the user to pick photos. The callback response data contains an array of objects containing file path and content type.
// https://luminix.atlassian.net/wiki/spaces/PD/pages/122716166/Native+Pulsar+UI+Interaction+API

document.getElementById('select-image-from-gallery').addEventListener('click', () => {
  const request = {
    type: "cameraPhotoPicker",
    data: { /* data is empty */ }
  };

  bridge.sendRequest(request, (responseData) => {
    if ((responseData.type === 'cameraPhotoPickerResponse') && (responseData.data != null)) {
      const arrResult = responseData.data;

      arrResult.forEach(e => {
        const filePath = e.FilePath;
        // const fileUrl = e.FileURL;               // new for 6.0
        // const relativePath = e.RelativeFilePath; // new for 6.0
        const contentType = e.ContentType;
        console.log(`camera photo path: ${filePath} content type: ${contentType}`)

        createSFFileFromFilePath(filePath)
      });
    } else {
      console.log('Something broke');
      console.log(JSON.stringify(responseData.data))
    }
  });
});

// Take Photo and create File

// API: createSFFileFromCamera
// The createSFFiletFromCamera method allows creation of Salesforce Files directly from the device's camera. 
// The intended File's parent SObject Id is a required argument. Optionally, you can specify a file name for the File, instead of using the name of the original file. 
// On success, the response data contains the Id of the created ContentDocument.
// https://luminix.atlassian.net/wiki/spaces/PD/pages/601817089/Salesforce+Files+API

document.getElementById('create-salesforcefile-from-camera').addEventListener('click', () => {
  const request = {
    type: 'createSFFileFromCamera',
    data: {
      ParentId: '0015e00000AZCmrAAH', // Hard coded. You'll need to use your own
      // "Name" : "FileName.jpg"             Optional
    }
  };

  bridge.sendRequest(request, (responseData) => {
    if (responseData.type == 'createSFFileResponse') {
      console.log(JSON.stringify(responseData.data));

      readSFFile(responseData.data.AttachmentId, 'camera-image', 'camera-image-text')
    } else {
      console.log('What did you do?');
      console.log(JSON.stringify(responseData))
    }
  });
});
/* ********************************************************************
 * JSAPI Helpers
 * ********************************************************************/

const BRIDGE_INIT_INCOMPLETE = 'Bridge initialization has not completed.';

/* Get the current platform from Pulsar. */
function getPlatform() {
  return new Promise( (resolve, reject) => {
    try {
      if (!bridge) {
        reject(BRIDGE_INIT_INCOMPLETE);
      }

      bridge.sendRequest({
        type: 'getplatform'
      }, response => {
        if (response.type === 'error') {
          reject('Could not get platform information.');
          return;
        }
        resolve(response.data);
      });

    } catch (error) {
      reject(error);
    }
  });
}

/* Show the user a list of Accounts. Once selected, the document can
 * load related Contacts and present this to the user. */
function loadAccountFromPulsarJSAPI() {
  return new Promise( (resolve, reject) => {
    try {
      if (!bridge) {
        reject(BRIDGE_INIT_INCOMPLETE);
      }

      bridge.sendRequest({
        type: 'lookupobject',
        object: 'Account',
        data: {}
      }, response => {
        if (response.type === 'error') {
          reject('Failure selecting Account.');
          return;
        }

        const didSelectAccount = response && response.data && response.data.length > 0;
        if (didSelectAccount) {
          const selectedAccount = response.data[0];
          resolve(selectedAccount);
        } else {
          reject('No account selected.');
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/* Get related list info from the Account object for a given object type. */
function getAccountRelatedListInfo(relatedObjectType) {
  return new Promise( (resolve, reject) => {
    try {
      if (!bridge) {
        reject(BRIDGE_INIT_INCOMPLETE)
      }
      bridge.sendRequest({
        type: 'getrelatedlists',
        object: 'Account',
        data: {}
      }, response => {
        if (response.type === 'error') {
          reject('Unable to get related lists.');
          return;
        }
        const targetLists = response.data.filter( rl => {
          return rl.sobject === relatedObjectType;
        });
        if (Array.isArray(targetLists) && targetLists.length > 0) {
          resolve(targetLists[0]);
        } else {
          reject(`Could not find related list info for ${relatedObjectType}.`);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/* Get up to three Contacts related to the provided Account. */
function loadAccountRelatedContactsFromPulsarJSAPI(account) {
  return getAccountRelatedListInfo('Contact').then( relatedListInfo => {
    return new Promise( (resolve, reject) => {
      try {
        const query = `SELECT * FROM ${relatedListInfo.sobject} WHERE ${relatedListInfo.field} = '${account.Id}' LIMIT 3`;
        bridge.sendRequest({
          type: 'select',
          object: relatedListInfo.sobject,
          data: { query },
        }, response => {
          if (response.type === 'error') {
            reject(`Unable to select related contacts for Account with Id ${account.Id}.`);
            return;
          }
          resolve(response.data);
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}

/* Renders the content defined by the headernode, docnode, and footernode into
a PDF using the native platform. The resulting file will have the provided
filename. If successful, the path to the file is returned. */
function callSaveAsJSAPI(saveAsArgs) {
  const { fileName, headerDocumentString, bodyDocumentString, footerDocumentString, printOptions } = saveAsArgs;
  console.dir(saveAsArgs);
  return new Promise( (resolve, reject) => {
    try {
      bridge.sendRequest({
        type: 'saveas',
        data: {
          displayresult: true,
          format: 'pdf',
          filename: fileName,
          headernode: headerDocumentString,
          docnode: bodyDocumentString,
          footernode: footerDocumentString,
          printoptions : printOptions,
        }
      }, response => {
        if (response.type === 'error') {
          reject('Error while saving PDF file.');
          return;
        }
        resolve(response.data['FilePath']);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/* Saves the document located at filePath to your Salesforce organization
 * attached to the provided Account object. If successful, the Id of the
 * resulting ContentDocument is returned. */
function saveDocumentAsFileAttachedToAccount(account, filePath) {
  return new Promise( (resolve, reject) => {
    try {
      bridge.sendRequest({
        type: 'createsffilefromfilepath',
        data: {
          ParentId: account.Id,
          FilePath: filePath,
        }
      }, response => {
        if (response.type === 'error') {
          reject('Error while attaching PDF file to associated account.');
          return;
        }
        resolve(response.data['ContentVersionId']);
      });
    } catch (error) {
      reject(error);
    }
  });
}
/* ********************************************************************/
/* ********************************************************************/

/* ********************************************************************
 * When our native code executes this javascript to locate our element, we will be
 * executing from the outermost document context. Using window.top to locate our
 * predefined container iFrame (id = 'iFrame'), we can ensure we locate our
 * report content as well. */
/* ********************************************************************/
function getIFrameString(iframeId) {
  if (window === window.top) {
    return `document.getElementById('${iframeId}').contentDocument`
  } else {
    return `window.top.document.getElementById('iFrame').contentDocument.getElementById('${iframeId}').contentDocument`
  }
}
/* ********************************************************************/

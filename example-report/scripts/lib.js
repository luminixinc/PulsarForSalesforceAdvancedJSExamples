/* ********************************************************************
 * Report Generation Code
 *
 * The code below is generally written in the order in which a user
 * will interact with the code.
 *
 * The Strategy Pattern is used to clarify the process. The
 * strategy performs different actions depending on the
 * platform (Android, iOS, Windows).
/* ********************************************************************/
/* ********************************************************************/

/* ********************************************************************
 * Application Variables
/* ********************************************************************/
let account = null;
let relatedContacts = [];
let signaturePad;
let platform;
let strategy;
/* ********************************************************************/
/* ********************************************************************/

/* Get the current platform which is needed to formalize the PDF generation strategy. */
function startPulsarApp() {
  console.log('Starting the application.');
  getPlatform().then( currentPlatform => {
    platform = currentPlatform;
    setupForPlatform(platform);
    setupDocument();
  }).catch(error => alert(error));
}

/*
Both the HTML document structure and Javascript methods used to generate the PDF
are dependent upon the current platform.

The platform specific HTML is located in /scripts/htmlFragments/{platform}-pdf.js
The platform specific JS strategy is located in /scripts/strategies/{platform}.strategy.js
*/
function setupForPlatform(platform) {
  const pdfPreviewElement = document.getElementById('pdf-preview');
  switch (platform) {
    case 'ios':
      pdfPreviewElement.innerHTML = iosPDFFragment;
      strategy = new IOSStrategy();
      break;
    case 'android':
      pdfPreviewElement.innerHTML = androidPDFFragment;
      strategy = new AndroidStrategy();
      break;
    case 'windows':
      pdfPreviewElement.innerHTML = windowsPDFFragment;
      strategy = new WindowsStrategy();
      break;
    default:
      console.error('Invalid PDF strategy name.');
      return null;
  }
}

function setupDocument() {
  console.log(`Setting up the document for ${platform}.`);
  setupSignaturePad();
  setupInstructions();
  hideElementsByIds(idsToHideForAccountSelection);
  showElementById('account-selection-instructions');
  console.log(`Ready for Account selection.`);
}

function selectAccount() {
  loadAccountFromPulsarJSAPI()
    .then( loadedAccount => {
      account = loadedAccount;
      console.log('Account selected, loading any related Contacts.');
      console.dir(account);
      return loadAccountRelatedContactsFromPulsarJSAPI(account);
    }).then( contacts => {
      relatedContacts = contacts;
      console.log(`Contacts loaded. Displaying preview document.`);
      console.dir(relatedContacts);
      displayPreviewPDF();
    }).catch(error => alert(error));
}

function displayPreviewPDF() {
  addTodaysDateToHeader();
  addDocumentDataToBodyElement();
  hideElementsByIds(elementsToHideForPDFPreview);
  showElementsByIds(elementsToShowForPDFPreview);
  console.log(`Preview displayed. Awaiting signature.`);
}

function onSignatureEnd() {
  if (!signaturePad.isEmpty()) {
    console.log(`Signature added.`);
    showElementsByIds(elementsToShowForSaveSignature);
  }
}

function clearSignature() {
  const signatureDivElement = document.getElementById('signature-pad-div');
  signaturePad.clear();
  clearSignatureImage();
  hideElementsByIds(elementsToHideForPDFPreview);
  showElementsByIds(elementsToShowForPDFPreview);
  console.log(`Signature cleared.`);
}

function saveSignature() {
  if (signaturePad.isEmpty()) {
    return alert('Please provide a signature first.');
  } else {
    captureSignatureAsImage();
    hideElementsByIds(elementsToHideForSaveAs);
    showElementsByIds(elementsToShowForSaveAs);
    console.log(`Signature saved, ready to prepare document for saveas.`);
  }
}

/* ********************************************************************
  Important!
  Before the saveAs JSAPI call is made, the correct arguments must be compiled
  and the document structure prepared. Content is styled or unstyled if necessary
  and moved to the appropriate iframes.
* ******************************************************************* */
function saveAsPDF() {

  console.log(`Preparing document for PDF generation.`);
  hideElementsByIds(elementsToHideForPDFGeneration);
  showElementById('pdf-creation');

  /* prepare content to accurately measure the header and footer content height */
  strategy.removePreviewStyling();
  strategy.addMetaTagsToIFrames(['headerIFrame', 'bodyIFrame', 'footerIFrame']);
  strategy.addCSSToIFrames();

  const { headerHeight, footerHeight } = strategy.calculateHeaderAndFooterHeight();
  console.log(`Calculated header height: ${headerHeight}.`);
  console.log(`Calculated footer height: ${footerHeight}.`);

  strategy.prepareDocumentForRendering();
  strategy.moveContentToIFrames();
  console.log(`Content moved to PDF creation iframe(s).`);

  const saveAsArgs = {
    fileName: createFileName(),
    headerDocumentString: getIFrameString('headerIFrame'),
    bodyDocumentString: getIFrameString('bodyIFrame'),
    footerDocumentString: getIFrameString('footerIFrame'),
    printOptions: createPrintOptions(headerHeight, footerHeight),
  }
  console.log(`Making saveAs request: `);
  console.dir(saveAsArgs);

  callSaveAsJSAPI(saveAsArgs)
    .then( filePath => saveDocumentAsFileAttachedToAccount(account, filePath))
    .then( contentVersionId => {
      if (contentVersionId) {
        console.log(`Created ContentVersion with Id: ${contentVersionId}`);
        hideElementsByIds(idsToHideWhenPDFSaved);
        showElementsByIds(['completed-instructions', 'document-actions']);
      } else {
        console.error('Failed to create content document');
      }
    }).catch(error => alert(error));
};

/* Close the App. */
function exitApp() {
  const req = {
    type: 'exit',
  };
  bridge.sendRequest(req, function (res) {
    console.log('Exiting application.');
  });
}
/* ********************************************************************/
/* ********************************************************************/

/* ********************************************************************
 * Document Data Code
 * ********************************************************************/
function addTodaysDateToHeader() {
  const headerDate = document.getElementById('header-date');
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  var today  = new Date();
  headerDate.innerHTML = today.toLocaleDateString(undefined, options);
}

function addDocumentDataToBodyElement() {
  /* Add related contacts. */
  const contactsDiv = document.getElementById('contacts');
  contactsDiv.style.display = 'flex';
  contactsDiv.style.justifyContent = 'space-between';
  contactsDiv.style.flexDirection = 'row';
  contactsDiv.style.paddingTop = '50px';
  contactsDiv.style.flexWrap = 'wrap';

  /* Clear any old nodes. */
  while (contactsDiv.firstChild) {
    contactsDiv.removeChild(contactsDiv.firstChild);
  }

  for (let c of relatedContacts) {
    const node = contactHTML(c);
    contactsDiv.appendChild(node);
  }

  /* Add some lorem ipsum to fill up some space. */
  const largeTextBlockDiv = document.getElementById('large-text-block')
  while (largeTextBlockDiv.firstChild) {
    largeTextBlockDiv.removeChild(largeTextBlockDiv.firstChild);
  }
  largeTextBlockDiv.innerHTML = loremIpsumHTML;
}

/* Builds an displayable element from Contact information. */
function contactHTML(contact) {
  const element = document.createElement('div');
  element.style.width = '250px';
  element.style.padding = '15px';
  element.style.margin = '15px;'
  element.innerHTML = `<div>${contact.Name}</div><div>${contact.Title}</div><div>${contact.Email}</div><div>${contact.Phone}</div><hr/><div>${contact.Description}</div>`;
  return element;
}
/* ************************************************************************ */
/* ************************************************************************ */

/* ************************************************************************ */
/* Helpers and Constants                                                    */
/* ************************************************************************ */
/* Generates a file name for the report based on today's date. */
function createFileName() {
  return 'example-report-' + Date.now() + '.pdf';
}

function createPrintOptions(headerHeight = 0, footerHeight = 0) {
  const options = {
    'topmargin':    24,
    'leftmargin':   42,
    'bottommargin': 24,
    'rightmargin':  42,
  };

  /* If the headerHeight is null or 0, a header will not be shown. */
  if (headerHeight) {
    options['headerheight'] = headerHeight;
  }
  /* If the footerHeight is null or 0, a header will not be shown. */
  if (footerHeight) {
    options['footerheight'] = footerHeight;
  }
  return options;
}
/* ********************************************************************/
/* ********************************************************************/

/* ********************************************************************
 * Strings
 * ********************************************************************/
const loremIpsumHTML = '<h3>Latin Agreement</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nullam non nisi est sit amet facilisis magna. Sed adipiscing diam donec adipiscing. Sit amet est placerat in egestas erat imperdiet. Convallis convallis tellus id interdum velit laoreet id donec. Convallis a cras semper auctor neque vitae tempus quam pellentesque. A cras semper auctor neque vitae tempus. Sit amet nisl purus in mollis nunc sed id semper. Libero id faucibus nisl tincidunt eget. Turpis tincidunt id aliquet risus feugiat in. Mi in nulla posuere sollicitudin aliquam. Sit amet aliquam id diam maecenas. Faucibus nisl tincidunt eget nullam. Mauris pharetra et ultrices neque ornare aenean euismod elementum nisi.</p><p>Massa vitae tortor condimentum lacinia. Et pharetra pharetra massa massa ultricies mi quis hendrerit. Arcu non odio euismod lacinia. Odio euismod lacinia at quis risus. Fringilla est ullamcorper eget nulla facilisi etiam dignissim diam. Fermentum leo vel orci porta non pulvinar neque laoreet suspendisse. Ultrices mi tempus imperdiet nulla malesuada pellentesque elit eget. Eu consequat ac felis donec et odio. Lobortis feugiat vivamus at augue eget arcu dictum varius duis. Sed odio morbi quis commodo odio aenean sed adipiscing diam. Nibh tellus molestie nunc non blandit. In nulla posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. Congue nisi vitae suscipit tellus mauris. Egestas fringilla phasellus faucibus scelerisque eleifend donec pretium vulputate sapien. Aliquam ultrices sagittis orci a scelerisque purus semper eget duis.</p><p>Tristique senectus et netus et malesuada fames ac turpis egestas. Diam phasellus vestibulum lorem sed risus ultricies tristique nulla aliquet. Nisi scelerisque eu ultrices vitae auctor eu. In mollis nunc sed id. Non quam lacus suspendisse faucibus interdum posuere. Quam id leo in vitae turpis massa. At volutpat diam ut venenatis. Orci ac auctor augue mauris augue. Nisi vitae suscipit tellus mauris a diam maecenas. Maecenas sed enim ut sem. Ornare massa eget egestas purus. Nulla facilisi nullam vehicula ipsum a. Velit scelerisque in dictum non consectetur a erat nam. Velit scelerisque in dictum non. Metus aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices. Bibendum est ultricies integer quis auctor elit sed vulputate.</p><p>Bibendum enim facilisis gravida neque. Vel turpis nunc eget lorem dolor sed viverra. Aliquam eleifend mi in nulla. Dolor sit amet consectetur adipiscing elit ut aliquam. Non blandit massa enim nec dui nunc. Tellus molestie nunc non blandit. Pellentesque id nibh tortor id aliquet. Tincidunt eget nullam non nisi est. Diam ut venenatis tellus in metus vulputate. Nisl nunc mi ipsum faucibus vitae. Consequat ac felis donec et odio. Interdum posuere lorem ipsum dolor sit.</p><p>Sed elementum tempus egestas sed sed risus pretium. Turpis cursus in hac habitasse platea dictumst quisque sagittis purus. Adipiscing enim eu turpis egestas pretium aenean pharetra. Enim nec dui nunc mattis enim ut. Orci ac auctor augue mauris augue. Vehicula ipsum a arcu cursus vitae congue mauris rhoncus aenean. Tortor aliquam nulla facilisi cras fermentum odio eu feugiat. Vulputate ut pharetra sit amet aliquam id. Turpis massa tincidunt dui ut ornare lectus sit amet est. Quam lacus suspendisse faucibus interdum posuere. Eget est lorem ipsum dolor sit. Dui vivamus arcu felis bibendum ut tristique et egestas. Fames ac turpis egestas sed tempus urna et. Sed faucibus turpis in eu mi. Praesent semper feugiat nibh sed pulvinar proin gravida hendrerit lectus. Fames ac turpis egestas maecenas pharetra convallis posuere morbi leo. Dui ut ornare lectus sit amet. Nibh venenatis cras sed felis eget velit aliquet.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nullam non nisi est sit amet facilisis magna. Sed adipiscing diam donec adipiscing. Sit amet est placerat in egestas erat imperdiet. Convallis convallis tellus id interdum velit laoreet id donec. Convallis a cras semper auctor neque vitae tempus quam pellentesque. A cras semper auctor neque vitae tempus. Sit amet nisl purus in mollis nunc sed id semper. Libero id faucibus nisl tincidunt eget. Turpis tincidunt id aliquet risus feugiat in. Mi in nulla posuere sollicitudin aliquam. Sit amet aliquam id diam maecenas. Faucibus nisl tincidunt eget nullam. Mauris pharetra et ultrices neque ornare aenean euismod elementum nisi.</p><p>Massa vitae tortor condimentum lacinia. Et pharetra pharetra massa massa ultricies mi quis hendrerit. Arcu non odio euismod lacinia. Odio euismod lacinia at quis risus. Fringilla est ullamcorper eget nulla facilisi etiam dignissim diam. Fermentum leo vel orci porta non pulvinar neque laoreet suspendisse. Ultrices mi tempus imperdiet nulla malesuada pellentesque elit eget. Eu consequat ac felis donec et odio. Lobortis feugiat vivamus at augue eget arcu dictum varius duis. Sed odio morbi quis commodo odio aenean sed adipiscing diam. Nibh tellus molestie nunc non blandit. In nulla posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. Congue nisi vitae suscipit tellus mauris. Egestas fringilla phasellus faucibus scelerisque eleifend donec pretium vulputate sapien. Aliquam ultrices sagittis orci a scelerisque purus semper eget duis.</p><p>Tristique senectus et netus et malesuada fames ac turpis egestas. Diam phasellus vestibulum lorem sed risus ultricies tristique nulla aliquet. Nisi scelerisque eu ultrices vitae auctor eu. In mollis nunc sed id. Non quam lacus suspendisse faucibus interdum posuere. Quam id leo in vitae turpis massa. At volutpat diam ut venenatis. Orci ac auctor augue mauris augue. Nisi vitae suscipit tellus mauris a diam maecenas. Maecenas sed enim ut sem. Ornare massa eget egestas purus. Nulla facilisi nullam vehicula ipsum a. Velit scelerisque in dictum non consectetur a erat nam. Velit scelerisque in dictum non. Metus aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices. Bibendum est ultricies integer quis auctor elit sed vulputate.</p><p>Bibendum enim facilisis gravida neque. Vel turpis nunc eget lorem dolor sed viverra. Aliquam eleifend mi in nulla. Dolor sit amet consectetur adipiscing elit ut aliquam. Non blandit massa enim nec dui nunc. Tellus molestie nunc non blandit. Pellentesque id nibh tortor id aliquet. Tincidunt eget nullam non nisi est. Diam ut venenatis tellus in metus vulputate. Nisl nunc mi ipsum faucibus vitae. Consequat ac felis donec et odio. Interdum posuere lorem ipsum dolor sit.</p><p>Sed elementum tempus egestas sed sed risus pretium. Turpis cursus in hac habitasse platea dictumst quisque sagittis purus. Adipiscing enim eu turpis egestas pretium aenean pharetra. Enim nec dui nunc mattis enim ut. Orci ac auctor augue mauris augue. Vehicula ipsum a arcu cursus vitae congue mauris rhoncus aenean. Tortor aliquam nulla facilisi cras fermentum odio eu feugiat. Vulputate ut pharetra sit amet aliquam id. Turpis massa tincidunt dui ut ornare lectus sit amet est. Quam lacus suspendisse faucibus interdum posuere. Eget est lorem ipsum dolor sit. Dui vivamus arcu felis bibendum ut tristique et egestas. Fames ac turpis egestas sed tempus urna et. Sed faucibus turpis in eu mi. Praesent semper feugiat nibh sed pulvinar proin gravida hendrerit lectus. Fames ac turpis egestas maecenas pharetra convallis posuere morbi leo. Dui ut ornare lectus sit amet. Nibh venenatis cras sed felis eget velit aliquet.</p>'
/* ********************************************************************/
/* ********************************************************************/

/* ********************************************************************
 * HTML Templates
 * ********************************************************************/
const accountSelectionHtml = `<h3>Pulsar Report Generation Example</h3>
<div class='instructions-text'>The following example will generate a pdf using the Pulsar saveas JSAPI call.</div>
<div class='instructions-text'>First, load some data to display. Use the buttons below to load an account from your organization. If possible, choose an Account that has some related Contacts as this data will be included in the generation of our report.</div>
<div class='instructions-text' style='display: flex; flexDirection: row; justifyContent: space-between'>
  <button type='button' class='blue button' name='loadAccount' onclick='selectAccount()'>Load an Account</button>
  <button type='button' class='red button' name='exit' onclick='exitApp()'>Exit Example Application</button>
</div>`;

const pdfInstructionsHtml = `<h3 class='instructions-text'>PDF Display and User Interaction</h3>
<div class='instructions-text'>
  Here is the sample PDF report to display to users prior to saving the document. It can display data you gather and also be interactive. Note the signature pad as an example of an interactive element.
</div>
<div class='instructions-text'>
  As a best practice, remove elements from the DOM that are not necessary
  to include in the PDF prior making the saveas request. This will
  include the instruction regions and other items that are not relevant
  to the final document.
</div>
<div class='instructions-text'>
  Leaving extraneous elements in the DOM and making the saveas JSAPI request
  may result in the inclusion of these elements in the resulting PDF.
</div>
<div class='instructions-text'>
  For instructional purposes, the colors of the various regions of the report are color-coded as follows.
  <p class='header-bgcolor' style='display: inline-block; padding: 8px;'>The header will have this background color.</p>
  <p class='body-bgcolor' style='display: inline-block; padding: 8px;'>The body will have this background color.</p>
  <p class='footer-bgcolor' style='display: inline-block; padding: 8px;'>The footer will have this background color.</p>
</div>
`;

const signatureInstructionsHtml = `<h3>Gathering Signatures</h3>
<div class='instructions-text'>
  Add a signature by drawing in the region below. When complete,
  tap the 'Done Signing' button. Once tapped, the signature will be
  applied to the document as an image.
</div>
<div class='instructions-text'>
  To clear or re-draw the signature, tap the 'Clear Signature' button and start over.
</div>`;

const completedInstructionsHtml = `<h3>Document Created</h3>
<div class='instructions-text'>
  At this point, the document has been created successfully and attached to the
  Account object as a related File.
</div>
`
/* ************************************************************************ */
/* ************************************************************************ */

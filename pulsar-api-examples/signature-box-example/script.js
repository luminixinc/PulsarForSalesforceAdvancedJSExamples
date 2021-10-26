let accountId = '';
let optionSelect = '';
let firstName = '';
let lastName = '';
let title = '';
let emailAddress = '';
let signatureLocation = '';


/* 
  API: createSFFileFromFilePath

  The createSFFileFromFilePath method allows creation of Salesforce Files directly from valid, accessible, device file paths. The intended File parent SObject Id and FilePath are required arguments. 
  The ContentType of the File may be optionally specified in MIME type format, as in the example below. Optionally, you can specify a file name, instead of using the name of the original file. On success, the response data contains the Id of the created ContentDocument.
  https://luminix.atlassian.net/wiki/spaces/PD/pages/601817089/Salesforce+Files+API#createsffilefromfilepath
*/
const createSFFileFromFilePath = (filePath) => {
  const request = {
    type: 'createSFFileFromFilePath',
    data: {
      ParentId: accountId, // Hard coded. You'll need to use your own
      // Name: "FileName.jpg",                    // Optional
		  // ContentType: "image/jpeg",               // Optional -- manual entry of content type
      FilePath: filePath
    }
  };

  bridge.sendRequest(request, (responseData) => {
    if (responseData.type == 'createSFFileResponse') {
      console.log('Created ContentDocument Id: ' + JSON.stringify(responseData.data));
      alert("PDF Saved")
    } else {
      console.log('World is on fire..' + JSON.stringify(responseData))
    }
  });
}


/* 
  API: saveAs
  The saveAs operation will allow you to generate and display a PDF or PNG image file of the currently displayed document. 
  This is useful for exporting displayed data or saving completed forms. This request returns the file path to the resulting PDF (default) or PNG image.  In the below example we return image file path. 
  The extension of the filename does not determine the format of the resulting file.

  For Pulsar for FSL users, the "docnode" parameter (introduced in version 3.6.4 for iOS and Android and version 3.7.3 for WIndows) should be used for saving documents used as customized pages within the FSL interface. 
  This value should be set to "window.iFrame.contentWindow.document" to ensure proper formatting of the resulting PDF.

  For all platforms version 3.7.3+ the "printoptions" parameter is available, which allows specifying settings for PDF print formatting. Currently supported are options for papersize, and top, left, bottom, and right margins. See below for examples.

  When the "datauri" parameter is used to save data to the filesystem, the only other parameters that apply are "filename" and "displayresult".
  https://luminix.atlassian.net/wiki/spaces/PD/pages/122716182/Pulsar+System+Interaction+API
*/
const saveAsPDF = () => {
  const request = { 
    type: 'saveAs',
    data: { 
      filename: 'test.pdf', // required -- the filename of the created file
      displayresult: 0,      // optional -- this is a number, positive to display the file, 0 to simply return data, default is 0
      // datauri: 'data:image/jpeg;base64,/9j/4AA...', // optional -- this is a well-formed data URI containing data you wish to save to a file. None of the parameters below will take effect if this option is used.
      format: 'pdf',       // optional -- this is a string, either 'image' or 'pdf'-- default is 'pdf' 
      // imageformat: 'png',    // optional -- this is a string, either 'png' or 'jpg' -- default is 'png'
      papersize: 'letter',    // optional, can also be specified in printoptions -- this is a string, valid values: 'letter', 'a4', 'legal' -- default is 'letter' or 'a4' based on your device settings
      // docnode: 'window.document', // optional (iOS, Android version 3.6.4+, Windows version 3.7.3+) -- this is a string, representing the html document node Pulsar will use to generate a PDF. For example, for a document in an iFrame, 'window.frames[0].contentWindow.document'. default is 'window.document'
      // headernode: 'document.getElementById("my-header")', // defines the section of the current document that will be used by iOS and UWP as the repeating page header -- you must specify a header height in the printoptions below. SEE ABOVE FOR MORE DOCUMENTATION
      // footernode: 'document.getElementById("my-footer")', // defines the section of the current document that will be user by iOS and UWP as the repeating page header -- you must specify a footer height in the printoptions below. SEE ABOVE FOR MORE DOCUMENTATION
      printoptions: { // (All platforms, version 3.7.3+) supports the following optional options in any combination
          topmargin:    28, // all margins specified in points-- 72 points per inch, 2.83465 points per mm
          leftmargin:   28, 
          bottommargin: 28, 
          rightmargin:  28,
          papersize:   'a4', // overrides top-level papersize parameter, if specified
          // headerheight: 88, // optional, but necessary if you are supplying a header (also in points) SEE ABOVE FOR MORE DOCUMENTATION
          // footerheight: 40, // optional, but necessary if you are supplying a footer (also in points) SEE ABOVE FOR MORE DOCUMENTATION
      },
    }
  };

  bridge.sendRequest(request, (results) => {
    console.log('Javascript got its response: ' + JSON.stringify(results));
    if (results.type === 'saveasResponse')	{
      const imageFilePath = results.data.FilePath;  // the resulting contains the file path to the file
      createSFFileFromFilePath(imageFilePath)
      console.log(imageFilePath)
    } else if (results.type == 'error') {
      const errStr = results.data;
      alert('A problem occurred:\n' + errStr);
    }
  });
}

/* 
  This builds out the Template for the PDF then calls the saveAsPDF function
*/
const buildPDF = () => {
  firstName = document.getElementById('input-first-name').value;
  lastName = document.getElementById('input-last-name').value;
  title = document.getElementById('input-title').value;
  emailAddress = document.getElementById('input-phone-number').value;
  const select = document.getElementById('generic-dropdown')
  optionSelect = select.options[select.selectedIndex].value;

  const genericFormInformation =
  `
    <dl class="row" id="">
      <dt class="col-md-3">Option Selected: </dt>
      <dd class="col-md-9">${optionSelect}</dd>
      <dt class="col-md-3">First Name: </dt>
      <dd class="col-md-9">${firstName}</dd>
      <dt class="col-md-3">Last Name: </dt>
      <dd class="col-md-9">${lastName}</dd>
      <dt class="col-md-3">Title: </dt>
      <dd class="col-md-9">${title}</dd>
      <dt class="col-md-3">Email Address: </dt>
      <dd class="col-md-9">${emailAddress}</dd>
      <dt class="col-md-3">Signature: </dt>
      <dd class="col-md-9"><img class="border" src="${signatureLocation}" alt="..." id="signature-image"></dd>
    </dl>
  `

  document.getElementById('selected-account').style.display = "none";
  document.getElementById('form').style.display = "none";
  document.getElementById('completed-pdf').style.display = "";
  document.getElementById('completed-pdf-body').innerHTML = genericFormInformation;
  saveAsPDF();
}

const canvas = document.getElementById('signature-pad');


/* 
  Adjust canvas coordinate space taking into account pixel ratio,
  to make it look crisp on mobile devices.
  This also causes canvas to be cleared.
*/
const  resizeCanvas = () => {

    /* 
      When zoomed out to less than 100%, for some very strange reason,
      some browsers report devicePixelRatio as less than 1
      and only part of the canvas is cleared then.
    */
    const ratio =  Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
}

window.onresize = resizeCanvas;
resizeCanvas();

const signaturePad = new SignaturePad(canvas, {
  backgroundColor: 'rgb(255, 255, 255)' // necessary for saving image as JPEG; can be removed is only saving as PNG or SVG
});

/* 
  Takes the responseData from the selectAccount function and builds the page out with the data of the account
*/

const showAccountDetails = (responseData) => {
  const accountName = responseData.Name.length > 0 ? responseData.Name : '***** No Data *****';
  const accountNumber = responseData.AccountNumber.length > 0 ? responseData.AccountNumber : '***** No Data *****';
  const localAccountId = responseData.Id.length > 0 ? responseData.Id : '***** No Data *****';
  const accountWebsite = responseData.Website.length > 0 ? responseData.Website : '***** No Data *****';
  accountId = localAccountId;

  const createAccountDetailsInnerHtml =
    `
  <dl class="row" id="">
    <dt class="col-md-3">Name: </dt>
    <dd class="col-md-9">${accountName}</dd>
    <dt class="col-md-3">Account Number: </dt>
    <dd class="col-md-9">${accountNumber}</dd>
    <dt class="col-md-3">Account ID: </dt>
    <dd class="col-md-9">${localAccountId}</dd>
    <dt class="col-md-3">Website: </dt>
    <dd class="col-md-9">${accountWebsite}</dd>
  </dl>
  `

  document.getElementById("selected-account").style.display = "";
  document.getElementById('select-account').style.display = 'none';
  document.getElementById('selected-account-details').innerHTML = createAccountDetailsInnerHtml;
}

/*
  API: lookupObject
  
  Opens native Account lookup page and returns the data for that account

  The lookupObject command allows the user to select an object from a list view in the native Pulsar interface. 
  Two options for the data portion of the request:
  - specify fields and values to filter the resulting list:
    { field1 : value1, field2 : value2 }  (this results in simple logic-- (field1=value1 AND field2=value2))

  - specify the Salesforce ListView to use by supplying the special keyword "@@listviewid" and the associated ListView Id:
    { "@@listviewid" : "00B123456789ABCDEF" }

  https://luminix.atlassian.net/wiki/spaces/PD/pages/122716166/Native+Pulsar+UI+Interaction+API#lookupObject
*/
const selectAccount = () => {
  const request = {
    type: 'lookupObject',
    object: 'Account',
    data: { /* Optional */ }
  }

  bridge.sendRequest(request, (responseData) => {
    if ((responseData.type == 'lookupObjectResponse')
      && (responseData.data != null)) {
      showAccountDetails(responseData.data[0])
    }
  });
}

document.getElementById('save-form-as-pdf').onclick = () => {
  buildPDF();
};

document.getElementById('save-signature').onclick = () => {
  if (signaturePad.isEmpty()) {
    return alert("Please provide a signature first.");
  }
  
  const data = signaturePad.toDataURL('image/png');
  signatureLocation = data;
  document.getElementById('signature-image').src = data;
  document.getElementById('signature-image-box').style.display = "";
  document.getElementById('signature-box').style.display = "none";
  document.getElementById('save-form').style.display = "";
  document.getElementById('signature-box-buttons').style.display = "none";
};

document.getElementById('clear-signature').onclick = () => {
  signaturePad.clear();
};

document.getElementById('create-signature').onclick = () => {
  document.getElementById('signature-box').style.display = "";
  document.getElementById('signature-box-buttons').style.display = "";
  document.getElementById('signature-button').style.display = "none";
  resizeCanvas();
};

document.getElementById('account-confirm').onclick = () => {
  document.getElementById('confirm-account-button-group').style.display = "none";
  document.getElementById('form').style.display = "";
}

document.getElementById('search-again').onclick = () => {
  selectAccount();
}

document.getElementById('account-search').onclick = () => {
  selectAccount();
};
let accountId;

// Adds the image to the Gallery
const addImageToGallery = (imageData) => {
  document.getElementById(imageData.buttonId).classList.remove("d-none");
  document.getElementById(imageData.buttonId).src = imageData.url;
  document.getElementById(imageData.textId).innerHTML = imageData.text;
}

// Quick check to see if the response object is empty -> error
const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
}

/*
  API: readSFFile

  This API call returns an array containing a dictionary with the ContentVersion object for the ContentDocument or ContentVersion matching the Id specified.
  Important returned fields:
  VersionData – base64 encoded file data (if ReturnBase64Data is not false)
  ThumbBody – base64 encoded file thumbnail data (if ReturnBase64Data is not false and the file is an image)
  FileURL – local URL to the file
  ThumbURL – local URL to the file thumbnail (empty string if file is not an image)
  https://luminix.atlassian.net/wiki/spaces/PD/pages/601817089/Salesforce+Files+API
*/
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
    console.log(JSON.stringify(responseData.data))

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

/*
  API: createSFFileFromFilePath

  The createSFFileFromFilePath method allows creation of Salesforce Files directly from valid, accessible, device file paths. 
  The intended File parent SObject Id and FilePath are required arguments. The ContentType of the File may be optionally specified in MIME type format, 
  as in the example below. Optionally, you can specify a file name, instead of using the name of the original file. 
  On success, the response data contains the Id of the created ContentDocument.
  https://luminix.atlassian.net/wiki/spaces/PD/pages/601817089/Salesforce+Files+API
*/
const createSFFileFromFilePath = (filePath) => {
  const request = {
    type: 'createSFFileFromFilePath',
    data: {
      ParentId: accountId,
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


/*
  API: cameraPhotoPicker

  Select Image from Gallery

  The cameraPhotoPicker command opens the device photo library, allowing the user to pick photos. The callback response data contains an array of objects containing file path and content type.
  https://luminix.atlassian.net/wiki/spaces/PD/pages/122716166/Native+Pulsar+UI+Interaction+API
*/
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

/*
  API: createSFFileFromCamera
  
  Take Photo and create File
  
  The createSFFiletFromCamera method allows creation of Salesforce Files directly from the device's camera. 
  The intended File's parent SObject Id is a required argument. Optionally, you can specify a file name for the File, instead of using the name of the original file. 
  On success, the response data contains the Id of the created ContentDocument.
  https://luminix.atlassian.net/wiki/spaces/PD/pages/601817089/Salesforce+Files+API
*/
document.getElementById('create-salesforcefile-from-camera').addEventListener('click', () => {
  const request = {
    type: 'createSFFileFromCamera',
    data: {
      ParentId: accountId,
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

  document.getElementById('selected-account').classList.remove('d-none');
  document.getElementById('select-account').classList.add('d-none');
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

document.getElementById('search-again').onclick = () => {
  selectAccount();
}

document.getElementById('account-confirm').onclick = () => {
  document.getElementById('gallery-container').classList.remove('d-none');
  document.getElementById('account-confirm').classList.add('d-none');
  document.getElementById('search-again').classList.add('d-none');
}

document.getElementById('account-search').onclick = () => {
  selectAccount();
};
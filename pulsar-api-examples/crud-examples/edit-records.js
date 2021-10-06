let accountId = '';
let editRecordId = '';
let clickAction = '';

/*
  API: "CRUD" Request Types - Delete (single record only)

  https://luminix.atlassian.net/wiki/spaces/PD/pages/8683529/Pulsar+Platform+-+JS+Bridge+API#delete
*/
const deleteRecord = () => {
  const request = {
    type: 'delete',
    object: 'Contact',
    data: { 
      Id: editRecordId // only Id is required
    }
  }

  return new Promise((resolve) => {
    bridge.sendRequest(request, (responseData) => {
      resolve(responseData);
    });
  });
}

/*
  API: "CRUD" Request Types - Update (single record only)

  https://luminix.atlassian.net/wiki/spaces/PD/pages/8683529/Pulsar+Platform+-+JS+Bridge+API#update
*/
const saveChanges = () => {
  const firstName = document.getElementById("input-first-name").value
  const lastName = document.getElementById("input-last-name").value
  const title = document.getElementById("input-title").value
  const phoneNumber = document.getElementById("input-phone-number").value
  const emailAddress = document.getElementById("input-email-address").value

  const request = {
    type: 'update',
    object: 'Contact',
    data: { 
      Id: editRecordId, // Id is a required field to identify the record to update
      FirstName: firstName,
      LastName: lastName,
      Title: title,
      Phone: phoneNumber,
      Email: emailAddress
    }
    // args: {
    //   skipLayoutRequiredFieldCheck: 'FALSE' // OPTIONAL : if specified as "TRUE", will avoid checking for missing layout required fields
    // }
  }

  return new Promise((resolve) => {
    bridge.sendRequest(request, (responseData) => {
      resolve(responseData);
    });
  });
}

const saveNewChanges = async () => {

  console.log(clickAction);
  if (clickAction === 'update') {
    console.log('save')
    await saveChanges();
  } else {
    console.log('delete')
    await deleteRecord();
  }

  document.getElementById('account-confirm').classList.add('d-none');
  document.getElementById('search-again').classList.add('d-none');
  document.getElementById('reset').classList.remove('d-none');
  document.getElementById('show-all-records').classList.remove('d-none');
  document.getElementById('confirm-record-updates-button').classList.add('d-none');
  document.getElementById('selected-account').classList.remove('d-none');
  document.getElementById('show-all-records').classList.remove('d-none');
  document.getElementById('record-edit').classList.add('d-none');
  document.getElementById("input-first-name").removeAttribute('disabled', '');
  document.getElementById("input-last-name").removeAttribute('disabled', '');
  document.getElementById("input-title").removeAttribute('disabled', '');
  document.getElementById("input-phone-number").removeAttribute('disabled', '');
  document.getElementById("input-email-address").removeAttribute('disabled', '');
  document.getElementById('show-all-records-body').innerHTML = '';
  showAllRecords();
}

const confirmChanges = (onClickAction) => {
  clickAction = onClickAction;
  document.getElementById("input-first-name").setAttribute('disabled', '');
  document.getElementById("input-last-name").setAttribute('disabled', '');
  document.getElementById("input-title").setAttribute('disabled', '');
  document.getElementById("input-phone-number").setAttribute('disabled', '');
  document.getElementById("input-email-address").setAttribute('disabled', '');

  document.getElementById('update-record-button').classList.add('d-none');
  document.getElementById('delete-record-button').classList.add('d-none');
  document.getElementById('confirm-record-updates-button').classList.remove('d-none');
}

/*
  API: Local SQL Queries - Select (read-only local query)

  The select request allows advanced users to create an arbitrary select query using Pulsar's built in database engine. 
  https://luminix.atlassian.net/wiki/spaces/PD/pages/8683529/Pulsar+Platform+-+JS+Bridge+API#select
*/
const callRecordToEdit = (recordId) => {
  const request = {
    type: 'select',
    object: 'Contact',
    data: { 
      query: `SELECT FirstName, LastName, Title, Phone, Email FROM Contact WHERE Id ="${recordId}"`
    }
  }

  return new Promise((resolve) => {
    bridge.sendRequest(request, (responseData) => {
      resolve(responseData.data[0])
    });
  });
}

/*
  This creates the Edit page. 
*/
const showEditPage = (recordInformation) => {
  document.getElementById('selected-account').classList.add('d-none');
  document.getElementById('select-account').classList.add('d-none');
  document.getElementById('show-all-records').classList.add('d-none');
  document.getElementById('update-record-button').classList.remove('d-none');
  document.getElementById('delete-record-button').classList.remove('d-none');
  document.getElementById('record-edit').classList.remove('d-none');

  document.getElementById("input-first-name").value = recordInformation.FirstName;
  document.getElementById("input-last-name").value = recordInformation.LastName;
  document.getElementById("input-title").value = recordInformation.Title;
  document.getElementById("input-phone-number").value = recordInformation.Phone
  document.getElementById("input-email-address").value = recordInformation.Email;
}

/*
  This calls callRecordToEdit with the recordId. That returns that data for that contact record which it then passes to the showEditPage function. 
*/
const editRow = async (rowId) => {
  const recordId = rowId.parentNode.parentNode.id;
  const recordInformation = await callRecordToEdit(recordId);
  editRecordId = recordId;
  showEditPage(recordInformation);
}

/*
  This builds a new row for each Contact record. 
*/
const createRow = (record, recordId) => {
  const tableBody = document.getElementById('show-all-records-body');
  const newRow = document.createElement('tr');
  newRow.setAttribute('id', recordId);

  for (const property in record) {
    const newRowItem = document.createElement('td');
    newRowItem.textContent = record[property];
    newRow.appendChild(newRowItem);
  }
  const buttonItem = document.createElement('td');
  buttonItem.innerHTML = `<button type="button" onClick="editRow(this)" class="btn btn-outline-primary noPadding text-change edit-button">Edit</button>`
  newRow.appendChild(buttonItem);

  tableBody.appendChild(newRow);
}

/*
  All contact records from the Account are passed into this function.
  For each record, it checks that there is data for each Object Key. If not, returns No Data as the value.
  It passes the record Object and recordId to the createRow function
*/
const buildTableOfRecords = (allRecords) => {
  allRecordsForAccount = allRecords;
  allRecords.forEach((record) => {
    const recordId = record.Id;
    const firstName = record.FirstName.length > 0 ? record.FirstName : '***** No Data *****';
    const lastName = record.LastName.length > 0 ? record.LastName : '***** No Data *****';
    const title = record.Title.length > 0 ? record.Title : '***** No Data *****';
    const phoneNumber = record.Phone.length > 0 ? record.Phone : '***** No Data *****';
    const emailAddress = record.Email.length > 0 ? record.Email : '***** No Data *****';
    const recordData = {
      FirstName: firstName,
      LastName: lastName,
      Title: title,
      Phone: phoneNumber,
      Email: emailAddress
    };

    createRow(recordData, recordId);
  });
}

/*
  API: Local SQL Queries - Select (read-only local query)

  The select request allows advanced users to create an arbitrary select query using Pulsar's built in database engine. 
  https://luminix.atlassian.net/wiki/spaces/PD/pages/8683529/Pulsar+Platform+-+JS+Bridge+API#select
*/
const allContactRecords = () => {
  const request = {
    type: 'select',
    object: 'Contact',
    data: { 
      query: `SELECT Id, FirstName, LastName, Title, Phone, Email FROM Contact WHERE AccountId ="${accountId}"`
    }
  }

  return new Promise((resolve) => {
    bridge.sendRequest(request, (responseData) => {
      resolve(responseData.data)
    });
  });
}

const showAllRecords = async () => {
  const allRecords = await allContactRecords();
  buildTableOfRecords(allRecords);
}

const findAccount = async () => {
  const selectedAccount = await selectAccount();
  showAccountDetails(selectedAccount);
};

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

  return new Promise((resolve, reject) => {
    bridge.sendRequest(request, (responseData) => {
      if ((responseData.type == 'lookupObjectResponse')
        && (responseData.data != null)) {
        resolve(responseData.data[0])
      } else {
        reject('error');
      }
    });
  });
}

document.getElementById('search-again').onclick = () => {
  findAccount();
}

document.getElementById('account-confirm').onclick = () => {
  document.getElementById('account-confirm').classList.add('d-none');
  document.getElementById('search-again').classList.add('d-none');
  document.getElementById('reset').classList.remove('d-none');
  document.getElementById('show-all-records').classList.remove('d-none');
  showAllRecords();
}

document.getElementById('confirm-record-updates-button').onclick = () => {
  saveNewChanges();
};

document.getElementById('delete-record-button').onclick = () => {
  confirmChanges('delete');
};

document.getElementById('update-record-button').onclick = () => {
  confirmChanges('update');
};

document.getElementById('account-search').onclick = () => {
  findAccount();
};

document.getElementById('back-to-main-page').onclick = () => {
  location.href = 'index.html';
};

// Reloads the Document
document.getElementById('reset').onclick = () => {
  location.reload();
}
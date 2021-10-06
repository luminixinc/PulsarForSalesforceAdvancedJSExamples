const newRecordsToCreate = [];
let accountId = '';
let editId = '';

/*
  API: "CRUD" Request Types - Create

  Saves all record objects within the newRecordsToCreate array by calling the create API on each record
  https://luminix.atlassian.net/wiki/spaces/PD/pages/8683529/Pulsar+Platform+-+JS+Bridge+API#create
*/
const saveAllRecords = () => {
  const request = {
    type: "create",
    object: "Contact",
    data: {},
    args: { "skipLayoutRequiredFieldCheck": "FALSE"} // OPTIONAL : if specified as "TRUE", will avoid checking for missing layout required fields
  };

  newRecordsToCreate.forEach((newRecord) => {
    request.data = newRecord;
    request.data.AccountId = accountId;

    console.log(JSON.stringify(request))

    bridge.sendRequest(request, (responseData) => { 
      console.log(JSON.stringify(responseData));
    });
  });

  confirmation(newRecordsToCreate.length);
}

/*
  This builds out each row within the new-records table.
  Each row is given it's own unique ID and an Edit button is created.
*/
const addSingleRecordToNewRecordsPage = (newRecord) => {
  const tableBody = document.getElementById('new-records-body');
  const newRow = document.createElement('tr');
  const count = document.getElementById('entry-table').rows.length;
  newRow.setAttribute('id', count)

  for (const property in newRecord) {
    const newRowItem = document.createElement('td');
    newRowItem.textContent = newRecord[property];
    newRow.appendChild(newRowItem);
  }

  const buttonItem = document.createElement('td');
  buttonItem.innerHTML = `<button type="button" onClick="editRow(this)" class="btn btn-outline-primary noPadding text-change edit-button">Edit</button>`
  newRow.appendChild(buttonItem);

  tableBody.appendChild(newRow);
  closeCreateNewRecord();
}

/*
  Resets the body of the table then loops through all the newRecordsToCreate entries.
  For each Object record, it calls the addSingleRecordToNewRecordsPage function with the Object record data
*/
const createTableOnPage = () => {
  document.getElementById('new-records-body').innerHTML = '';
  newRecordsToCreate.forEach((record) => {
    addSingleRecordToNewRecordsPage(record);
  });
  document.getElementById('save-all-records-button').classList.remove('d-none');
}

/* 
  Creates an Object with the entered data on creation which is then pushed into the newRecordsToCreate array.
*/
const addSingleRecord = () => {
  const firstName = document.getElementById("input-first-name").value;
  const lastName = document.getElementById("input-last-name").value;
  const title = document.getElementById("input-title").value;
  const phoneNumber = document.getElementById("input-phone-number").value;
  const emailAddress = document.getElementById("input-email-address").value;

  const recordData = {
    FirstName: firstName,
    LastName: lastName,
    Title: title,
    Phone: phoneNumber,
    Email: emailAddress
  }

  newRecordsToCreate.push(recordData);
  createTableOnPage();
}

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

const resetNewRecordFields = () => {
  document.getElementById("input-first-name").value = '';
  document.getElementById("input-last-name").value = '';
  document.getElementById("input-title").value = '';
  document.getElementById("input-phone-number").value = '';
  document.getElementById("input-email-address").value = '';
}

const singleRecordUpdates = () => {
  document.getElementById('create-new-records').classList.add('d-none');
  document.getElementById('selected-account').classList.add('d-none');
  document.getElementById('record-creation').classList.remove('d-none');
  document.getElementById('reset').classList.add('d-none');
  document.getElementById('save-all-records-button').classList.add('d-none');
}

const clearToSearchAccount = () => {
  document.getElementById('create-edit-buttons').classList.add('d-none');
  document.getElementById('select-account').classList.remove('d-none');
  document.getElementById('reset').classList.remove('d-none');
}

const closeCreateNewRecord = () => {
  document.getElementById('create-new-records').classList.remove('d-none');
  document.getElementById('selected-account').classList.remove('d-none');
  document.getElementById('record-creation').classList.add('d-none');
  document.getElementById('new-records-list').classList.remove('d-none');
  document.getElementById('save-all-records-button').classList.add('d-none');
}

const updateRecord = () => {
  newRecordsToCreate[editId].FirstName = document.getElementById("input-first-name").value;
  newRecordsToCreate[editId].LastName = document.getElementById("input-last-name").value;
  newRecordsToCreate[editId].Title = document.getElementById("input-title").value;
  newRecordsToCreate[editId].Phone = document.getElementById("input-phone-number").value;
  newRecordsToCreate[editId].Email = document.getElementById("input-email-address").value;

  singleRecordUpdates();
  resetNewRecordFields();
  closeCreateNewRecord();
  createTableOnPage();
}

const editPage = (recordData) => {
  singleRecordUpdates();
  document.getElementById("input-first-name").value = recordData.FirstName;
  document.getElementById("input-last-name").value = recordData.LastName;
  document.getElementById("input-title").value = recordData.Title;
  document.getElementById("input-phone-number").value = recordData.Phone
  document.getElementById("input-email-address").value = recordData.Email;
  document.getElementById('add-new-record-button').classList.add('d-none');
  document.getElementById('update-record-button').classList.remove('d-none');
}

const editRow = (rowId) => {
  const idOfRow = rowId.parentNode.parentNode.id
  const dataOfRow = newRecordsToCreate[idOfRow - 1];
  editId = idOfRow -1;
  
  editPage(dataOfRow)
}

const confirmation = (count) => {
  const message = count === 1 ? `${count} record created` : `${count} records created`;
  document.getElementById('confirmation-message').innerHTML = message;
  document.getElementById('confirmation').classList.remove('d-none');
  document.getElementById('create-new-records').classList.add('d-none');
  document.getElementById('selected-account').classList.add('d-none');
  document.getElementById('save-all-records').classList.add('d-none');
  document.getElementById('reset').classList.add('d-none');
}

document.getElementById('update-record').onclick = () => {
  updateRecord();
}

document.getElementById('add-more-records').onclick = () => {
  location.reload();
}

document.getElementById('home').onclick = () => {
  location.href = '../index.html';
};

document.getElementById('save-all-records').onclick = () => {
  saveAllRecords();
}

document.getElementById('add-new-record').onclick = () => {
  addSingleRecord();
}

document.getElementById('create-new-record').onclick = () => {
  singleRecordUpdates();
  resetNewRecordFields();
}

document.getElementById('search-again').onclick = () => {
  selectAccount();
}

document.getElementById('account-confirm').onclick = () => {
  document.getElementById('create-new-records').classList.remove('d-none');
  document.getElementById('account-confirm').classList.add('d-none');
  document.getElementById('search-again').classList.add('d-none');
  document.getElementById('reset').classList.remove('d-none');
}

// Reloads the Document
document.getElementById('reset').onclick = () => {
  location.reload();
}

document.getElementById('account-search').onclick = () => {
  selectAccount();
};

document.getElementById('back-to-main-page').onclick = () => {
  location.href = 'index.html';
};
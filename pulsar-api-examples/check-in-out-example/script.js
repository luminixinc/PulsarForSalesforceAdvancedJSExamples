let accountId;
let userId;
let dateTimeNow;
let locationInformation;
let eventId;

/*
  Builds the Checked-out confirmation screen
*/
const checkOutConfirmation = () => {
  document.getElementById('selected-account').classList.add('d-none');
  document.getElementById('check-in-details-container').classList.add('d-none');
  document.getElementById('check-out-confirmation').classList.remove('d-none');
}

/*
  Updates the Check-in Event on the local database
  API: Local SQL Queries - Update

  https://luminix.atlassian.net/wiki/spaces/PD/pages/8683529/Pulsar+Platform+-+JS+Bridge+API#update
*/
const updateToCheckOut = () => {
  const currentDateTime = dateTime();
  const request = { 
    type: 'updateQuery',
    object: 'Event',
    data: { 
      query: `UPDATE Event SET EndDateTime = '${currentDateTime}', Subject = 'Checked-out' WHERE Id = '${eventId}'`
    }
  };

  return new Promise((resolve) => {
    bridge.sendRequest(request, (responseData) => {
      resolve(responseData.data)
    });
  });
}

const checkOut = async () => {
  await updateToCheckOut();
  checkOutConfirmation();
}

/*
  Function to build out the information if there is an existing check-in event
*/
const buildEventDetailsOnPage = (details) => {
  const date = details.activityDateTime.substring(0, 10);
  const time = details.activityDateTime.substring(11, 16);

  const checkInDetails =
  `
    <div class="text-center fs-4 pb-4">
      Already Checked-in
    </div>
    <dl class="row" id="">
      <dt class="col-md-3">Check-in Date:</dt>
      <dd class="col-md-9">${date}</dd>
      <dt class="col-md-3">Check-in Time:</dt>
      <dd class="col-md-9">${time}</dd>
      <dt class="col-md-3">Location:</dt>
      <dd class="col-md-9">${details.location}</dd>
    </dl>
  `
  document.getElementById('check-in-details').innerHTML = checkInDetails;
  document.getElementById('check-in-details-container').classList.remove('d-none');
  document.getElementById('check-out-container').classList.remove('d-none');
}

/*
  Helper function to confirm if there is data returned or if it's an empty object
*/
const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
}

/*
  Searches local DB to see if there is a Checked-in Event referencing that account
  API - Local SQL Queries - Select (read-only local query)
  https://luminix.atlassian.net/wiki/spaces/PD/pages/8683529/Pulsar+Platform+-+JS+Bridge+API#select
*/
const searchForEvent = () => {
  const request = {
    type: 'select',
    object: 'Event',
    data: {
      query: `SELECT ActivityDateTime, OwnerId, Location, CreatedById, WhoId, Id FROM Event WHERE WhatId = '${accountId}' AND Subject = 'Checked-in'`
    }
  }

  return new Promise((resolve) => {
    bridge.sendRequest(request, (responseData) => { 
      if (isEmpty(responseData.data)) {
        resolve(false);
      } else {
        eventId = responseData.data[0].Id;
        resolve(responseData.data[0]);
      }
    });
  });
}

/*
  Helper function that calls a function to search if Account has a checked-in event and returns that data.
*/
const ifCheckedIn = async () => {
  const existingEvent = await searchForEvent();
  
  if (existingEvent) {
    const data = {
      activityDateTime: existingEvent.ActivityDateTime,
      location: existingEvent.Location
    };
    console.log(data)
    buildEventDetailsOnPage(data);
  } else {
    document.getElementById('check-in-container').classList.remove('d-none');
  }
  console.log(existingEvent);
}

/*
  Creates an Event assigned to the chosen Account
  API: "CRUD" Request Types - Create
  https://luminix.atlassian.net/wiki/spaces/PD/pages/8683529/Pulsar+Platform+-+JS+Bridge+API#create
*/
const createEventOnSalesforce = () => {
  const request = {
    type: 'create',
    object: 'Event',
    data: {
      DurationInMinutes: '60',
      ActivityDateTime: dateTimeNow,
      OwnerId: userId,
      Subject: 'Checked-in',
      Location: locationInformation,
      WhatId: accountId
    }
  }

  bridge.sendRequest(request, (responseData) => { 
    console.log(`New Event Created: ${responseData.data}`);
  });
}

/*
  Just a small helper function to update the user that they're currently being checked-in.
*/
const loadingCheckInDetails = () => {
  const message = 
  `
  <div class="text-center fs-1">
    Checking-in .....
  </div>
  `

  document.getElementById('check-in-details').innerHTML = message;
  document.getElementById('check-in-details-container').classList.remove('d-none');
  document.getElementById('check-in-container').classList.add('d-none');
}

/*
  Builds out and returns confirmation of Check-in
*/
const checkIn = async () => {
  loadingCheckInDetails();
  const locationDetails = await getLocation();
  const currentDateTime = dateTime();
  const date = currentDateTime.substring(0, 10);
  const time = currentDateTime.substring(11, 16);
  const currentCheckInUser = await userInfo();
  dateTimeNow = currentDateTime;
  locationInformation = `Longitude: ${locationDetails.longitude} Latitude: ${locationDetails.latitude}`

  const checkInDetails =
  `
    <div class="text-center fs-4 pb-4">
      You've checked-in!
    </div>
    <dl class="row" id="">
      <dt class="col-md-3">Name:</dt>
      <dd class="col-md-9">${currentCheckInUser.fullname}</dd>
      <dt class="col-md-3">Username:</dt>
      <dd class="col-md-9">${currentCheckInUser.username}</dd>
      <dt class="col-md-3">Check-in Date:</dt>
      <dd class="col-md-9">${date}</dd>
      <dt class="col-md-3">Check-in Time:</dt>
      <dd class="col-md-9">${time}</dd>
      <dt class="col-md-3">Location:</dt>
      <dd class="col-md-9">Longitude: ${locationDetails.longitude} Latitude: ${locationDetails.latitude}</dd>
    </dl>
  `

  document.getElementById('check-in-details').innerHTML = checkInDetails;
  document.getElementById('check-out-container').classList.remove('d-none');
  createEventOnSalesforce();
}


/*
  Returns the date and time in a Salesforce Specific format
*/
const dateTime = () => {
  const date = new Date();
  
  console.log(`dateTime: ${date.toISOString()}`)
  return date.toISOString(); //'2021-10-20T18:45:05.875Z'
}

/*
  API: getLocation

  The getLocation query returns the device location coordinates, in the form of a javascript object with "longitude" and "latitude" properties. This will not work properly if the user does not grant the app access to the device's location services.

  https://luminix.atlassian.net/wiki/spaces/PD/pages/122912811/Pulsar+General+Information+API#getLocation
*/
const getLocation = () => {
  const request = {
    type: 'getLocation',
    data: { } // empty object- this is required in the current API
  };

  return new Promise((resolve) => {
    bridge.sendRequest(request, (responseData) => {
      if (responseData.type === "getLocationResponse") {
        const coord = {
          longitude: responseData.data.longitude,
          latitude: responseData.data.latitude 
        }

        resolve(coord);
      } else if (responseData.type == 'error') {
        const errStr = responseData.data;

        alert('A problem occurred:\n' + errStr);
      }
    });
  });
}

/*
  API: userInfo
  
  The userInfo query returns the following information about the currently logged in user:
  - Salesforce Username
  - Salesforce UserId
  - Salesforce User Locale
  - Salesforce User Full Name
  - Salesforce User Profile Id
  - Salesforce User Profile Name (if available)
  - Salesforce User Role Id
  - Salesforce User Role Name (if available)
  - Salesforce Org Id
  - Salesforce Session Id
  - Pulsar Last Successful Sync date (or "NEVER" if never synced)
  - Pulsar Version

  https://luminix.atlassian.net/wiki/spaces/PD/pages/122912811/Pulsar+General+Information+API#userInfo
*/
const userInfo = () => {
  const request = { 
    type: 'userInfo',
    data: { } // empty object- this is required in the current API
  };

  return new Promise((resolve) => {
    bridge.sendRequest(request, (results) => {
      console.log('Javascript got its response: ' + results);
        if (results.type === 'userInfoResponse')	{
          userId = results.data.userid;
          const data = {
            username: results.data.username,
            fullname: results.data.userfullname
          }
          
          resolve(data);
        } else if (results.type == 'error') {
          errStr = results.data;
          alert('A problem occurred:\n' + errStr);
        }
    });
  });
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

document.getElementById('check-out').onclick = () => {
  checkOut();
}

document.getElementById('check-in-button').onclick = () => {
  checkIn();
}

document.getElementById('search-again').onclick = () => {
  selectAccount();
}

document.getElementById('account-confirm').onclick = () => {
  document.getElementById('account-confirm').classList.add('d-none');
  document.getElementById('search-again').classList.add('d-none');
  ifCheckedIn();
}

document.getElementById('account-search').onclick = () => {
  selectAccount();
};

document.getElementById('return-home').onclick = () => {
  location.href = '../index.html';
};
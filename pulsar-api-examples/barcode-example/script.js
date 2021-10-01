let productName = '';
let barcodeId = '';
let productCode = '';
let product2Id = '';
let pricebook2Id = '';
let productPrice = '';

/*
  Creates a Success Alert
*/
const createAlert = () => {
  document.getElementById('alert-open').classList.remove('d-none');
}

/*
  Closes the Success Alert
*/
document.getElementById('alert-close').onclick = () => {
  document.getElementById('alert-open').classList.add('d-none');
};

/*
  Creates an entry within the Standard Price Book
  API: "CRUD" Request Types - Create
  https://luminix.atlassian.net/wiki/spaces/PD/pages/8683529/Pulsar+Platform+-+JS+Bridge+API#create
*/
const createPricebookItem = () => {
  const request = {
    type: 'create',
    object: 'PricebookEntry',
    data: {
      Pricebook2Id: pricebook2Id,
      Product2Id: product2Id,
      UnitPrice: productPrice
    }
  }

  bridge.sendRequest(request, (responseData) => { 
    console.log(`New Product Item Created. Product ID: ${responseData.data}`)
    createAlert();
  });
}

/*
  Searches local DB for the standard price book and returns the ID
  API - Local SQL Queries - Select (read-only local query)
  https://luminix.atlassian.net/wiki/spaces/PD/pages/8683529/Pulsar+Platform+-+JS+Bridge+API#select
*/
const searchPriceBooks = () => {
  const request = {
    type: 'select',
    object: 'Pricebook2',
    data: {
      query: "SELECT Id FROM Pricebook2 WHERE Name = 'Standard Price Book'"
    }
  }

  bridge.sendRequest(request, (responseData) => { 
    pricebook2Id = responseData.data[0].Id;
    console.log(`Pricebook2 ID: ${pricebook2Id}`);
    createPricebookItem();
  });
}

/*
  Create request for a new Product
  API: "CRUD" Request Types - Create
  https://luminix.atlassian.net/wiki/spaces/PD/pages/8683529/Pulsar+Platform+-+JS+Bridge+API#create
*/
const createProduct = () => {
  const request = {
    type: 'create',
    object: 'Product2',
    data: {
      Name: productName,
      ProductCode: productCode
    }
  }

  bridge.sendRequest(request, (responseData) => { 
    product2Id = responseData.data;
    console.log(`New Product Created. ID: ${product2Id}`)
    searchPriceBooks();
  });
}

/*
  Function to open the devices camera and scan a barcode
  API: scanBarcode
  The scanBarcode command allows the user to scan a barcode. The response callback will return the value of the scanned barcode.
  https://luminix.atlassian.net/wiki/spaces/PD/pages/122716166/Native+Pulsar+UI+Interaction+API#scanbarcode
*/
const barcodeScanner = () => {
  const request = { 
    type: 'scanBarcode',
    data: { /* data is empty */ } 
  };

  bridge.sendRequest(request, (responseData) => { 
    if ((responseData.type === 'scanBarcodeResponse') && (responseData.data !== null)) {
      if (responseData.data.barcode.length > 1) {
        barcodeId = responseData.data.barcode
        productCode = responseData.data.barcode
        showInput();
      } else {
        document.getElementById('nothing-scanned').classList.remove('d-none');
      }
    }
  });
}

const resetProductInformation = () => {
  // Hides the second card showing Product Information
  document.getElementById('product-creation-input').classList.add('d-none');

  // Removes the button to scan the barcode
  document.getElementById('scan-barcode').classList.add('d-none');

  // Shows the Confirm button for the Product Entry
  document.getElementById('confirm-product-name').classList.remove('d-none');

  // Removes the clear button
  document.getElementById('clear-product-name').classList.add('d-none');
  
  // Enables the buttons and text entry
  document.getElementById('product-name-text').removeAttribute('disabled', '');
  document.getElementById('scan-barcode').removeAttribute('disabled', '');
  document.getElementById('clear-product-name').removeAttribute('disabled', '');
  document.getElementById('product-dollar-price').removeAttribute('disabled', '');

  // Sets the default value
  document.getElementById('product-name-text').value=''
  document.getElementById('product-dollar-price').value=''
  
  // Resets the placeholder text
  document.getElementById('product-name-text').placeholder='Product Name'
  document.getElementById('product-dollar-price').placeholder='$'
}

const showInput = () => {
  document.getElementById('product-creation-input').classList.remove('d-none');
  document.getElementById('product-code').innerHTML = productCode;
  document.getElementById('product-name').innerHTML = productName;
  document.getElementById('product-price').innerHTML = `$${productPrice}`;
  document.getElementById('barcode-id').innerHTML = barcodeId;
  document.getElementById('scan-barcode').setAttribute('disabled', '');
  document.getElementById('clear-product-name').setAttribute('disabled', '');
}

// Creates new Product
document.getElementById('create-new-product').onclick = () => {
  createProduct();
};

// Opens the barcode Scanner
document.getElementById('scan-barcode').onclick = () => {
  barcodeScanner();
};

document.getElementById('reset').onclick = () => {
  resetProductInformation();
};

document.getElementById('clear-product-name').onclick = () => {
  resetProductInformation();
};

// Function to add text that lets the user know that the Product Name is invalid.
const productNameInvalid = () => {
  document.getElementById('product-name-text').classList.add('is-invalid');
  document.getElementById('invalid-product-name').classList.remove('d-none');
}

// Function to add text that lets the user know that the Product Price is invalid.
const productValueInvalid = () => {
  document.getElementById('product-dollar-price').classList.add('is-invalid');
  document.getElementById('invalid-product-price').classList.remove('d-none');
}

document.getElementById('confirm-product-name').onclick = () => {
  const productInputValue = document.getElementById('product-dollar-price').value
  const productInputName = document.getElementById('product-name-text').value
  productPrice = productInputValue;

  if (productInputName.length === 0 && productInputValue.length === 0) {
    productValueInvalid();
    productNameInvalid();
  } else if (productInputName.length === 0) {
    productNameInvalid();
    document.getElementById('invalid-product-price').classList.remove('d-none');
  } else if (productInputValue.length === 0) {
    productValueInvalid();
    document.getElementById('invalid-product-name').classList.add('d-none');
  } else {
    // Sets the Product Name as a variable
    productName = document.getElementById('product-name-text').placeholder=productInputName

    document.getElementById('clear-product-name').classList.remove('d-none');
    document.getElementById('confirm-product-name').classList.add('d-none');
    
    // Adds the button to scan the barcode
    document.getElementById('scan-barcode').classList.remove('d-none');

    // Adds the product name as a placeholder within the textbox and disables the ability to change the text
    document.getElementById('product-name-text').setAttribute('disabled', '');
    document.getElementById('product-name-text').placeholder=productInputName;
    document.getElementById('product-dollar-price').setAttribute('disabled', '');
    document.getElementById('product-dollar-price').placeholder=productInputValue;
    
    // Removes any error texts showing
    document.getElementById('invalid-product-name').classList.add('d-none');
    document.getElementById('invalid-product-price').classList.add('d-none');
    document.getElementById('product-name-text').classList.remove('is-invalid');
    document.getElementById('product-dollar-price').classList.remove('is-invalid');
  }
};
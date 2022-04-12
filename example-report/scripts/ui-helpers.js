/* ********************************************************************
/* Hide Element Functions
/* ********************************************************************/
const _originalDisplayStyleMap = new Map();

function hideElementById(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    return;
  }
  if (!_originalDisplayStyleMap.has(elementId)) {
    _originalDisplayStyleMap.set(elementId, element.style.display);
  }

  element.style.display = 'none';
}

function hideElementsByIds(elementIds) {
  elementIds.forEach(eid => hideElementById(eid));
}

function showElementById(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    return;
  }
  if (_originalDisplayStyleMap.has(elementId)) {
    element.style.display = _originalDisplayStyleMap.get(elementId);
  } else {
    element.style.display = '';
  }
}

function showElementsByIds(elementIds) {
  elementIds.forEach(eid => showElementById(eid));
}

const idsToHideWhenPDFSaved = [
  'pdf-creation',
  'print-document-button',
  'signature-buttons',
  'pdf-instructions',
  'signature-instructions',
  'account-selection-instructions',
  'completed-instructions'
];

const idsToHideForAccountSelection = [
  'document-actions',
  'pdf-instructions',
  'pdf-creation',
  'pdf-preview',
  'signature-instructions',
  'completed-instructions'
];

const elementsToHideForPDFPreview = [
  'account-selection-instructions',
  'document-actions',
  'print-document-button',
  'signature-pad-div',
  'signature-buttons'
];

const elementsToShowForPDFPreview = [
  'pdf-instructions',
  'signature-instructions',
  'signature-pad',
  'pdf-preview',
  'document'
];

const elementsToShowForSaveSignature = [
  'signature-submit',
  'signature-buttons',
];

const elementsToHideForSaveAs = [
  'signature-submit',
  'signature-pad'
];

const elementsToShowForSaveAs = [
  'signature-pad-div',
  'print-document-button',
  'document-actions'
];

const elementsToHideForPDFGeneration = [
  'signature-buttons',
  'pdf-instructions',
  'signature-instructions',
  'account-selection-instructions',
  'completed-instructions',
  'document-actions',
];
/* ********************************************************************/
/* ********************************************************************/

/* ********************************************************************
 * Instruction Code
/* ********************************************************************/
function setupInstructions() {
  addAccountSelectionHtml();
  addPdfInstructionsHtml();
  addSignatureInstructionsHtml();
  addCompletedInstructionsHtml();
  hideElementsByIds(['pdf-instructions', 'signature-instructions']);
}

function addAccountSelectionHtml() {
  const accountSelectionElement = document.getElementById('account-selection-instructions');
  accountSelectionElement.innerHTML = accountSelectionHtml;
}

function addPdfInstructionsHtml() {
  const pdfInstructionsElement = document.getElementById('pdf-instructions');
  pdfInstructionsElement.innerHTML = pdfInstructionsHtml;
}

function addCompletedInstructionsHtml() {
  const completedInstructionsElement = document.getElementById('completed-instructions');
  completedInstructionsElement.innerHTML = completedInstructionsHtml;
}

function addSignatureInstructionsHtml() {
  const signatureInstructionsElement = document.getElementById('signature-instructions');
  signatureInstructionsElement.innerHTML = signatureInstructionsHtml;
}
/* ********************************************************************
/* ********************************************************************/

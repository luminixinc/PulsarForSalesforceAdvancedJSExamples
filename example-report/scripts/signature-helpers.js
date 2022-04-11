/* ************************************************************************ */
/* Signature Functions
/* ************************************************************************ */
function setupSignaturePad() {
  const signaturePadElement = document.getElementById('signature-pad');
  signaturePad = new SignaturePad(signaturePadElement, {
      backgroundColor: 'rgba(211, 211, 211, 0.5)',
      penColor: 'rgb(0, 0, 0)'
  });
  signaturePad.onEnd = onSignatureEnd;
}

function captureSignatureAsImage() {
  const signatureUrl = signaturePad.toDataURL();
  const signatureDivElement = document.getElementById('signature-pad-div');
  const signatureImageElement = document.getElementById('signature-pad-img');
  signatureImageElement.src = signatureUrl;
}

function clearSignatureImage() {
  const signatureImageElement = document.getElementById('signature-pad-img');
  signatureImageElement.src = '';
}
/* ************************************************************************ */
/* ************************************************************************ */

class WindowsStrategy {

  constructor() {}

  removePreviewStyling() {
    /* Nothing to do here. */
  }

  addPDFPreviewElements() {
    const pdfPreviewElement = document.getElementById('pdf-preview');
    pdfPreviewElement.innerHTML = windowsPDFFragment;
  }

  addMetaTagsToIFrame(iFrameId) {
    let metacharset = document.createElement('meta');
    metacharset.httpEquiv = 'Content-Type';
    metacharset.content = 'text/html;charset=UTF-8';
    const iframe = document.getElementById(iFrameId);
    iframe.contentDocument.head.appendChild(metacharset);
  }

  addMetaTagsToIFrames(iFrameIds) {
    iFrameIds.forEach( iFrameId => this.addMetaTagsToIFrame(iFrameId));
  }

  addCSSToIFrames() {
    /* No CSS is necessary for Windows in this example. */
  }

  calculateHeaderAndFooterHeight() {
    const headerHeight = document.getElementById('report-header').scrollHeight;
    const footerHeight = document.getElementById('report-footer').scrollHeight;
    return { headerHeight, footerHeight };
  }

  prepareDocumentForRendering() {
    const headerHeight = document.getElementById('report-header').scrollHeight;
    const footerHeight = document.getElementById('report-footer').scrollHeight;
    const headerFrame = document.getElementById('headerIFrame');
    const footerFrame = document.getElementById('footerIFrame');

    headerFrame.style.height = headerHeight + 'px';
    footerFrame.style.height = footerHeight + 'px';
  }

  moveContentToIFrames() {
    const headerFrame = document.getElementById('headerIFrame');
    const headerContent = document.getElementById('report-header');
    headerFrame.contentDocument.body.appendChild(headerContent);

    const bodyFrame = document.getElementById('bodyIFrame');
    const bodyContent = document.getElementById('report-body');
    bodyFrame.contentDocument.body.appendChild(bodyContent);

    const footerFrame = document.getElementById('footerIFrame');
    const footerContent = document.getElementById('report-footer');
    footerFrame.contentDocument.body.appendChild(footerContent);
  }
}

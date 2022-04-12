class AndroidStrategy {

  constructor() {}

  removePreviewStyling() {
    // remove preview styles from the table element
    const documentNode = document.getElementById('android-table');
    documentNode.classList.remove('preview');
  }

  addPDFPreviewElements() {
    /* Nothing to do here. */
  }

  addPDFPreviewElements() {
    const pdfPreviewElement = document.getElementById('pdf-preview');
    pdfPreviewElement.innerHTML = androidPDFFragment;
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
    /* No CSS is necessary for Android in this example. */
  }

  /* The Android PDF renderer does not need a header or footer height
  argument. */
  calculateHeaderAndFooterHeight() {
    const headerHeight = 0;
    const footerHeight = 0;
    return { headerHeight, footerHeight };
  }

  /* The Android platform relies on a table structure for rendering the
   * document. To ensure that the footer is at the bottom of every page, an
   * absolutely placed <div> (see android-pdf.html) is used. To prevent this
   * <div> from being rendered on top of other content, add a child <div> with
   * a defined height equal to that of our desired footer content height to
   * the <tfoot>.*/
  prepareDocumentForRendering() {
    const footerContent = document.getElementById('report-footer');
    let footerHeight = footerContent.scrollHeight;
    const footerPlaceholder = document.getElementById('android-footer-space');
    footerPlaceholder.style.height = footerHeight + 'px';
  }

  moveContentToIFrames() {
    /* Move the footer content from the preview section to the PDF creation
     * section. */
    const printFooterElement = document.getElementById('android-print-footer');
    const previewFooterElement = document.getElementById('report-footer');
    printFooterElement.appendChild(previewFooterElement);

    const bodyFrame = document.getElementById('bodyIFrame');
    const bodyContent = document.getElementById('document');
    bodyFrame.contentDocument.body.appendChild(bodyContent);
  }
}

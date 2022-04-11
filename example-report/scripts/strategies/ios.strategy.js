class IOSStrategy {

  constructor() {}

  removePreviewStyling() {
    /* Nothing to do here. */
  }

  addMetaTagsToIFrame(iFrameId) {
    const iframe = document.getElementById(iFrameId);
    const metacharset = document.createElement('meta');
    metacharset.httpEquiv = 'Content-Type';
    metacharset.content = 'text/html;charset=UTF-8';
    iframe.contentDocument.head.appendChild(metacharset);

    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=2382, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no';
    iframe.contentDocument.head.appendChild(meta);
  }

  addMetaTagsToIFrames(iFrameIds) {
    iFrameIds.forEach(iFrameId => this.addMetaTagsToIFrame(iFrameId));
  }

  addCSSToIFrames() {
    this.addCSSToIFrame('headerIFrame', 'styles/ios-header-footer-styles.css');
    this.addCSSToIFrame('footerIFrame', 'styles/ios-header-footer-styles.css');
  }

  addCSSToIFrame(iFrameId, cssPath) {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.type = 'text/css';
    linkElement.crossOrigin = 'anonymous';
    linkElement.href = cssPath;
    const iframe = document.getElementById(iFrameId);
    iframe.contentDocument.head.appendChild(linkElement);
  }

  calculateHeaderAndFooterHeight() {
    const headerHeight = document.getElementById('report-header').scrollHeight;
    const footerHeight = document.getElementById('report-footer').scrollHeight;
    return { headerHeight, footerHeight };
  }

  addMinimumSizeToPDF() {
    /* 816px is determined by the page size. The target is a standard US letter
    * page which is 8.5 inches wide. At 72 points per inch, and 4/3 pixels per
    * point. We can compute:
    * 8.5inches * 72points/inch * (4pixels/3point) = 816px */
    const pdfElement = document.getElementById('pdf-creation');
    pdfElement.style.minWidth = '816px';

    const documentElement = document.getElementById('document');
    documentElement.style.minWidth = '816px';
  }

  /* Resize the header/footer <iframe> to be 3 times larger.
   *
   * The width value of 2382 was arrived at through experimentation.
   * It is roughly 3 * 816px with some additional width removed to account
   * for margins. */
  enlargeHeaderIFrame() {
    const headerIFrame = document.getElementById('headerIFrame');
    const header = document.getElementById('report-header');
    const headerHeight = header.scrollHeight * 3.0;
    headerIFrame.height = headerHeight;
    headerIFrame.width = 2382;
  }

  enlargeFooterIFrame() {
    const footerIFrame = document.getElementById('footerIFrame');
    const footer = document.getElementById('report-footer');
    const footerHeight = footer.scrollHeight * 3.0;
    footerIFrame.height = footerHeight;
    footerIFrame.width = 2382;
  }

  /* Utility function to triple the height of <img> tags in the header/footer. */
  tripleImgHeight(tagId) {
    const imgs = document.getElementById(tagId).getElementsByTagName('img');
    for (var i = 0; i < imgs.length; i++) {
      let img = imgs[i];
      img.height = 3 * img.height;
      img.width = 3 * img.width;
    }
  }

  /* This function will be called after the header and footer content height has
  been calculated. This is important on iOS. The header and footer content
  provided must be three times larger than the height measures provided. */
  prepareDocumentForRendering() {
    this.addMinimumSizeToPDF();
    this.enlargeHeaderIFrame();
    this.enlargeFooterIFrame();
    this.tripleImgHeight('report-header');
    this.tripleImgHeight('report-footer');
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

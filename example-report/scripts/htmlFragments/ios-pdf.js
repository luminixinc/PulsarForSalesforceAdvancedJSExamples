/* ************************************************************************
 * iOS Content
 * ************************************************************************

On the iOS platform, the Pulsar saveas JSAPI uses UIPrintPageRenderer to
render a PDF.

UIPrintPageRenderer allows us to define HTML content for the header, body,
and footer individually. It also requires a known height for each of these
sections.

See notes below for preparing each content section for PDF rendering.

When each section is ready, attach it to the corresponding <iframe> so that
each document is in a well-defined location and free from extraneous styling.

The docnode argument is required. If a header or footer should be present,
include the corresponding headernode and headerheight and/or footernode and
footerheight arguments when making the saveas request. If a height is 0 or not
specified, the header/footer will not appear.

Important Notes:

Images: <img> elements inside our header and footer should have their height
and width explicitly defined with properties. We suggest defining one in pixels
and setting the other to 'auto' to keep your image proportions accurate. If
these properties are not set, the image may print larger than expected.

Headers / Footers: Due to the way iOS handles pixel density with regard to PDF
generation, it is necessary to enlarge the header and footer content to three
times the size used on other platforms. In this example, this is accomplished by
attaching CSS to the header and footer <iframe> before rendering.

Additionally, any <img> elements inside the header or footer must have their
explicitly defined height / width multiplied by three.

The headerheight and footerheight values also should be multiplied by three.

When rendered, the header and footer will be appropriately scaled to match the
body content by UIPrintPageRenderer.
/* *************************************************************************/
/* *************************************************************************/

const iosPDFFragment = `<div id="document">

  <div id="report-header" style="display: flex; align-items: center; flex-direction: row; justify-content: space-between;">
    <span id="header-date"></span>
    <img id="header-logo" src="images/luminix_logo.png" height="auto" width="300px"/>
  </div>

  <div id="report-body">

    <div id="contacts"></div>
    <div id="large-text-block"></div>
    <div id="signature-instructions" class="instructions"></div>
    <div id="signature-block">
      <h3>Sign Here: </h3>
      <div>
        <div style="text-align: center">
          <div id="m-signature-pad" style="display: inline-block">
            <div>
              <canvas id="signature-pad" class="signature-pad" width=800 height=225></canvas>
            </div>
          </div>
          <div id="signature-pad-div">
            <img id="signature-pad-img" width=800 height=225 />
          </div>
        </div>
        <div id="signature-buttons" style="text-align: center">
          <div class="red button" id="signature-clear-button" onclick="clearSignature();">Clear Signature</div>
          <div class="blue button" id="signature-submit" onclick="saveSignature();">Done Signing</div>
        </div>
      </div>
    </div>
  </div>

  <div id="report-footer" style="display: flex; align-items: center; flex-direction: row; justify-content: space-between;">
    <span id="footer-email">Email: <a href="javascript:alert('Send email to: service@luminixinc.com')">service@luminixinc.com</a> </span>
    <img id="footer-icon" src="images/pulsar_logo.png" height="auto" width="50px"/>
    <span id="footer-url" style="display: flex; align-items: center; flex-direction: column; justify-content: space-between;">
      <span>Website: <a href="https://luminixinc.com">luminixinc.com</a></span>
      <span>&nbsp;</span>
      <span>&nbsp;</span>
    </span>

  </div>

</div>
`;

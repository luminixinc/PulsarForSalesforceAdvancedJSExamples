/* ************************************************************************
 * Android Content
 * ************************************************************************

On the Android platform, the Pulsar saveas JSAPI uses Chrome browser to render
an HTML document into a PDF.

In order to correctly render a header and footer in our PDF, use
a <table>. The Android PDF rendering process does not allow the specification of
a header or footer separately from the document content to be printed. Therefore
the behaviors associated with the <table> tag are necessary to achieve a
repeating header and footer.

See notes below for preparing the <table> for PDF rendering.

When the <table> is ready, attach it as a child to the body <iframe> so that
the document is in a well-defined location and free from extraneous styles.

The headernode and footernode arguments to the saveas JSAPI call are not
used when rendering the PDF on this platform. The headerheight and footerheight
arguments are also ignored.

Only a valid element selection argument for the body is necessary.

e.g.
document.getElementById('${iframeId}').contentDocument
  or
window.top.document.getElementById('iFrame').contentDocument.getElementById('${iframeId}').contentDocument

...where iframeId is the Id of the iframe used to place the body. This example
uses 'bodyIFrame'.

Important Notes:

Images: <img> elements inside our header and footer should have their height
and width explicitly defined with properties. We suggest defining one in pixels
and setting the other to 'auto' to keep your image proportions accurate. If
these properties are not set, the image may print larger than expected.

PDF Header: By default, content located in the <thead> will be repeated on each
page in a printed document. Placing our header content inside this tag ensures
that our headers behave as expected.

PDF Footer: By default, content located in the <tfoot> will be repeated at the
bottom of each page in a printed document, *except* the last page where it will
be placed at the bottom of the content (not necessarily the bottom of the page).

To overcome this two modifications are necessary:

https://medium.com/@Idan_Co/the-ultimate-print-html-template-with-header-footer-568f415f6d2a

1) Add the android-print-footer <div> inside the table. This
<div> has a 'fixed' position to the bottom of the page defined by the following
styles:

display: table-footer-group;
width: 800px;
bottom: 0;
position: fixed;

The width above was determined through trial and error. It approximates the
page width in points: 8.5in * 72pt/in * 4/3px/pt = 816px. In practice 800 seemed
to align more closely with the rest of the page.

At this point our footer will print on every page but will print on top of
content at the bottom of the page.

2) Add a blank <tfoot> to the table that will have height equal to the height
of our footer content placed in the <div> in step 1. With the default behavior
of <tfoot>, this space will reside at the bottom of every printed page, except
the last page where it will be at the bottom of the content. On the last page,
this is ok as the footer content will be absolutely positioned at the bottom
already and the <tfoot> is empty space.
/* *************************************************************************/
/* *************************************************************************/

const androidPDFFragment = `<div id="document">

  <table id="android-table">
    <thead id="android-header">
      <tr>
        <th>
          <div id="report-header" style="display: flex; align-items: center; flex-direction: row; justify-content: space-between;">
            <span id="header-date"></span>
            <img id="android-header-logo" src="images/luminix_logo.png" height="auto" width="300px" />
          </div>
        </th>
      </tr>
    </thead>

    <div id="android-print-footer" class="chrome-footer" style="display: table-footer-group; width: 800px; bottom: 0; position: fixed;">
    </div>

    <tbody id="android-body">
      <tr>
        <td>
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
                  <div class="red button" id="android-signature-clear-button" onclick="clearSignature();">Clear Signature</div>
                  <div class="blue button" id="signature-submit" onclick="saveSignature();">Done Signing</div>
                </div>

              </div>
            </div>
          </div>
        </td>
      </tr>

      <tr>
        <td id="preview-footer">
          <div id="report-footer" style="display: flex; align-items: center; flex-direction: row; justify-content: space-between;">
            <span id="android-print-footer-email">Email: <a href="mailto:service@luminixinc.com">service@luminixinc.com</a> </span>
            <img id="android-print-footer-icon" src="images/pulsar_logo.png" height="auto" width="50px" />
            <span id="android-print-footer-url">Website: <a href="https://luminixinc.com">luminixinc.com</a></span>
          </div>
        </td>
      </tr>

    </tbody>

    <tfoot>
      <tr>
        <td>
          <div id="android-footer-space">&nbsp;</div>
        </td>
      </tr>
    </tfoot>


  </table>
</div>
`;

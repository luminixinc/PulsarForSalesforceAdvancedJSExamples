/* TODO */
windowsPDFFragment = `<div id="document">

  <div id="report-header" style="display: table; overflow: hidden; width: 100%;">
    <div id="header-date" style="display: table-cell; vertical-align: middle; width: 50%;"></div>
    <div style="display: table-cell; vertical-align: middle; width: 50%; text-align: right;">
      <img id="header-logo" src="images/luminix_logo.png" height="auto" width="300px"/>
    </div>
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

  <div id="report-footer" style="display: table; overflow: hidden; width: 100%;">
    <div id="footer-email" style="display: table-cell; vertical-align: middle; width: 33%;">
      Email:
      <a href="javascript:alert('Send email to: service@luminixinc.com')">service@luminixinc.com</a>
    </div>
    <div style="display: table-cell; vertical-align: middle; width: 33%; text-align: center;">
      <img id="footer-icon" src="images/pulsar_logo.png" height="auto" width="50px"/>
    </div>
    <div id="footer-url" style="display: table-cell; vertical-align: middle; width: 33%; text-align: right">
      <div>Website: <a href="https://luminixinc.com">luminixinc.com</a></div>
      <div>Page {page} of {total-pages}</div>
    </div>
  </div>

</div>
`;

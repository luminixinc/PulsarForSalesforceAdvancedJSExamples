Pulsar for Salesforce Javascript API Examples
=============================================

These are designed to be a simple, top level example of customizing Pulsar

Pulsar Javascript API Examples
------------------------------

This repository contains canonical example code of how to interact with the Pulsar platform from a custom embedded HTML/CSS/Javascript app.

### `helloembed.html`

Similar to `hello.html` found within the [PulsarForSalesforceJSExamples](https://github.com/luminixinc/PulsarForSalesforceJSExamples) but launches another document/app within an iframe.  This document can also make API calls into Pulsar.

### `hellosync.html`

Similar to `hello.html` example, but also sets up to monitor sync process updates.  Homework assignment: Suppress the main Pulsar sync banner using the appropriate Pulsar Setting and implement your own sync banner in HTML/CSS Javascript! ;)

Running the Examples in Pulsar
------------------------------

To view these examples in Pulsar:

- Upload the HTML file(s) to Salesforce, specifically upload them into your org's Content Library (or Files section)
- Launch Pulsar on your device, login again if prompted, and resync Pulsar
- After sync, navigate to the document under the Pulsar Content Library (Files) tab and open it

Pulsar Developer REPL
---------------------

The process to upload changes to Salesforce, resync Pulsar to view them, and edit/repeat, is extremely time-consuming and error-prone.  Luckily, after you have the file(s) initially uploaded and displaying in Pulsar, you can switch to a quicker _local REPL experience (Read, Eval/Edit, Print, Loop)_...

For quicker editing and debugging of your HTML/JS code you will need to set up a [local development server](https://luminix.atlassian.net/wiki/spaces/PD/pages/831029249/Local+Development+Server).  

WARNING: running a local development server is only recommended for testing orgs, not orgs that are in production.  Caveat Programmer!

### `testservedir.js`

This is a more complex example server that is designed to serve a toplevel `index.html` as well as a hierarchy of other HTML, JS, CSS, fonts, etc, files.  Incidentally, for any moderately complex app designed to run in Pulsar, you will want to [develop and bundle it as a _`.pulsarapp`_ format](https://luminix.atlassian.net/wiki/spaces/PD/pages/49152017/3-1.+Pulsar+as+a+Platform#id-3-1.PulsarasaPlatform-Bundlinganddeployingyourwebappas.pulsarappformat).

### Third Party Tooling

Now because you are serving file(s) to Pulsar locally from your development machine, you can use all your favorite HTML/JS tools (Visual Studio Code, Edge DevTools, Chromium developer tools, etc) to edit and actually debug your code live running in Pulsar.

Extra Resources
---------------

- [Admin/developer Pulsar for Salesforce Wiki](https://luminix.atlassian.net/wiki/spaces/PD) &mdash; toplevel wiki for Pulsar Setting for Salesforce admins
- [Pulsar as a Platform](https://luminix.atlassian.net/wiki/spaces/PD/pages/49152017/3-1.+Pulsar+as+a+Platform) &mdash; information about building HTML/JS apps for Pulsar, _`.pulsarapp`_ format, etc
- [Local Development Server](https://luminix.atlassian.net/wiki/spaces/PD/pages/831029249/Local+Development+Server)

Lightning Web Components
------------------------

Pulsar currently has preliminary support for LWC.  For more information, please inquire with our [Support team](https://www.luminixinc.com).

Contributing
------------

We appreciate your comments, issues, ideas!

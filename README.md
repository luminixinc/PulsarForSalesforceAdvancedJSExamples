# Pulsar for Salesforce
Pulsar for Salesforce is a desktop/mobile app developed by Luminix, Inc that allows organizations to sync and work with Salesforce data, all while completely offline.

## Pulsar for Salesforce Features
* Pulsar allows complete sync of your Salesforce data to your mobile device or desktop PC. Work offline, then quickly perform a "catch-up" sync when you get back online.
* Pulsar is NOT a data cache. Your data is stored and encrypted locally in a SQLite database on the device.
* Pulsar is NOT a separate cloud. Your data is stored only in Salesforce cloud and on the device.
* Allows complete Create Read Update Delete (CRUD) of object records, including child and related records, all while completely offline, subject to Salesforce permissions and access controls you are already familiar with.
* Also supports offline access to files and documents, roll-up summary fields, formula fields, validation rules, flows and quick actions, all while completely offline, and subject to Salesforce permissions.
* If you "know" Salesforce, then working with Pulsar as an admin or developer is simply easy!
* Pulsar is available for iOS, Android and Chromebooks, and Windows 10. Download, and start syncing your organization! For premium use, which allows full customization, contact Sales at Luminix, Inc.
* And... you can completely customize the UI by writing HTML/CSS/Javascript apps for embedding in Pulsar, (which is what the remainder of this document is about ;)

## What these are.
* The `hello-world` folder contains more advanced exmaples on using an i-frame, monitoring sync process updates, proxy server for local development server, and a more complex server for running a more sophisticated, larger web app.
* The `pulsar-api-example` folder contains snippets and examples of some of the more commonly used APIs that you can copy, paste, and redesign for your use case.

## How to use
* Compress the contents of the `resources` folder and attach to the [`pulsar.docs.enableHTMLResources`](https://luminix.atlassian.net/wiki/spaces/PD/pages/49152017/Pulsar+as+a+Platform#globalsharedresources) setting. This bundles the various resources (HTML, CSS, Javascript, images, fonts, etc) independently of your individual `.pulsarapp` webapps, allowing these resources to be shared among all examples.
* Zip the contents of the `pulsar-api-examples` folder into a single file with the extension `.pulsarapp` -- Pulsar will unzip and load the top-level index.html file (which itself can reference the other bundled scripts and resources.
* For the `example-report`, you can download the included `example-report.pulsarapp` and upload it to your Salesforce organization's Files. Opening it from within Pulsar's Content Library will execute the example app. Alternatively, you can zip up the contents of the `example-report` folder (excluding the .pulsarapp) and change the `.zip` to `.pulsarapp`. This would allow any changes you've made to the code to be included in the application when you upload it to your organization's Files.
* The `react-example` is an example of integrating a simple React app bootstrapped using `create-react-app`. To quickly see the example working in your Pulsar instance, first build the app for production using `npm run build`, then navigate to the build folder and run `zip -r react-example.pulsarapp .` Upload `react-example.pulsarapp` to a Shared Library in the Files tab on your Salesforce org's web interface. In Pulsar, login and sync your account, then navigate to 'Content Library' and open the file. See the README in the react-example folder for more information on how this integration works.

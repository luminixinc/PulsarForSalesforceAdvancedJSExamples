# Pulsar React Example

This project provides an example of how to interact with the Pulsar Javascript Bridge in a React app.

When opened in Pulsar, the app will display a list of three Account objects. Selecting an Account will navigate to a
detail page, where the Account [Compact Layout](https://help.salesforce.com/articleView?id=sf.compact_layout_overview.htm&type=5) 
and the Account [Layout](https://help.salesforce.com/articleView?id=sf.customize_layout.htm&type=5) is used to present the Account object.

Pulsar Javascript Bridge setup is performed in BridgeProvider.js. Using the common setup logic used in the simpler 
CRUD examples (read-account, create-account etc), the Bridge is initialized and used to instantiate a 
PulsarDataRequester object: a wrapper containing all of the
JS Bridge API calls the app uses. The PulsarDataRequester is then passed to all the components of the app with the use
of the [React Context API](https://reactjs.org/docs/context.html).

For more information on the Pulsar JS Bridge see:

- [Pulsar as a Platform](https://luminix.atlassian.net/wiki/spaces/PD/pages/49152017/Pulsar+as+a+Platform)
- [JS Bridge API](https://luminix.atlassian.net/wiki/spaces/PD/pages/8683529/Pulsar+Platform+-+JS+Bridge+API) (Bridge and simple CRUD info)
- [SObject Layout APIs](https://luminix.atlassian.net/wiki/spaces/PD/pages/1647378435/SObject+Layout+Information+APIs)


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


## Getting Started

- To get started, run `npm install` in the app directory to set up the app.
- To quickly see the example working in your Pulsar instance, build the app for production using `npm run build`.
- Navigate to the build folder and run `zip -r react_app.pulsarapp .`
    - For more information on .pulsarapp bundling see: [Pulsar as a Platform](https://luminix.atlassian.net/wiki/spaces/PD/pages/49152017/Pulsar+as+a+Platform)
- Upload react_app.pulsarapp to a Shared Library in the Files tab on your Salesforce org's web interface
- In Pulsar, login and sync your account. Navigate to 'Content Library' and open the file.

## Pulsar specifics

Since Pulsar will serve the production build from the filesystem, asset paths need to be relative to index.html. To enable this
set "homepage" to ".". in package.json. For more information: 
[Serving the Same Build from Different Paths](https://create-react-app.dev/docs/deployment/#serving-the-same-build-from-different-paths)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

This app makes use of [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) from ES6 
and [async/await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await) from ECMAScript 2017.

You can learn more about Create React App in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

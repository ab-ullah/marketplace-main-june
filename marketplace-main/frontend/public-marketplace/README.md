# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) TS template.

# Setup

1. Install [Nodejs](https://nodejs.org/en/download/)
2. Install [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/)
3. Run `yarn` to install dependencies
4. Run `yarn prepare` to prepare husky
5. Create `.env` file from `.env.sample` and update the values
6. If you use vs-code you can install [Eslint](http://https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint 'Eslint') and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode 'Prettier') extensions for further assistance and to automatically format your code based on your config files i.e **.eslintrc.json** & **.prettiertrc.json** in root directory

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
If you want to set a **custom port **for it to run you can set value of PORT in **.env** file
e.g PORT=3002

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn lint`

Runs lint tests based on **.eslintrc.json** file in root. It applies to all the code in the current directory.

### `yarn lint-staged`

-   Runs lint tests based on **.eslintrc.json** file in root. It applies to all the code in the current directory **which is staged**.
-   It also runs automatically before committing so it can test your staged code to check if your commit is upto the standards or not.
-   Moreover it also auto-formats the code using prettier.
    You can see the config file on root as lint-staged.js

### `yarn prettier`

Runs prettier tests based on **.prettiertrc.json** file in root. It applies to all the code in the current directory.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

# General Folder Structure Guidlines

-   All the import are absolute imports so instead of doing something like "../../components/Modal" you can access the folders in **src** folder directly like "components/Modal" from anywhere
-   All the intefaces and constants should be in the folders "interfaces" and "constants" respectively in src folder
-   The components folder in src folder should only contain components which are not specific for a specific page, hence will act as global components e.g Modal, Table, a styled Button, Input etc
-   The components which are supposed to be only used for a specific page should be in the same page folder
    e.g Address of a Hero component for HomePage will be like _"pages/HomePage/components/HeroSection/index.tsx"_
-   Moreover Considering the above example if we have another component which is to be used only by The HeroSection then that component's address will look like this:
    _"pages/HomePage/components/HeroSection/components/HelpingComponent/index.tsx"_
    The **reason** for this hierarchy is we always know changing a component affects exactly which page or which component as it is always going to affect its parent component only.

# Redux Usage Guidlines?

-   If you don't want a value or api response at multiple pages don't use redux
-   If the api call is only relevant to the component you are calling it in, don't use redux. Only a simple axios api call can suffice. Those api calls can be grouped in services folder eg. services -> posts.ts
-   If you call an api in a parent component to fetch some data but only need it in a child component then the api should be called from that component instead of the parent component.
-   If the api response is needed in parent and also in its child component in a deep hierarchy if prop drilling seems to much of a hasle then you can use context Api from react because in some cases we have to mutate the data before using and if we want that at multiple places then we would have to make sure that the data is mutated everywhere we want it to.
-   https://redux.js.org/faq/general#when-should-i-use-redux
-   https://redux.js.org/style-guide/#structure-files-as-feature-folders-with-single-file-logic

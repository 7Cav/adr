<p align="center"><img src="./client/src/style/themes/7cav/logo-m.png"></p>

## Overview
[![Server ADR Deployment](https://github.com/7Cav/adr/actions/workflows/server_adr_push.yml/badge.svg)](https://github.com/7Cav/adr/actions/workflows/server_adr_push.yml)
[![Client ADR Deployment](https://github.com/7Cav/adr/actions/workflows/client_adr_push.yml/badge.svg)](https://github.com/7Cav/adr/actions/workflows/client_adr_push.yml)

The Active Duty Roster (ADR) is a Reactjs based app designed to automatically track membership of every position within the 7th Cavalry Gaming Regiment via the 7th Cavalry API. The ADR is structured as a client-server architecture and includes basic authentication for enhanced security. Though the ADR is accurate, semi-regular maintenence is needed in order to keep tracked billets up to date.

## Table of Contents

- [Running Locally](#running-locally)
  - [Requirements](#requirements)
    - [Authorization](#authorization)
  - [Getting Started](#getting-started)
- [Updating the ADR](#updating-the-adr)
  - [Add New Billet in Existing Category](#add-new-billet-in-existing-category)
  - [Add New Category](#add-new-category)
- [TODO](#todo)

## Running Locally

### Requirements

In order to run the ADR locally for development, you need the following:
- A valid [7th Cavalry Gaming](https://7cav.us/) account with member-level privileges (i.e. not a public account).
- An instance of [Node.js](https://nodejs.org/en) installed on your system.
- Your choice of IDE such as [VSCode](https://code.visualstudio.com/).

#### Authorization

Before you get started with your server, you require two methods of authentication. You require both an API token from 7th Cavalry Gaming and a local clientside token.

To get and apply your API token do the following steps:

1. Log into your 7th Cavalry Gaming account.
2. Navigate to your [Connected Accounts](https://7cav.us/account/connected-accounts/) and select the "view account" button for auth.7cav.us
3. Once you have logged into keycloak, copy the provided API token into your clipboard.
4. Open the adr project folder and navigate to `adr/server/credentials`. Inside should be a file named `example_token.js`.
5. Make a duplicate `example_token.js` and rename it to `token.js`.
6. Inside the new `token.js` file, paste your API token in the `API_TOKEN` constant and save the file.

To make a clientside token, do the following:

1. Open the adr project folder and navigate to `/client`.
2. Inside the Client folder create a nameless `.env` file. When opened, the directory should be `adr/client/.env`
3. Paste the following code into the `.env` file.

```dotenv
REACT_APP_CLIENT_TOKEN ='XXXXXX'
REACT_APP_COMBAT_API_URL=http://localhost:4000/roster/combat
REACT_APP_RESERVE_API_URL=http://localhost:4000/roster/reserves
REACT_APP_CACHE_TIMESTAMP_URL=http://localhost:4000/cache-timestamp
```
4. Replace the `REACT_APP_CLIENT_TOKEN` constant with a password of your choice and save.
5. Navigate to `adr/server/credentials/token.js` and ensure the `CLIENT_TOKEN` constant matches the same constant in the previous `.env` file and save.

### Getting Started

Before initializing the server, the dependancies for the ADR need to be installed on your end.

- Open a terminal/cmd prompt and navigate to the adr project folder and execute the command `npm install`.
- Once the install finishes, navigate to `adr/client` and execute the previous command.

You should now be ready to run the Server and the Client.

- Open two terminals. On the first terminal navigate to `adr/server` and enter the command `node server.js`. You should see that the server is listening on localhost:4000 and can be additionally verified by visiting localhost:4000 on your browser.
- On the second terminal, navigate to `adr/client/src` and run the command `npm start`. Once the clientside is running, you should be automatically redirected to localhost:3000 on your browser. A sucessful response is when the ADR is completely filled.

You are now good to go! `adr/client/src/app.js` is the primary file in which everything on the clientside is ran. Closing the terminals will close the servers. Happy Coding!

## Updating the ADR

### Add New Billet in Existing Category

To add a new billet to an existing category, you need to update the `BilletBank.js` file located in `client/src/modules/Generic`.

#### Step-by-Step Instructions

1. Open `BilletBank.js`.
2. Locate the array that corresponds to the category where you wish to add the new billet.
3. Append the new billet ID to this array.

#### Example:

Suppose you want to add a new billet with an ID of `28` to the "Information Management Office Command" category. Update `imoCommand` as follows:

##### Before:
```javascript
const imoCommand = ['5','9'];
```
##### After:
```javascript
const imoCommand = ['5','9','28'];
```

---

### Add New Category

To introduce a new category, both `BilletBank.js` and `App.js` need to be updated.

#### Step-by-Step Instructions

1. **In `BilletBank.js`:**
    - Add a new array for the subcategory and populate it with billet IDs.
    - Add this new subcategory to the `billetBank` constant.

2. **In `App.js`:**
    - Create a new `<div>` with the class `DepartmentContainer`.
    - Inside this `<div>`, add a `Collapsible` component for the new category and subcategory.

#### Example:

To add a new major category called "test" with a subcategory "subTest," do the following:

**In `BilletBank.js`:**
```javascript
const subTest = ['1', '2', '3'];

const billetBank = {
    regiCommand,
    oneSevenCommand,
    subTest,
};
```

**In `App.js`:**
```javascript
<div className='DepartmentContainer'>
  <Collapsible trigger="test" triggerClassName="Title" triggerOpenedClassName="Title" open={true}>
    <div className='subTest'>
      <MilpacParse usePrimaryOnly={true} milpacArray={milpacArray} billetIDs={lists.subTest} subtitle={'Subcategory of Test'} />
    </div>
  </Collapsible>
</div>
```

> Note: Ensure that you add these elements in the proper locations in `App.js` to maintain the formatting.

---

## TODO

- [ ] Add tutorial for updating Statistics
- [ ] Change cache warning on client to display time since cache refresh
- [ ] Investigate the feasibility of sorting by rank after billet sorting (Subsorting? Consider using QuickSort)
- [ ] Add graphical data visualization

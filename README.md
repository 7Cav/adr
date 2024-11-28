<p align="center"><img src="./client/public/CavAppsLogo.svg" width = 400em></p>

## Overview

[![Server ADR Deployment](https://github.com/7Cav/adr/actions/workflows/server_adr_push.yml/badge.svg)](https://github.com/7Cav/adr/actions/workflows/server_adr_push.yml)
[![Client ADR Deployment](https://github.com/7Cav/adr/actions/workflows/client_adr_push.yml/badge.svg)](https://github.com/7Cav/adr/actions/workflows/client_adr_push.yml)

7th Cavalry Apps (CavApps) is a Nextjs based collection of tools and apps designed to aid the 7th Cavalry Gaming Regiment in its day to day functions. In its current form, CavApps currently includes the Active Duty Roster (ADR) and a small collection of Roster Statistics. Future iterations of CavApps can include a more advanced statistics tool, an AWOL tracker, and a potential migration of S1 Documents among other possible tools. CavApps is currently structured as a Frontend-Backend architecture and includes basic authentication for enhanced security.

The live deployment can be found at https://apps.7cav.us/ and the backend at https://bff.apps.7cav.us/

**NOTE:** This documentation is written so that an average member of the 7th Cavalry <em>should</em> be able to make basic edits to CavApps. If you need help with a particular matter or believe this documentation could be improved, please message S6 Development Staff on Discord or on the Forums.

## Table of Contents

- [Running Locally](#running-locally)
  - [Requirements](#requirements)
    - [Authorization](#authorization)
  - [Getting Started](#getting-started)
- [Updating the ADR](#updating-the-adr)
  - [Add New Billet in Existing Category](#add-new-billet-in-existing-category)
  - [Add New Category](#add-new-category)
- [Server Deployment](#server-deployment)
  - [Requirements](#requirements-1)
- [Roster Statistics](#roster-statistics)
- [Future Goals](#future-goals)

## Running Locally

### Requirements

In order to run the ADR locally for development, you need the following:

- A valid [7th Cavalry Gaming](https://7cav.us/) account with member-level privileges (i.e. not a public account).
- [Node.js](https://nodejs.org/en) v16.14+
- Your choice of IDE such as [VSCode](https://code.visualstudio.com/) or [neoVim](https://neovim.io/).

#### Authorization

Before you get started on CavApps, the dependancies need to be installed on your end.

- Open a terminal/cmd prompt, navigate to the CavApps project folder and execute the command `npm install`.

Next, you require two methods of authentication. You require both an API token from 7th Cavalry Gaming and a local clientside token.

To get and apply your API token do the following steps:

1. Log into your 7th Cavalry Gaming account.
2. Navigate to your [Connected Accounts](https://7cav.us/account/connected-accounts/) and select the "view account" button for auth.7cav.us
3. Once you have logged into keycloak, copy the provided API token into your clipboard.
4. Open the CavApps project folder and navigate to `cavapps/server/credentials`. Inside should be a file named `example_token.js`.
5. Make a duplicate `example_token.js` and rename it to `token.js`.
6. Inside the new `token.js` file, paste your API token in the `API_TOKEN` constant and save the file.

To make a clientside token, do the following:

1. Open the root CavApps project folder.
2. Inside the root folder create a nameless `.env` file. When opened, the directory should be `cavapps/.env`
3. Paste the following code into the `.env` file.

```dotenv
REACT_APP_CLIENT_TOKEN ='XXXXXX'
REACT_APP_COMBAT_API_URL=http://localhost:4000/roster/combat
REACT_APP_RESERVE_API_URL=http://localhost:4000/roster/reserves
REACT_APP_CACHE_TIMESTAMP_URL=http://localhost:4000/cache-timestamp
```

4. Replace the `REACT_APP_CLIENT_TOKEN` constant with a password of your choice and save.
5. Navigate to `cavapps/server/credentials/token.js` and ensure the `CLIENT_TOKEN` constant matches the same constant in the previous `.env` file and save.

### Getting Started

You should now be ready to run the Server and the Client.

- Open two terminals. On the first terminal navigate to `cavapps/server` and enter the command `node server.js`. You should see that the server is listening on localhost:4000 and can be additionally verified by visiting localhost:4000 on your browser.
- On the second terminal, navigate to `cavapps/client/app` and run the command `npm run dev`. Once the clientside is running, open your browser and go to http://localhost:3000 . You should see the CavApps index page on your screen.

You are now good to go! `cavapps/client/app` is the root folder in which CavApps is operated. Closing the terminals will close the servers. Happy Coding!

For further documentation on NextJS apps, visit https://nextjs.org/docs

## Updating the ADR

Since the ADR sources its data from the 7th Cavalry API and compares the API against a predefined billet list, the ADR is not aware when new billets are created or when older billets are moved.

For example, if a new company in 2-7 is created, the list the ADR compares against needs to be updated in order to display the membership of the new company.

### Add New Billet in Existing Category

To add a new billet to an existing category, you need to update the `BilletBank.jsx` file located in `cavapps/client/app/reusableModules`.

#### Step-by-Step Instructions

1. Open `BilletBank.jsx`.
2. Locate the array that corresponds to the category where you wish to add the new billet.
3. Append the new billet ID to this array.

#### Example:

Suppose you want to add a new billet with an ID of `28` to the "Information Management Office Command" category. Update `imoCommand` as follows:

##### Before:

```javascript
const imoCommand = ["5", "9"];
```

##### After:

```javascript
const imoCommand = ["5", "9", "28"];
```

---

### Add New Category

To introduce a new category, both `BilletBank.jsx` and `page.jsx` located in `cavapps/client/app/adr/page.jsx` need to be updated.

#### Step-by-Step Instructions

1. **In `BilletBank.jsx`:**

   - Add a new array for each subcategory and populate it with the requred billet IDs.
   - Add a new object for the new category and append the subcategories as well as their titles to the new object. additionally, add a `collapsibleTitle` with the name of the new category into the object.
   - Add the new object to the billetbank object at the bottom of the file

2. **In `adr/page.jsx`:**
   - Create a new `AdrListEntry` with the bBGroup value set to a string containing title of the new Object

#### Example:

You have been assigned the task of creating an entry in the ADR for 3rd Battalion. It has 3 companies, Alpha Bravo and Charlie. Each have their own designated billet ID's. (in a live setting, each company can have strings that are dozens of entries each in length)

**In `BilletBank.jsx`:**

```jsx
//3-7

const threeSevenCommand = ['1', '2', '3'] //placeholder values
const alpha3 = ['4','5','6']
const bravo3 = ['7','8','9']
const charlie3 = ['10','11','12']

const threeSeven = {
  positionIds: [threeSevenCommand, alpha3, bravo3, charlie3],
  positionTitles: [
    "3-7 Headquarters",
    "Alpha Company",
    "Bravo Company",
    "Charlie Company",
  ],
  collapsibleTitle: "Third Battalion",
};

...

const billetBankObject = {
  regi: regi,
  oneSeven: oneSeven,
  twoSeven: twoSeven,
  threeSeven: threeSeven,
  ...
};
```

**In `adr/page.jsx`:**

```jsx
// important: make sure the bBGroup string matches the object name in the billetBank section
...
<AdrListEntry bBGroup={"oneSeven"} milpacArray={milpacArray} />
<AdrListEntry bBGroup={"twoSeven"} milpacArray={milpacArray} />
<AdrListEntry bBGroup={"threeSeven"} milpacArray={milpacArray} />
...
```

> Note: Ensure that you add these elements in the proper locations in `page.jsx` to maintain the formatting.

## Server Deployment

**NOTE:** If you are making changes to CavApps and want said changes put on the live version, submit a pull request. This section is intended for S6 Staff for deployment testing purposes.

### Requirements

In order to deploy CavApps on a server, you need the following:

- A linux (preferably ubuntu) based server with the following:
  - Access via SSH
  - Sudo level permissions
  - Minimum 2GB RAM
- Alongside the following packages:

  - [Docker Engine](https://docs.docker.com/engine/install/ubuntu/)
  - nodejs
  - npm
  - git

  ```
  sudo apt install git npm nodejs
  ```

- A 7th Cavalry API token (see [Authorization](#authorization))

---

### Deployment

Once the required packages are installed, clone the repo

```
git clone https://github.com/Vercin-G/CavApps-Test
```

First, install prerequisites:

In `CavApps-Test/server/`:

```
npm install
```

In `CavApps-Test/client/`:

```
npm install
```

Next, cd into `CavApps-Test/server/credentials` and make the token.js file as described in [Authorization](#authorization).

cd into `CavApps-Test/client` and create a .env file with the contents as shown:

```dotenv
REACT_APP_CLIENT_TOKEN ="XXXXXX"
REACT_APP_COMBAT_API_URL=http://server:4000/roster/combat
REACT_APP_RESERVE_API_URL=http://server:4000/roster/reserves
REACT_APP_CACHE_TIMESTAMP_URL=http://server:4000/cache-timestamp
```

**IMPORTANT:** be sure that the urls link to http://server:4000 and **NOT** http://localhost:4000 as you would in a dev setting. If this is not done, docker will not recognize the back and front ends properly.

Return to `CavApps-Test/` and enter:

```
docker compose up
```

And you should be good! Simply navigate to your server in your browser and the index page should show. The server side should be accessable via port 4000.

**NOTE:** On slower servers, the generation of nextjs static pages may cause a hang. This is normal. Give it a few seconds.

## Roster Statistics

The Roster Statistics section is currently pending rewrite to include more information. Stay Tuned!

## Future Goals

CavApps has several goals in mind for the future. Here are some examples.

- Roster Statistics which draw from a 7th Cavalry Operated database. Providing historical numbers on top of current figures
- Implementation of an AWOL tracker
- Implementation of keycloak systems to allow for the operation of internal documents. E.g. moving S1 spreadsheets into internal tools which are authenticated by keycloak.

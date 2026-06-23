<p align="center"><img src="./client/public/CavAppsLogo.svg" width = 400em></p>

## Overview
[![Production Deployment](https://github.com/7Cav/adr/actions/workflows/prod_deploy.yml/badge.svg)](https://apps.7cav.us/)
[![Development Deployment](https://github.com/7Cav/adr/actions/workflows/dev_deploy.yml/badge.svg)](https://beta.apps.7cav.us/)

7th Cavalry Apps (CavApps) is a Nextjs based collection of tools and apps designed to aid the 7th Cavalry Gaming Regiment in its day to day functions. In its current form, CavApps currently includes the Active Duty Roster (ADR) and a small collection of Roster Statistics. Future iterations of CavApps can include a more advanced statistics tool, an AWOL tracker, and a potential migration of S1 Documents among other possible tools. CavApps is currently structured as a Frontend-Backend architecture and includes basic authentication for enhanced security.

The live deployment can be found at https://apps.7cav.us/ and the backend at https://bff.apps.7cav.us/

**NOTE:** This documentation is written so that an average member of the 7th Cavalry <em>should</em> be able to make basic edits to CavApps. If you need help with a particular matter or believe this documentation could be improved, please message S6 Development Staff on Discord or on the Forums.

## Table of Contents

- [Running Locally](#running-locally)
    - [Quick Start with Docker (recommended)](#quick-start-with-docker-recommended)
    - [Requirements](#requirements)
        - [Authorization](#authorization)
    - [Manual Setup (without Docker)](#manual-setup-without-docker)
- [Updating the ADR](#updating-the-adr)
    - [Add New Billet in Existing Category](#add-new-billet-in-existing-category)
    - [Add New Category](#add-new-category)
- [Server Deployment](#server-deployment)
    - [Requirements](#requirements-1)
- [Roster Statistics](#roster-statistics)
- [Future Goals](#future-goals)

## Running Locally

CavApps is a monorepo with two parts:

- **`server/`** — an Express caching proxy ("BFF") that fetches roster data from the 7th Cavalry API and serves it from memory. It also keeps a Postgres database for roster-history diffs and the user-search cache.
- **`client/`** — a Next.js 13 (App Router) app with three tools: the Active Duty Roster (ADR), Roster Statistics, and the Uniform Builder.

The client never talks to the 7th Cavalry API directly — it only talks to the server. The Docker setup below brings the Postgres database up for you, so there's nothing extra to install.

### Authorization

You need two tokens:

| Token | Purpose | Where it goes |
|-------|---------|---------------|
| `API_TOKEN` | Authenticates the **server** to `api.7cav.us`. A real 7th Cavalry API bearer. | server env |
| `CLIENT_TOKEN` | Shared secret between the **client and server**. Can be any string you choose — it just has to match on both sides. | server env + client env |

To get your `API_TOKEN`:

1. Log into your [7th Cavalry Gaming](https://7cav.us/) account (member-level, not a public account).
2. Open your [Connected Accounts](https://7cav.us/account/connected-accounts/) and click "view account" for `auth.7cav.us`.
3. Log into Keycloak and copy the provided API token.

> **Heads up on `.env` formatting:** use `KEY=value` with **no spaces around the `=`** and no surrounding quotes. A line like `API_TOKEN ='abc'` (note the space) makes the variable name `API_TOKEN ` (with a trailing space), so Docker Compose treats `API_TOKEN` as unset and the server fails to start with a `401 Unauthorized`.

### Quick Start with Docker (recommended)

This is the fastest way to get a working dev environment — it builds and runs both the server and client for you, with hot-reload on the client.

1. Install [Docker](https://docs.docker.com/get-docker/) (Docker Desktop on macOS/Windows).
2. In the project root, copy the example env file and fill in your tokens:

   ```bash
   cp .env.example .env
   ```

   At a minimum set `API_TOKEN` and `CLIENT_TOKEN`. Everything else has a sensible local default — the Postgres database is created for you, and the XenForo settings can stay blank (see the notes in `.env.example`).

3. Bring the stack up:

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up
   ```

That's it. The override file (`docker-compose.dev.yml`) provisions the `edge` network locally, so **no manual `docker network create` is needed**. When it finishes:

- Client (CavApps index): http://localhost:3000
- Server (BFF): http://localhost:4000

The server must successfully load roster data on startup or it will exit and restart — if it keeps restarting, double-check your `API_TOKEN` (see the formatting note above).

> **Two features need the forum database.** The roster-history diff viewer and the member search box read from the live XenForo (forum) MariaDB, which you won't have locally. They simply stay empty — the rest of the app works fine. To enable them, set the `XENFORO_DB_*` values in your `.env` to a reachable XenForo database.

Stop the stack with `Ctrl+C`, or from another terminal:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

> `docker-compose.yml` on its own is the **production** config and expects an externally managed `edge` network. For local dev always include the `-f docker-compose.dev.yml` override.

### Requirements

If you'd rather run the apps directly on your machine instead of in Docker:

- A valid [7th Cavalry Gaming](https://7cav.us/) account with member-level privileges.
- [Node.js](https://nodejs.org/en) v18+.
- Your choice of IDE such as [VSCode](https://code.visualstudio.com/) or [neoVim](https://neovim.io/).

### Manual Setup (without Docker)

You'll run the server and client in two separate terminals. The server also needs a Postgres database — if you don't already have one, the easiest path is to run just that container from the compose file:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up postgres
```

That gives you a database reachable at `postgres://cavapps:cavapps@localhost:5432/cavapps`. (The Docker Quick Start above avoids all of this — only use manual setup if you specifically need the apps running outside Docker.)

**1. Server** (`server/`):

```bash
cd server
npm install
API_TOKEN=your-7cav-api-token \
CLIENT_TOKEN=any-shared-secret \
DATABASE_URL=postgres://cavapps:cavapps@localhost:5432/cavapps?sslmode=disable \
node server.js
```

The server listens on `http://localhost:4000`. Visiting it in a browser confirms it's up. It reads these values from the environment — export them in your shell or use a tool like [`dotenv`](https://www.npmjs.com/package/dotenv) / a `.env` loader of your choice. It runs its database migrations on startup and exits if `DATABASE_URL` isn't reachable.

**2. Client** (`client/`):

Create `client/.env.local` with:

```dotenv
NEXT_PUBLIC_CLIENT_TOKEN=any-shared-secret-you-choose
COMBAT_API_URL=http://localhost:4000/roster/combat
RESERVE_API_URL=http://localhost:4000/roster/reserves
GROUP_API_URL=http://localhost:4000/roster/groups
CACHE_TIMESTAMP_URL=http://localhost:4000/cache-timestamp
NEXT_PUBLIC_INDIVIDUAL_API_URL=http://localhost:4000/roster/individual
```

`NEXT_PUBLIC_CLIENT_TOKEN` **must match** the server's `CLIENT_TOKEN`. Then:

```bash
cd client
npm install
npm run dev
```

Open http://localhost:3000 and you should see the CavApps index page. Happy coding!

For further documentation on Next.js, visit https://nextjs.org/docs

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

Next, create a `.env` file in the project root from the template and fill in your tokens (see [Authorization](#authorization)):

```bash
cp .env.example .env
```

The `docker-compose.yml` wires the client to reach the server over the internal Docker network (`http://server:4000/...`), so you do **not** need to set the per-URL client variables by hand for a Docker deployment — they're defined in the compose file. It also brings up the Postgres database the server depends on.

Then, from the project root:

```bash
docker compose up
```

> Production `docker compose up` (without the dev override) expects an externally managed `edge` network — create it once with `docker network create edge` if it doesn't already exist on the host.

And you should be good! Simply navigate to your server in your browser and the index page should show. The server side should be accessable via port 4000.

**NOTE:** On slower servers, the generation of nextjs static pages may cause a hang. This is normal. Give it a few seconds.

## Roster Statistics

The Roster Statistics section is currently pending rewrite to include more information. Stay Tuned!

## Future Goals

CavApps has several goals in mind for the future. Here are some examples.

- Roster Statistics which draw from a 7th Cavalry Operated database. Providing historical numbers on top of current figures
- Implementation of an AWOL tracker
- Implementation of keycloak systems to allow for the operation of internal documents. E.g. moving S1 spreadsheets into internal tools which are authenticated by keycloak.

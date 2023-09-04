# 7th Cavalry ADR

[![Server ADR Deployment](https://github.com/7Cav/adr/actions/workflows/server_adr_push.yml/badge.svg)](https://github.com/7Cav/adr/actions/workflows/server_adr_push.yml)
[![Client ADR Deployment](https://github.com/7Cav/adr/actions/workflows/client_adr_push.yml/badge.svg)](https://github.com/7Cav/adr/actions/workflows/client_adr_push.yml)

## Overview

This is a React application designed to display roster data fetched from the 7th Cavalry API. The project is structured as a client-server architecture and includes basic authentication for enhanced security.

## Table of Contents

- [Updating ADR](#updating-adr)
  - [Add New Billet in Existing Category](#add-new-billet-in-existing-category)
  - [Add New Category](#add-new-category)
- [TODO](#todo)

## Updating ADR

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

- [ ] Change cache warning on client to display time since cache refresh
- [ ] Investigate the feasibility of sorting by rank after billet sorting (Subsorting? Consider using QuickSort)
- [ ] Add graphical data visualization

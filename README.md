# 7th Cavalry ADR
[![Server ADR Deployment](https://github.com/7Cav/adr/actions/workflows/server_adr_push.yml/badge.svg)](https://github.com/7Cav/adr/actions/workflows/server_adr_push.yml) [![Client ADR Deployment](https://github.com/7Cav/adr/actions/workflows/client_adr_push.yml/badge.svg)](https://github.com/7Cav/adr/actions/workflows/client_adr_push.yml)

A react app intended to display roster data from the 7th Cavalry API.
Uses client and server components with some basic authentication for security.

## Updating ADR
### New billet in existing category:
Updating the ADR for new billets is done by modifying the `BilletBank.js` file in the `client/src/modules/Generic` directory. This file is a set of simple arrays of the category the billet should be placed in and the ID of the billet. The ID is the same as the billet ID in the 7th Cavalry API. The order you add the billet IDs will be the same order the billets are displayed in the app.

#### Example:
If you wanted to add a new billet with an ID of 28 to "Information Management Office Command" you would modify the following line in the `BilletBank.js` file:
<hr></hr>

##### Before:
```javascript
const imoCommand = ['5','9'];
```
##### After:
```javascript
const imoCommand = ['5','9','28'];
```

<hr></hr>

### New Category:
Adding a new category is done by modifying the `BilletBank.js` file in the `client/src/modules/Generic` directory. This file is a set of simple arrays of the category each billet should be placed in and the ID of the billet. The ID is the same as the billet ID in the 7th Cavalry API. The order you add the billet IDs will be the same order the billets are displayed in the app.

You will also need to modify the App.js to display the new category. Each major category is split into a class named `Department Container` and each sub department is split into subclasses. You will also need to mark if the parse will be Primary Only or if secondary billets are included.

#### Example:
If you wanted to add a new major category called "test" with a subcategory of "subTest" that is only used as a primary billet you would add the following line in the `BilletBank.js` file:
<hr></hr>

```javascript
const subTest = ['1','2','3'];
```
You then also need to add the new subcategory to the `const billetBank` array in the same file.
```javascript
const billetBank = {
    regiCommand,
    oneSevenCommand,
    subTest,
};
```

You would then also add the following lines in the `App.js` file:
```javascript
        <div className='DepartmentContainer'>
          <Collapsible trigger="test"
          triggerClassName="Title"
          triggerOpenedClassName="Title" open
          {true}>
            <div className='subTest'>
              <MilpacParse usePrimaryOnly
              {true} milpacArray={milpacArray}
              billetIDs={lists.subTest}
              subtitle={'Subcategory of Test'} 
            </div>
        </div>
```
It is important to note these need to be added in proper div location in app.js to preserve necessary formatting.
## TODO:

- [ ] Look into sorting by rank after sorting by billet (Subsorting? QuickSort maybe?)
- [ ] Implement a sort of graph for easier data visualization

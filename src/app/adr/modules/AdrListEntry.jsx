import React from "react";
import MilpacParse from "./MilpacParse";
import lists from "./BilletBank";

function AdrListEntry(props) {
  let billetBankObject = lists.billetBankObject;
  let selector = props.bBGroup;

  return (
    <div className="DepartmentContainer">
      <h1>{billetBankObject[selector].collapsibleTitle}</h1>
      <div className="ResponseContainer">
        <MilpacParse
          milpacArray={props.milpacArray}
          headerTitles={billetBankObject[selector].positionTitles}
          billetBankObject={billetBankObject[selector].positionIds}
        />
      </div>
    </div>
  );
}

export default AdrListEntry;

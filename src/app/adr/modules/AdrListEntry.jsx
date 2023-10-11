import React from "react";
import MilpacParse from "./MilpacParse";
import lists from "./BilletBank";

function AdrListEntry(props) {
  let billetBankObject = lists.billetBankObject;
  let selector = props.bBGroup;

  return (
    <div className="DepartmentContainer">
      <div className="Title">{billetBankObject[selector].collapsibleTitle}</div>
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

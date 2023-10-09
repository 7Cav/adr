import React from "react";
import Collapsible from "react-collapsible";
import MilpacParse from "./MilpacParse.js";
import lists from "./BilletBank.js";

function AdrListEntry(props) {
  let billetBankObject = lists.billetBankObject;
  let selector = props.bBGroup;

  return (
    <div className="DepartmentContainer">
      <Collapsible
        trigger={billetBankObject[selector].collapsibleTitle}
        triggerClassName="Title"
        triggerOpenedClassName="Title"
        open={true}
      >
        <div className="ResponseContainer">
          <MilpacParse
            milpacArray={props.milpacArray}
            headerTitles={billetBankObject[selector].positionTitles}
            billetBankObject={billetBankObject[selector].positionIds}
          />
        </div>
      </Collapsible>
    </div>
  );
}

export default AdrListEntry;

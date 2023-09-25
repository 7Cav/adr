import React from "react";
import Collapsible from "react-collapsible";
import MilpacParse from "./MilpacParse.js";

function CombinedFunction(props) {
  return (
    <div className="DepartmentContainer">
      <Collapsible
        trigger={props.collapsibleTitle}
        triggerClassName="Title"
        triggerOpenedClassName="Title"
        open={true}
      >
        <div className="ResponseContainer">
          <MilpacParse
            milpacArray={props.milpacArray}
            headerTitles={props.headerTitles}
            billetBankObject={props.billetBankObject}
          />
        </div>
      </Collapsible>
    </div>
  );
}

export default CombinedFunction;

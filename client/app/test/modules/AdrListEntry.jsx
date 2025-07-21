import React from "react";
import MilpacParse from "./MilpacParse";

function AdrListEntry(props) {
  const rosterGroups = props.rosterGroups.groups;
  const selector = props.rGSelector;

  return (
    <div className="ResponseContainer">
      <MilpacParse
        milpacArray={props.milpacArray}
        rosterGroups={rosterGroups[selector].positions}
        subtitle={rosterGroups[selector].groupTitle}
      />
    </div>
  );
}

export default AdrListEntry;

import React from "react";
import MilpacParse from "./MilpacParse";

function AdrListEntry(props) {
  const rosterGroups = props.rosterGroups.groups;
  const selector = props.rGSelector;

  return (
    <div className="ResponseContainer">
      <div className="Subtitle">{rosterGroups[selector].groupTitle}</div>
      <MilpacParse
        milpacArray={props.milpacArray}
        rosterGroups={rosterGroups[selector].positions}
      />
    </div>
  );
}

export default AdrListEntry;

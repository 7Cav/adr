import React from "react";

function StrengthCount(props) {
  var useCompanyLevelLogic = props.useCompanyLevelLogic;
  var piechartArray=props.piechartArray;

  if (useCompanyLevelLogic !== true) {
    var combinedArray = [];
    var milpacArray = props.milpacArray;
    var billetIDs = props.billetIDs;
    var subtitle = props.subtitle;

    for (var milpacIdCombat in milpacArray[0].combat.profiles) {
      var primary = milpacArray[0].combat.profiles[milpacIdCombat].primary;

      for (var billetIdArray in billetIDs) {
        if (billetIDs[billetIdArray].includes(primary.positionId)) {
          combinedArray.push({ position: primary });
        }
      }
    }

    piechartArray.push(combinedArray.length)
    console.log(piechartArray)

    return (
      <div className="Response Container">
        <div className="Header Container">
          <div className="Subtitle">{subtitle}</div>
          <div className="Combined Counter">
            Overall Strength{": "}
            {combinedArray.length}
          </div>
        </div>
      </div>
    );
  } else if (useCompanyLevelLogic === true) {
    combinedArray = [];
    milpacArray = props.milpacArray;
    billetIDs = props.billetIDs;
    var subSubtitle = props.subSubtitle;

    for (milpacIdCombat in milpacArray[0].combat.profiles) {
      primary = milpacArray[0].combat.profiles[milpacIdCombat].primary;

      for (billetIdArray in billetIDs) {
        if (billetIDs[billetIdArray].includes(primary.positionId)) {
          combinedArray.push({ position: primary });
        }
      }
    }

    piechartArray.push(combinedArray.length)
    console.log(piechartArray)

    return (
      <div className="Response Container">
        <div className="SubsubtitleAndCount">
          {subSubtitle}
          {": "}
          {combinedArray.length}
        </div>
      </div>
    );
  }
}

export default StrengthCount;

import React from "react";
import ArrayMap from "./ArrayMap";

/*Milpac Parse is used to compare the API response (milpacArray) against desired position ID's (billetBankObject). If for example, a person is a Milpacs Clerk and billetBankObject
is set to check for Milpacs Clerks, Milpac Parse will search for matching entries within the API resonse. If there is someone that matches, they are pushed to an output array. (returnArray)
This particular instance of milpacArray is designed to parse an entire object for matching entries, i.e. It will parse all of First Battalion, and push out an array
for each company within first battalion if asked to do so.*/

function MilpacParse(props) {
  const rosterGroups = props.rosterGroups;
  let milpacArray = props.milpacArray;

  console.log(rosterGroups);

  const uniqueNamesSet = new Set();

  let returnArray = [];

  //First, check the combat roster primaries for matching billet id's, then push them to the return array if match is found.

  for (let milpacIdCombat in milpacArray[0].combat.profiles) {
    let name = milpacArray[0].combat.profiles[milpacIdCombat].realName;
    let rank = milpacArray[0].combat.profiles[milpacIdCombat].rank.rankFull;
    let primary = milpacArray[0].combat.profiles[milpacIdCombat].primary;
    let fullName = rank + " " + name;
    let primarySortKey =
      milpacArray[0].combat.profiles[milpacIdCombat].primary.positionId;

    for (let index in rosterGroups) {
      if (rosterGroups[index].positionId == primary.positionId) {
        returnArray.push({
          fullName: fullName,
          position: primary,
          isPrimary: "true",
          sortKey: rosterGroups[index].positionDisplayOrder,
          itemKey: milpacIdCombat,
          listKey: primarySortKey + milpacIdCombat,
        });
        uniqueNamesSet.add(fullName);
      }

      //Next, check the combat roster secondaries for matching billet id's, then push to return array if match is found.

      for (let index2 in milpacArray[0].combat.profiles[milpacIdCombat]
        .secondaries) {
        let secondary =
          milpacArray[0].combat.profiles[milpacIdCombat].secondaries[index2];
        let secondarySortKey =
          milpacArray[0].combat.profiles[milpacIdCombat].secondaries[index2]
            .positionId;

        if (rosterGroups[index].positionId == secondary.positionId) {
          returnArray.push({
            fullName: fullName,
            position: secondary,
            isPrimary: "false",
            sortKey: rosterGroups[index].positionDisplayOrder,
            itemKey: milpacIdCombat,
            listKey: secondarySortKey + milpacIdCombat,
          });
          uniqueNamesSet.add(fullName);
        }
      }
    }
  }

  //After the Combat Roster, check the Reserves.

  for (let milpacIdReserve in milpacArray[0].reserve.profiles) {
    let rName = milpacArray[0].reserve.profiles[milpacIdReserve].realName;
    let rRank = milpacArray[0].reserve.profiles[milpacIdReserve].rank.rankFull;
    let rPrimary = milpacArray[0].reserve.profiles[milpacIdReserve].primary;
    let rFullName = rRank + " " + rName;
    let rPrimarySortKey =
      milpacArray[0].reserve.profiles[milpacIdReserve].primary.positionId;

    //Check the Reserve primaries, then push to return array if match is found.

    for (let index in rosterGroups) {
      if (rosterGroups[index].positionId == rPrimary.positionId) {
        returnArray.push({
          fullName: rFullName,
          position: rPrimary,
          isPrimary: "true",
          sortKey: rosterGroups[index].positionDisplayOrder,
          itemKey: milpacIdReserve,
          listKey: rPrimarySortKey + milpacIdReserve,
        });
        uniqueNamesSet.add(rFullName);
      }

      //Check the Reserve secondaries, then push to return array if match is found.

      for (let rIndex in milpacArray[0].reserve.profiles[milpacIdReserve]
        .secondaries) {
        let rSecondary =
          milpacArray[0].reserve.profiles[milpacIdReserve].secondaries[rIndex];
        let rSecondarySortKey =
          milpacArray[0].reserve.profiles[milpacIdReserve].secondaries[rIndex]
            .positionId;

        if (rosterGroups[index].positionId == rSecondary.positionId) {
          returnArray.push({
            fullName: rFullName,
            position: rSecondary,
            isPrimary: "false",
            sortKey: rosterGroups[index].positionDisplayOrder,
            itemKey: milpacIdReserve,
            listKey: rSecondarySortKey + milpacIdReserve,
          });
          uniqueNamesSet.add(rFullName);
        }
      }

      // Sort the array based on the order of positionIds in the billetBankObject array. This is mostly accurate, however ranks are not taken into account in the final display
    }
  }
  returnArray.sort((a, b) => {
    const aIndex = a.sortKey;
    const bIndex = b.sortKey;
    return aIndex - bIndex;
  });

  console.log(returnArray);

  return (
    <div className="ParseBox">
      <div className="CounterSubtitle">
        <div className="Subtitle">{props.subtitle}</div>
        <div align="right" className="Counter">
          Unit Strength: {uniqueNamesSet.size}
        </div>
      </div>
      <div className="ItemList">
        <ArrayMap inputArray={returnArray} headerTitles={props.headerTitles} />
      </div>
    </div>
  );
}

export default MilpacParse;

import React from "react";
import Collapsible from "react-collapsible";

function CombinedFunction (props) {

    const billetBankObject = props.billetBankObject;
    const uniqueNamesSet = new Set();

    let collapsibleTitle = props.collapsibleTitle;
    let headerTitles = props.headerTitles;
    let milpacArray = props.milpacArray;
    let usePrimaryOnly = props.usePrimaryOnly;

    let array = Array(billetBankObject.length).fill().map(() => []);

    //console.log (billetBankObject)

    if (usePrimaryOnly === true) {

        for (let milpacIdCombat in milpacArray[0].combat.profiles) {
            let name = milpacArray[0].combat.profiles[milpacIdCombat].realName;
            let rank = milpacArray[0].combat.profiles[milpacIdCombat].rank.rankFull;
            let primary = milpacArray[0].combat.profiles[milpacIdCombat].primary;
            let fullName = rank + " " + name;
            let primarySortKey = milpacArray[0].combat.profiles[milpacIdCombat].primary.positionId;
      
            for (let index in billetBankObject) {
    
                if (billetBankObject[index].includes(primary.positionId)) {
                    array[index].push({
                      fullName: fullName,
                      position: primary,
                      isPrimary: "true",
                      sortKey: primarySortKey,
                      itemKey: milpacIdCombat,
                      listKey: primarySortKey + milpacIdCombat,
                    });
                    uniqueNamesSet.add(fullName);
    
                    // Sorting the array based on the order of positionIds in the billetBankObject array
                    array[index].sort((a, b) => {
                        const aIndex = billetBankObject[index].indexOf(a.sortKey);
                        const bIndex = billetBankObject[index].indexOf(b.sortKey);
                        return aIndex - bIndex;
                    });
                }
    
            }
        } 

    } else if (usePrimaryOnly !== true) {
        
        for (let milpacIdCombat in milpacArray[0].combat.profiles) {
            let name = milpacArray[0].combat.profiles[milpacIdCombat].realName;
            let rank = milpacArray[0].combat.profiles[milpacIdCombat].rank.rankFull;
            let primary = milpacArray[0].combat.profiles[milpacIdCombat].primary;
            let fullName = rank + " " + name;
            let primarySortKey = milpacArray[0].combat.profiles[milpacIdCombat].primary.positionId;
            
            for (let index in billetBankObject) {

                if (billetBankObject[index].includes(primary.positionId)) {
                    array[index].push({
                      fullName: fullName,
                      position: primary,
                      isPrimary: "true",
                      sortKey: primarySortKey,
                      itemKey: milpacIdCombat,
                      listKey: primarySortKey + milpacIdCombat,
                    });
                    uniqueNamesSet.add(fullName);
                }
            
                for (let index2 in milpacArray[0].combat.profiles[milpacIdCombat].secondaries) {
      
                    let secondary = milpacArray[0].combat.profiles[milpacIdCombat].secondaries[index2];
                    let secondarySortKey = milpacArray[0].combat.profiles[milpacIdCombat].secondaries[index2].positionId;
            
                    if (!billetBankObject[index].includes(secondary.positionId)) {
                      continue;
                    }
            
                    array[index].push({
                      fullName: fullName,
                      position: secondary,
                      isPrimary: "false",
                      sortKey: secondarySortKey,
                      itemKey: milpacIdCombat,
                      listKey: secondarySortKey + milpacIdCombat,
                    });
                    uniqueNamesSet.add(fullName);
                }
            }
        }
        
        for (let milpacIdReserve in milpacArray[0].reserve.profiles) {
            let rName = milpacArray[0].reserve.profiles[milpacIdReserve].realName;
            let rRank = milpacArray[0].reserve.profiles[milpacIdReserve].rank.rankFull;
            let rPrimary = milpacArray[0].reserve.profiles[milpacIdReserve].primary;
            let rFullName = rRank + " " + rName;
            let rPrimarySortKey = milpacArray[0].reserve.profiles[milpacIdReserve].primary.positionId;

            for (let index in billetBankObject) {

                if (billetBankObject[index].includes(rPrimary.positionId)) {
                    array[index].push({
                      fullName: rFullName,
                      position: rPrimary,
                      isPrimary: "true",
                      sortKey: rPrimarySortKey,
                      itemKey: milpacIdReserve,
                      listKey: rPrimarySortKey + milpacIdReserve,
                    });
                    uniqueNamesSet.add(rFullName);
                }
            
                for (let rIndex in milpacArray[0].reserve.profiles[milpacIdReserve].secondaries) {
                    let rSecondary = milpacArray[0].reserve.profiles[milpacIdReserve].secondaries[rIndex];
                    let rSecondarySortKey = milpacArray[0].reserve.profiles[milpacIdReserve].secondaries[rIndex].positionId;
            
                    if (!billetBankObject[index].includes(rSecondary.positionId)) {
                      continue;
                    }
            
                    array[index].push({
                      fullName: rFullName,
                      position: rSecondary,
                      isPrimary: "false",
                      sortKey: rSecondarySortKey,
                      itemKey: milpacIdReserve,
                      listKey: rSecondarySortKey + milpacIdReserve,
                    });
                    uniqueNamesSet.add(rFullName);
                }

                // Sorting the array based on the order of positionIds in the billetBankObject array
                array[index].sort((a, b) => {
                    const aIndex = billetBankObject[index].indexOf(a.sortKey);
                    const bIndex = billetBankObject[index].indexOf(b.sortKey);
                    return aIndex - bIndex;
                });
            }
        }
    }

    return (
        <div className="DepartmentContainer">
            <Collapsible
            trigger = {collapsibleTitle}
            triggerClassName="Title"
            triggerOpenedClassName="Title"
            open = {true}
            >
                <div className="ResponseContainer">
                    <div className="ItemList">  
                        <table>
                            <tbody>
                                {array.map((subArray, index) => (
                                    <React.Fragment key={`fragment-${index}`}>
                                        <tr key={`header-${index}`}>
                                            <th className="Subtitle" align="left">{headerTitles[index]}</th>
                                            <th align="right" className="Counter">Unit Strength: {array[index].length}</th>
                                        </tr>
                                        {subArray.map((item, subIndex) => (
                                            <tr key={item.listKey}>
                                                <td>
                                                    <a href={"https://7cav.us/rosters/profile/" + item.itemKey}>
                                                        {item.fullName}
                                                    </a>
                                                </td>
                                                <td>{item.position.positionTitle}</td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Collapsible>
        </div>
    );    
};

export default CombinedFunction;
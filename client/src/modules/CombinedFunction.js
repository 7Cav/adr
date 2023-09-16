import React from "react";
import Collapsible from "react-collapsible";

function CombinedFunction (props) {

    const billetBankObject = props.billetBankObject
    const uniqueNamesSet = new Set();

    let collapsibleTitle = props.collapsibleTitle
    let subtitle = props.subtitle
    let milpacArray = props.milpacArray;
    let usePrimaryOnly = props.usePrimaryOnly;

    let array = Array(billetBankObject.length).fill().map(() => []);

    console.log (billetBankObject)

    
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

                // Sorting the array based on the order of positionIds in the billetIDs array
                array[index].sort((a, b) => {
                    const aIndex = billetBankObject[index].indexOf(a.sortKey);
                    const bIndex = billetBankObject[index].indexOf(b.sortKey);
                    return aIndex - bIndex;
                });
            }

        }
    } 

    console.log (array)

    for (let index in array) {
        for (let index2 in array[index]) {
            console.log(array[index][index2])
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
                <div className="HeaderContainer">
                    <div className="Subtitle">{subtitle}</div>
                    <div className="Counter">Unit Strength: {uniqueNamesSet.size}</div>
                </div>
                <div className="ItemList">
                    <table>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Billet</th>
                        </tr>
                        </thead>
                        <tbody>
                            {array.fullName}
                        </tbody>
                    </table>
                </div>
            </div>
            </Collapsible>
        </div>
    );

    
};


export default CombinedFunction;

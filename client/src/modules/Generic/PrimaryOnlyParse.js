import React from "react";
import Collapsible from "react-collapsible";


//PrimaryOnlyParse is enacted when the billets you want to list are only primary billets. e.g. First Battalion billets.
//Primary only billets are defined within billetbank.js 

function ActiveOnlyParse(props) {

    const billetBankObject = props.billetBankObject;
    let milpacArray = props.milpacArray;

    /*currently broken
    const uniqueNamesSet = new Set();
    */

    let array = Array(billetBankObject.length)
    .fill()
    .map(() => []);

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
    
};

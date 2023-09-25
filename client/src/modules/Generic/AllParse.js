import React from "react";
import Collapsible from "react-collapsible";


//AllParse is enacted when the billets you want to list are either secondaries, secondary-as-primaries, or are billets that can be held by reservists. e.g. S1, S2, and S3 billets
//AllParse is used when an object in BilletBank.js has the isPrimaryOnly tag absent, or marked as false.

function AllParse(props) {

    const billetBankObject = props.billetBankObject;
    let milpacArray = props.milpacArray;

    /*currently broken
    const uniqueNamesSet = new Set();
    */

    let array = Array(billetBankObject.length)
    .fill()
    .map(() => []);

    //First, check the combat roster primaries for matching billet id's, then push them to the return array if match is found.

    for (let milpacIdCombat in milpacArray[0].combat.profiles) {
        let name = milpacArray[0].combat.profiles[milpacIdCombat].realName;
        let rank = milpacArray[0].combat.profiles[milpacIdCombat].rank.rankFull;
        let primary = milpacArray[0].combat.profiles[milpacIdCombat].primary;
        let fullName = rank + " " + name;
        let primarySortKey =
        milpacArray[0].combat.profiles[milpacIdCombat].primary.positionId;

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

        //Next, check the combat roster secondaries for matching billet id's, then push to return array if match is found.

        for (let index2 in milpacArray[0].combat.profiles[milpacIdCombat]
            .secondaries) {
            let secondary =
            milpacArray[0].combat.profiles[milpacIdCombat].secondaries[index2];
            let secondarySortKey =
            milpacArray[0].combat.profiles[milpacIdCombat].secondaries[index2]
                .positionId;

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

    //After the Combat Roster, check the Reserves.

    for (let milpacIdReserve in milpacArray[0].reserve.profiles) {
        let rName = milpacArray[0].reserve.profiles[milpacIdReserve].realName;
        let rRank =
        milpacArray[0].reserve.profiles[milpacIdReserve].rank.rankFull;
        let rPrimary = milpacArray[0].reserve.profiles[milpacIdReserve].primary;
        let rFullName = rRank + " " + rName;
        let rPrimarySortKey =
        milpacArray[0].reserve.profiles[milpacIdReserve].primary.positionId;

        //Check the Reserve primaries, then push to return array if match is found.

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

        //Check the Reserve secondaries, then push to return array if match is found.

        for (let rIndex in milpacArray[0].reserve.profiles[milpacIdReserve]
            .secondaries) {
            let rSecondary =
            milpacArray[0].reserve.profiles[milpacIdReserve].secondaries[
                rIndex
            ];
            let rSecondarySortKey =
            milpacArray[0].reserve.profiles[milpacIdReserve].secondaries[rIndex]
                .positionId;

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
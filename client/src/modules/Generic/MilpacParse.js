import React from 'react';

function MilpacParse (props) {
    var array = [];
    var milpacArray = props.milpacArray
    var billetIDs = props.billetIDs

    for (var milpacIdCombat in milpacArray[0].combat.profiles) {

        var name = milpacArray[0].combat.profiles[milpacIdCombat].realName;
        var rank = milpacArray[0].combat.profiles[milpacIdCombat].rank.rankFull 
        var primary = milpacArray[0].combat.profiles[milpacIdCombat].primary;
        var fullName = rank + ' ' + name;
        var primarySortKey = milpacArray[0].combat.profiles[milpacIdCombat].primary.positionId;

        if (billetIDs.includes(primary.positionId)) {

            array.push({
                "fullName": fullName,
                "position": primary,
                "isPrimary": 'true',
                "sortKey": primarySortKey,
                "itemKey": milpacIdCombat,
                "listKey": primarySortKey + milpacIdCombat
            })
        }

        for (var index in milpacArray[0].combat.profiles[milpacIdCombat].secondaries) {
            var secondary = milpacArray[0].combat.profiles[milpacIdCombat].secondaries[index]
            var secondarySortKey = milpacArray[0].combat.profiles[milpacIdCombat].secondaries[index].positionId;

            if (!billetIDs.includes(secondary.positionId)) {
                continue;
            }

            array.push({
                "fullName": fullName,
                "position": secondary,
                "isPrimary": 'false',
                "sortKey": secondarySortKey,
                "itemKey": milpacIdCombat,
                "listKey": secondarySortKey + milpacIdCombat
            })
        }
    }; 

    for (var milpacIdReserve in milpacArray[0].reserve.profiles) {

        var rName = milpacArray[0].reserve.profiles[milpacIdReserve].realName;
        var rRank = milpacArray[0].reserve.profiles[milpacIdReserve].rank.rankFull 
        var rPrimary = milpacArray[0].reserve.profiles[milpacIdReserve].primary;
        var rFullName = rRank + ' ' + rName;
        var rPrimarySortKey = milpacArray[0].reserve.profiles[milpacIdReserve].primary.positionId;

        if (billetIDs.includes(rPrimary.positionId)) {

            array.push({
                "fullName": rFullName,
                "position": rPrimary,
                "isPrimary": 'true',
                "sortKey": rPrimarySortKey,
                "itemKey": milpacIdReserve,
                "listKey": rPrimarySortKey + milpacIdReserve
            })
        }

        for (var rIndex in milpacArray[0].reserve.profiles[milpacIdReserve].secondaries) {
            var rSecondary = milpacArray[0].reserve.profiles[milpacIdReserve].secondaries[rIndex]
            var rSecondarySortKey = milpacArray[0].reserve.profiles[milpacIdReserve].secondaries[rIndex].positionId;

            if (!billetIDs.includes(rSecondary.positionId)) {
                continue;
            }

            array.push({
                "fullName": rFullName,
                "position": rSecondary,
                "isPrimary": 'false',
                "sortKey": rSecondarySortKey,
                "itemKey": milpacIdReserve,
                "listKey": rSecondarySortKey + milpacIdReserve 
            })
        }
    }; 

    array.sort((a,b) => a.sortKey - b.sortKey)
    return(
        <div className='WAGList'>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Billet</th>
                    </tr>
                </thead>
                <tbody>
                    {array.map( obj => {
                        return(
                            <tr key={obj.listKey}>
                                <td><a href={"https://7cav.us/rosters/profile/" + obj.itemKey}>{obj.fullName}</a></td>
                                <td>{obj.position.positionTitle}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default MilpacParse;
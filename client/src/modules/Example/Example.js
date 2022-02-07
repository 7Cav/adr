// import React from 'react';

function positionList (listArray) {
    var {listArray} = listArray //Takes the 'listArray' attribute from the App.Js file, which in this case is the reserve and combat rosters contained in an object
    var array = []; //This is where the matching positions defined in 'wagPositions' go when they are found
    var wagPositions = ['39','43']; //These numbers are the position ID's of your selected billet. e.g. 39 = 'WAG 1IC' see the referenceList in this folder for more info

    for (var milpacIdCombat in listArray[0].combat.profiles) {

        var name = listArray[0].combat.profiles[milpacIdCombat].realName;
        var rank = listArray[0].combat.profiles[milpacIdCombat].rank.rankFull 
        var primary = listArray[0].combat.profiles[milpacIdCombat].primary;
        var fullName = rank + ' ' + name;

        if (wagPositions.includes(primary.positionId)) {

            array.push({
                "fullName": fullName,
                "position": primary,
                "isPrimary": 'true'
            })
        }

        for (var index in listArray[0].combat.profiles[milpacIdCombat].secondaries) {
            var secondary = listArray[0].combat.profiles[milpacIdCombat].secondaries[index]

            if (!wagPositions.includes(secondary.positionId)) {
                continue;
            }

            array.push({
                "fullName": fullName,
                "position": secondary,
                "isPrimary": 'false'
            })
        }
    }; 

    for (var milpacIdReserve in listArray[0].reserve.profiles) {

        var rName = listArray[0].reserve.profiles[milpacIdReserve].realName;
        var rRank = listArray[0].reserve.profiles[milpacIdReserve].rank.rankFull 
        var rPrimary = listArray[0].reserve.profiles[milpacIdReserve].primary;
        var rFullName = rRank + ' ' + rName;

        if (wagPositions.includes(rPrimary.positionId)) {

            array.push({
                "fullName": rFullName,
                "position": rPrimary,
                "isPrimary": 'true'
            })
        }

        for (var rIndex in listArray[0].reserve.profiles[milpacIdReserve].secondaries) {
            var rSecondary = listArray[0].reserve.profiles[milpacIdReserve].secondaries[rIndex]

            if (!wagPositions.includes(rSecondary.positionId)) {
                continue;
            }

            array.push({
                "fullName": rFullName,
                "position": rSecondary,
                "isPrimary": 'false'
            })
        }
    }; 
    // This returns a table of the desired values. 
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
                            <tr key={obj.fullName}>
                                <td>{obj.fullName}</td>
                                <td>{obj.position.positionTitle}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

// export default positionList


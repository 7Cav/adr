import React from 'react';

function MilpacParsePrimaryOnly (props) {
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

export default MilpacParsePrimaryOnly

import React from 'react';

function Echo3List (listArray) {
    var {listArray} = listArray
    var array = [];
    var echoPositions = ['587','588','581'];

    for (var milpacIdCombat in listArray[0].combat.profiles) {

        var name = listArray[0].combat.profiles[milpacIdCombat].realName;
        var rank = listArray[0].combat.profiles[milpacIdCombat].rank.rankFull 
        var primary = listArray[0].combat.profiles[milpacIdCombat].primary;
        var fullName = rank + ' ' + name;
        var primarySortKey = listArray[0].combat.profiles[milpacIdCombat].primary.positionId;

        if (echoPositions.includes(primary.positionId)) {

            array.push({
                "fullName": fullName,
                "position": primary,
                "isPrimary": 'true',
                "sortKey": primarySortKey,
                "itemKey": name
                
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
                            <tr>
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

export default Echo3List

import React from 'react';

function Delta3List (listArray) {
    var {listArray} = listArray
    var array = [];
    var deltaPositions = ['585','586','576'];

    for (var milpacIdCombat in listArray[0].combat.profiles) {

        var name = listArray[0].combat.profiles[milpacIdCombat].realName;
        var rank = listArray[0].combat.profiles[milpacIdCombat].rank.rankFull 
        var primary = listArray[0].combat.profiles[milpacIdCombat].primary;
        var fullName = rank + ' ' + name;
        var primarySortKey = listArray[0].combat.profiles[milpacIdCombat].primary.positionId;

        if (deltaPositions.includes(primary.positionId)) {

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
                        <th>sortKey</th>
                    </tr>
                </thead>
                <tbody>
                    {array.map( obj => {
                        return(
                            <tr>
                                <td>{obj.fullName}</td>
                                <td>{obj.position.positionTitle}</td>
                                <td>{obj.sortKey}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default Delta3List

import React from 'react';

function Charlie2List (listArray) {
    var {listArray} = listArray
    var array = [];
    var charliePositions = ['435','436','437','438','439','440','441','442','443','444','445','446','447','448','449','450','451','452','453','454','455','456','457','458','459','460','461','462','463','464','465','466','467','468','469','470','471','472','473','474','475','476','477','478','479'];

    for (var milpacIdCombat in listArray[0].combat.profiles) {

        var name = listArray[0].combat.profiles[milpacIdCombat].realName;
        var rank = listArray[0].combat.profiles[milpacIdCombat].rank.rankFull 
        var primary = listArray[0].combat.profiles[milpacIdCombat].primary;
        var fullName = rank + ' ' + name;
        var primarySortKey = listArray[0].combat.profiles[milpacIdCombat].primary.positionId;

        if (charliePositions.includes(primary.positionId)) {

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

export default Charlie2List

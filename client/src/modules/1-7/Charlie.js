import React from 'react';

function Charlie1List (listArray) {
    var {listArray} = listArray
    var array = [];
    var charliePositions = ['286','287','288','289','290','291','292','293','294','295','296','297','298','299','300','301','302','303','304','305','306','307','308','309','310','311','312','313','314','315','316','317','318','319','320','321','322','323','324','325','326','327','328','329','330','331','332','333','334','335','336','337','338','339','340','341','342','343','344'];

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

export default Charlie1List

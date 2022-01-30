import React from 'react';

/*list.map (post => (
<li key={post.id}>{post.profiles[1].realName}</li>
))*/

function WAGList (milpacList) {
    var { milpacList } = milpacList
    var array = [];
    var arrayOfArrays = [];
    var wagPositions = ('WAG 1IC','WAG Admin Clerk');

    for (var milpacIdCombat in milpacList.profiles) {

        var secondariesArray = [];
        var name = milpacList.profiles[milpacIdCombat].realName;
        var rank = milpacList.profiles[milpacIdCombat].rank.rankFull 
        var primaries = milpacList.profiles[milpacIdCombat].primary.positionTitle;
        var fullName = rank + ' ' + name;

     for (var secondariesId in milpacList.profiles[milpacIdCombat].secondaries) {
            var secondaries = milpacList.profiles[milpacIdCombat].secondaries[secondariesId].positionTitle
        

            secondariesArray.push(secondaries)

            console.log (secondariesArray)
            console.log (fullName)

            if (secondariesArray.length === 0) {
                continue;
            }

        }
        
        if (!secondariesArray.includes(wagPositions)) {
            continue;
        }

        array.push(fullName,primaries,secondariesArray);
    }; 

    console.log(array);
    
    const arrayList = array.map ((array) => 
    <li>{array}</li>)

    console.log(arrayOfArrays);
    return(
        <div className='WAGList'>
        <ul>{arrayList}</ul>    
        </div>
    )
}

export default WAGList


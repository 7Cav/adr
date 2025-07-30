import React from "react";

/*This function is probably the most complicated code in the ADR. Essentially, it takes inputArray and headerTitles, and iterates through the first layer of inputArray's arrays
which in this case is the battalion level. At the battalion level, it creates a table row for each company, adding the company title (defined in BilletBank.js) and unit strength counter.
After the title and counter are created for the company level, the lists themselves for each company are created, which are the second layer of arrays. The lists themselves contain
milpac link, name and rank, and position title.*/

function ArrayMap(props) {
  let inputArray = props.inputArray;
  console.log(inputArray);

  return (
    <table>
      <tbody>
        {inputArray.map((item, index) => (
          <React.Fragment key={`fragment-${index}`}>
            <tr key={item.listKey}>
              <td>
                <a href={"https://7cav.us/rosters/profile/" + item.itemKey}>
                  {item.fullName}
                </a>
              </td>
              <td className="positionName">{item.position.positionTitle}</td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}

export default ArrayMap;

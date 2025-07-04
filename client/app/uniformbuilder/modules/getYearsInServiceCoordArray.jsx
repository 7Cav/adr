export default function GetYearsInServiceCoordArray(numYears, rankGrade) {
  if (!numYears) {
    return null;
  }

  const returnArray = [];
  let imageHeight;
  let dy;
  let dx;

  if (rankGrade.includes("W") || rankGrade.includes("O")) {
    returnArray.push("officer");
    dx = 63;
    dy = 511;
    imageHeight = 8;
  } else {
    returnArray.push("enlisted");
    dx = 718;
    dy = 519;
    imageHeight = 10;
  }

  for (let i = 0; i < numYears; i++) {
    let yOffset = i * imageHeight;
    let dyFinal = dy - yOffset;

    returnArray.push({
      dx: dx,
      dy: dyFinal,
    });
  }

  return returnArray;
}

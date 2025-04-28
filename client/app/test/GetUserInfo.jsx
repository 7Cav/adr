import GetCoordArray from "../skunkworks/modules/getCoordArray";

export default async function GetUserInfo(dataActive, ribbonCount) {
  const returnObject = {
    nameTag: dataActive.user.username,
    rank: dataActive.rank.rankShort,
    rankId: dataActive.rank.rankId,
    rankGrade: getRankGrade(dataActive.rank.rankId),
    ribbonCount: ribbonCount,
    coordArray: [],
  };
  returnObject.coordArray = GetCoordArray;

  return returnObject;
}

function getRankGrade(rankId) {
  switch (rankId) {
    case "1":
      return "O11";
    case "2":
      return "O10";
    case "3":
      return "O9";
    case "4":
      return "O8";
    case "5":
      return "O7";
    case "6":
      return "O6";
    case "7":
      return "O5";
    case "8":
      return "O4";
    case "9":
      return "O3";
    case "10":
      return "O2";
    case "11":
      return "O1";
    case "12":
      return "E11";
    case "13":
      return "E10";
    case "14":
      return "E9";
    case "15":
      return "E8";
    case "16":
      return "E7";
    case "17":
      return "E6";
    case "18":
      return "E5";
    case "19":
      return "E4";
    case "20":
      return "E3";
    case "21":
      return "E2";
    case "22":
      return "E1";
    case "26":
      return "W5";
    case "27":
      return "W4";
    case "28":
      return "W3";
    case "29":
      return "W2";
    case "30":
      return "W1";
    default:
      return "E0";
  }
}

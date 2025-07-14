import GetCoordArray from "./getCoordArray";
import GetCitationCoordArray from "./getCitationCoordArray";
import GetCombatBadgeCoords from "./getCombatBadgeCoords";
import GetYearsInServiceCoordArray from "./getYearsInServiceCoordArray";
import GetTabCoordArray from "./getTabCoordArray";

export default function GetUserInfo(
  dataActive,
  ribbonCount,
  citationCount,
  yearsInService,
  tabCount
) {
  const returnObject = {
    nameTag: generateNameTag(dataActive.user.username),
    rank: dataActive.rank.rankShort,
    rankId: dataActive.rank.rankId,
    rankGrade: getRankGrade(dataActive.rank.rankId),
    ribbonCount: ribbonCount,
    unitCitationCount: citationCount,
    yearsInService: yearsInService,
    tabCount: tabCount,
    yearsInServiceCoordArray: [],
    ribbonCoordArray: [],
    unitCitationCoordArray: [],
    combatBadgeCoords: [],
    tabCoordArray: [],
    mosCheck: checkMos(dataActive.mos, getRankGrade(dataActive.rank.rankId)),
    shoulderCord: setShoulderCord(dataActive.mos),
    neckPins: setNeckPins(dataActive.mos),
  };
  returnObject.ribbonCoordArray = GetCoordArray(ribbonCount);
  returnObject.unitCitationCoordArray = GetCitationCoordArray(citationCount);
  returnObject.combatBadgeCoords = GetCombatBadgeCoords(ribbonCount);
  returnObject.yearsInServiceCoordArray = GetYearsInServiceCoordArray(
    yearsInService,
    getRankGrade(dataActive.rank.rankId)
  );
  returnObject.tabCoordArray = GetTabCoordArray(tabCount);

  return returnObject;
}

function generateNameTag(username) {
  const periodIndex = username.indexOf(".");
  const nameTag = username.substring(0, periodIndex);
  return nameTag.toUpperCase();
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

function setShoulderCord(mos) {
  switch (mos) {
    case "68W":
    case "67A":
      return "Medical";
    case "11B":
    case "11A":
    case "11C":
      return "Infantry";
    case "13A":
    case "13B":
      return "Artillery";
    case "12A":
    case "12B":
      return "Engineer";
    case "01A":
      return "Aide";
    case "31A":
    case "31B":
      return "MP";
    case "19K":
    case "19A":
    case "19D":
      return "Armor";
    default:
      return false;
  }
}

function setNeckPins(mos) {
  switch (mos) {
    case "153A":
    case "155A":
    case "15A":
      return "AviationOfficer";
    case "15T":
      return "AviationNCO";
    case "13A":
      return "ArtilleryOfficer";
    case "13B":
      return "ArtilleryNCO";
    case "67A":
      return "MedicalOfficer";
    case "68W":
      return "MedicalNCO";
    case "12A":
      return "EngineerOfficer";
    case "12B":
      return "EngineerNCO";
    case "01A":
      return "Aide";
    case "00Z":
      return "CSM";
    case "255N":
    case "25A":
      return "IMOOfficer";
    case "25U":
      return "IMONCO";
    case "42B":
    case "57A":
    case "46A":
      return "S1S3S5";
    case "35B":
      return "S2NCO";
    case "35A":
      return "S2Officer";
    case "31A":
      return "MPOfficer";
    case "31B":
      return "MPNCO";
    case "19A":
      return "ArmorOfficer";
    case "19K":
    case "19D":
      return "ArmorNCO";
    case "27A":
      return "JAGOfficer";
    case "27D":
      return "JAGNCO";
    case "51A":
    case "50A":
      return "RDCOfficer";
    case "11A":
    case "13A":
    case "47A":
    case "79A":
    case "79Z":
    case "26Z":
    case "47Q":
    case "47C":
      return "InfantryOfficer";
    case "11B":
    case "11C":
    case "42A":
    case "57B":
    case "46S":
    case "79R":
    case "79X":
    case "51S":
    case "49A":
    case "26B":
    case "47T":
      return "InfantryNCO";
    default:
      return false;
  }
}

function checkMos(mos, rankGrade) {
  const officerRegex =
    /\b(?!(?:00Z|11C|42A|49A|14B|12B|35B|31B|11B|57B|26B))[0-9]+[A,B,Z,Q,C,N]/gim;

  if (rankGrade.includes("W") || rankGrade.includes("O")) {
    if (mos.match(officerRegex) == null && mos) {
      return [
        "Failed",
        `MOS ${mos} is an Enlisted/NCO MOS, despite user being of Officer/WO rank. Inform your lead if you see this error.`,
      ];
    }
  }

  if (rankGrade.includes("E")) {
    if (mos.match(officerRegex) != null && mos) {
      return [
        "Failed",
        `MOS ${mos} is an Officer/WO MOS, despite user being of Enlisted/NCO rank. Inform your lead if you see this error.`,
      ];
    }
  }

  return null;
}

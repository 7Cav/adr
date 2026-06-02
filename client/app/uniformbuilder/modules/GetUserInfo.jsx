import GetCoordArray from "./getCoordArray";
import GetCitationCoordArray from "./getCitationCoordArray";
import GetCombatBadgeCoords from "./getCombatBadgeCoords";
import GetYearsInServiceCoordArray from "./getYearsInServiceCoordArray";
import GetTabCoordArray from "./getTabCoordArray";
import { Mos } from "./constants";

export default function GetUserInfo(
  dataActive,
  ribbonCount,
  citationCount,
  yearsInService,
  tabCount,
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
    getRankGrade(dataActive.rank.rankId),
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
    case Mos.M68W:
    case Mos.M67A:
      return "Medical";
    case Mos.M11B:
    case Mos.M11A:
    case Mos.M11C:
      return "Infantry";
    case Mos.M13A:
    case Mos.M13B:
      return "Artillery";
    case Mos.M12A:
    case Mos.M12B:
      return "Engineer";
    case Mos.M01A:
      return "Aide";
    case Mos.M31A:
    case Mos.M31B:
      return "MP";
    case Mos.M19K:
    case Mos.M19A:
    case Mos.M19C:
    case Mos.M19D:
      return "Armor";
    default:
      return false;
  }
}

function setNeckPins(mos) {
  switch (mos) {
    case Mos.M153A:
    case Mos.M155A:
    case Mos.M15A:
      return "AviationOfficer";
    case Mos.M15T:
    case Mos.M155F:
      return "AviationNCO";
    case Mos.M13A:
      return "ArtilleryOfficer";
    case Mos.M13B:
      return "ArtilleryNCO";
    case Mos.M67A:
      return "MedicalOfficer";
    case Mos.M68W:
      return "MedicalNCO";
    case Mos.M12A:
      return "EngineerOfficer";
    case Mos.M12B:
      return "EngineerNCO";
    case Mos.M01A:
      return "Aide";
    case Mos.M00Z:
      return "CSM";
    case Mos.M255N:
    case Mos.M25A:
      return "IMOOfficer";
    case Mos.M25U:
      return "IMONCO";
    case Mos.M42B:
    case Mos.M57A:
    case Mos.M46A:
      return "S1S3S5";
    case Mos.M35B:
      return "S2NCO";
    case Mos.M35A:
      return "S2Officer";
    case Mos.M31A:
      return "MPOfficer";
    case Mos.M31B:
      return "MPNCO";
    case Mos.M19A:
      return "ArmorOfficer";
    case Mos.M19K:
    case Mos.M19C:
    case Mos.M19D:
      return "ArmorNCO";
    case Mos.M27A:
      return "JAGOfficer";
    case Mos.M27D:
      return "JAGNCO";
    case Mos.M51A:
    case Mos.M50A:
      return "RDCOfficer";
    case Mos.M11A:
    case Mos.M13A:
    case Mos.M47A:
    case Mos.M79A:
    case Mos.M79Z:
    case Mos.M26Z:
    case Mos.M47Q:
    case Mos.M47C:
      return "InfantryOfficer";
    case Mos.M11B:
    case Mos.M11C:
    case Mos.M42A:
    case Mos.M57B:
    case Mos.M46S:
    case Mos.M79R:
    case Mos.M79X:
    case Mos.M51S:
    case Mos.M49A:
    case Mos.M26B:
    case Mos.M47T:
      return "InfantryNCO";
    default:
      return false;
  }
}

function checkMos(mos, rankGrade) {
  const officerRegex =
    /\b(?!(?:00Z|11C|42A|49A|14B|12B|35B|31B|11B|57B|26B|13B|19C))[0-9]+[A,B,Z,Q,C,N]/gim;

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

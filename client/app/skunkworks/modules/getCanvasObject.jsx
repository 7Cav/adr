import GetCombatRoster from "../../reusableModules/getCombatRoster";

async function GetCanvasObject() {
  let userId = 19;

  let dataActive = GetCombatRoster;

  let awardCounts = [];

  awardCounts.push({
    nameTag: dataActive.profiles[userId].user.username,
    rank: dataActive.profiles[userId].rank.rankShort,
    rankId: dataActive.profiles[userId].rank.rankId,
    rankGrade: getRankGrade(dataActive.profiles[userId].rank.rankId),
  });

  for (let award in dataActive.profiles[userId].awards) {
    let awardName = dataActive.profiles[userId].awards[award].awardName;
    let awardPriority = getAwardPriority(awardName);

    let hasValorDevice = awardName.includes("with Valor Device"); // Check for Valor Device

    let baseAwardName = hasValorDevice
      ? awardName.replace(" with Valor Device", "")
      : awardName; // Extract base name

    // Find existing award object or create a new one based on base name
    const existingAward = awardCounts.find(
      (obj) => obj.awardName === baseAwardName
    );

    if (existingAward) {
      existingAward.count++;
      if (
        baseAwardName == "Army Commendation Medal" ||
        baseAwardName == "Bronze Star"
      ) {
        existingAward.hasValorDevice =
          existingAward.hasValorDevice || hasValorDevice; // Set hasValorDevice if applicable
      }
    } else if (hasValorDevice) {
      awardCounts.push({
        awardName: baseAwardName,
        count: 1,
        awardPriority: getAwardPriority(baseAwardName),
        hasValorDevice:
          hasValorDevice &&
          (baseAwardName == "Army Commendation Medal" ||
            baseAwardName == "Bronze Star"),
      });
    } else {
      awardCounts.push({
        awardName: baseAwardName,
        count: 1,
        awardPriority: awardPriority,
      });
    }
  }

  awardCounts.sort((a, b) => {
    const aPriority =
      typeof a.awardPriority == "string" ? 999 : a.awardPriority;
    const bPriority =
      typeof b.awardPriority == "string" ? 999 : b.awardPriority;

    return aPriority - bPriority; // ascending order
  });

  return awardCounts;
}

function getRankGrade(rankId) {
  console.log(typeof rankId);

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
      return "Unknown";
  }
}

function getAwardPriority(award) {
  switch (award) {
    case "Brigadier General Krazee Lifetime Achievement Medal":
      return 0;
    case 'CSM Ronnie "Coldblud" Bussey Lifetime Achievement Medal':
      return 1;
    case "Army Distinguished Service Cross":
      return 2;
    case "Defense Distinguished Service Medal":
      return 3;
    case "Army Distinguished Service Medal":
      return 4;
    case "Silver Star":
      return 5;
    case "Defense Superior Service Medal":
      return 6;
    case "Legion of Merit":
      return 7;
    case "Distinguished Flying Cross":
      return 8;
    case "Soldier's Medal":
      return 9;
    case "Bronze Star with Valor":
    case "Bronze Star Medal":
    case "Bronze Star":
      return 10;
    case "Purple Heart":
      return 11;
    case "Defense Meritorious Service Medal":
      return 12;
    case "Meritorious Service Medal":
      return 13;
    case "Army Air Medal":
      return 14;
    case "Joint Service Commendation Medal":
      return 15;
    case "Army Commendation Medal With Valor":
    case "Army Commendation Medal":
      return 16;
    case "Joint Service Achievement Medal":
      return 17;
    case "Army Achievement Medal":
      return 18;
    case "Prisoner of War Medal":
      return 19;
    case "Army Good Conduct Medal":
      return 20;
    case "Armed Forces Expeditionary Medal":
      return 21;
    case "Afghanistan Campaign Medal":
      return 22;
    case "Iraq Campaign Medal":
      return 23;
    case "Global War on Terrorism Expeditionary Medal":
      return 24;
    case "National Defense Service Medal":
      return 25;
    case "Armed Forces Service Medal":
      return 26;
    case "Humanitarian Service Medal":
      return 27;
    case "Donation Ribbon":
      return 28;
    case "7th Cavalry Server Upgrade Award":
      return 29;
    case "StackUp Donation Medal":
      return 30;
    case "Outstanding Volunteer Service Medal":
      return 31;
    case "NCO Professional Development Ribbon":
      return 32;
    case "Honor Graduate Ribbon":
      return 33;
    case "Army Service Ribbon":
      return 34;
    case "United Nations Service Medal":
      return 35;
    case "Overseas Service Ribbon":
      return 36;
    case "DCS Service Ribbon":
      return 37;
    case "Squad Service Ribbon":
      return 38;
    case "World War II Service Ribbon":
      return 39;
    case "Hell Let Loose Service Ribbon":
      return 40;
    case "Recruiting Service Ribbon":
      return 41;
    case "D-Day Commemorative Medal":
      return 42;
    case "Sniper Medal":
      return 43;
    case "Basic Assault Course Ribbon":
      return 44;
    default:
      return "N/A";
  }
}

export default await GetCanvasObject();

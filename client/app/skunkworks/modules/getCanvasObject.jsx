import GetIndividual from "../../reusableModules/getIndividual";
import GetCoordArray from "./getCoordArray";

async function GetCanvasObject() {
  let dataActive = GetIndividual;

  let awardCounts = [];

  //console.log(dataActive);

  awardCounts.push({
    nameTag: dataActive.user.username,
    rank: dataActive.rank.rankShort,
    rankId: dataActive.rank.rankId,
    rankGrade: getRankGrade(dataActive.rank.rankId),
    ribbonMedalCount: 0,
    coordArray: [],
  });

  for (let award in dataActive.awards) {
    let awardName = dataActive.awards[award].awardName;
    let awardDetails = getawardDetails(awardName);

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
        count: 0,
        awardDetails: getawardDetails(
          baseAwardName,
          hasValorDevice &&
            (baseAwardName == "Army Commendation Medal" ||
              baseAwardName == "Bronze Star")
        ),
      });
    } else {
      awardCounts.push({
        awardName: baseAwardName,
        count: 0,
        awardDetails: awardDetails,
      });
    }
  }

  //Generate coord array

  let ribbonMedalCount = 0;

  for (let i = 1; i < awardCounts.length; i++) {
    if (awardCounts[i].awardDetails.awardPriority != "N/A") {
      ribbonMedalCount++;
    }
  }

  awardCounts[0].ribbonMedalCount = ribbonMedalCount;
  awardCounts[0].coordArray = GetCoordArray(ribbonMedalCount);

  console.log(awardCounts[0]);

  // Ensure there are at least two elements to sort
  if (awardCounts.length > 1) {
    // Extract the first element
    const firstElement = awardCounts.shift();

    // Sort the remaining elements
    awardCounts.sort((a, b) => {
      const getPriority = (item) => {
        if (item && item.awardDetails && item.awardDetails.awardPriority) {
          const priority = item.awardDetails.awardPriority;
          return typeof priority === "string" ? Infinity : priority;
        }
        return Infinity;
      };

      const aPriority = getPriority(a);
      const bPriority = getPriority(b);

      return aPriority - bPriority;
    });

    // Put the first element back at the beginning
    awardCounts.unshift(firstElement);
  }

  //console.log(awardCounts);

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

function getawardDetails(award, hasValorDevice) {
  switch (award) {
    case 'James "Krazee" Foster Lifetime Achievement Medal':
      return {
        awardPriority: 1,
      };
    case 'Ronnie "Coldblud" Bussey Lifetime Achievement Medal':
      return {
        awardPriority: 2,
      };
    case "Army Distinguished Service Cross":
      return {
        awardPriority: 3,
        awardAttachmentType: "oakClusters",
      };
    case "Defense Distinguished Service Medal":
      return {
        awardPriority: 4,
        awardAttachmentType: "oakClusters",
      };
    case "Army Distinguished Service Medal":
      return {
        awardPriority: 5,
        awardAttachmentType: "oakClusters",
      };
    case "Silver Star":
      return {
        awardPriority: 6,
        awardAttachmentType: "oakClusters",
      };
    case "Defense Superior Service Medal":
      return {
        awardPriority: 7,
        awardAttachmentType: "oakClusters",
      };
    case "Legion of Merit":
      return {
        awardPriority: 8,
        awardAttachmentType: "oakClusters",
      };
    case "Distinguished Flying Cross":
      return {
        awardPriority: 9,
        awardAttachmentType: "oakClusters",
      };
    case "Soldiers Medal":
      return {
        awardPriority: 10,
        awardAttachmentType: "oakClusters",
      };
    case "Bronze Star with Valor":
    case "Bronze Star Medal":
    case "Bronze Star":
      if (hasValorDevice == true) {
        return {
          awardPriority: 11,
          awardAttachmentType: "oakClustersValor",
        };
      } else {
        return {
          awardPriority: 11,
          awardAttachmentType: "oakClusters",
        };
      }
    case "Purple Heart":
      return {
        awardPriority: 12,
        awardAttachmentType: "oakClusters",
      };
    case "Defense Meritorious Service Medal":
      return {
        awardPriority: 13,
        awardAttachmentType: "oakClusters",
      };
    case "Meritorious Service Medal":
      return {
        awardPriority: 14,
        awardAttachmentType: "oakClusters",
      };
    case "Army Air Medal":
      return {
        awardPriority: 15,
        awardAttachmentType: "oakClusters",
      };
    case "Joint Service Commendation Medal":
      return {
        awardPriority: 16,
        awardAttachmentType: "oakClusters",
      };
    case "Army Commendation Medal With Valor":
    case "Army Commendation Medal":
      if (hasValorDevice == true) {
        return {
          awardPriority: 17,
          awardAttachmentType: "oakClustersValor",
        };
      } else {
        return {
          awardPriority: 17,
          awardAttachmentType: "oakClusters",
        };
      }
    case "Joint Service Achievement Medal":
      return {
        awardPriority: 18,
        awardAttachmentType: "oakClusters",
      };
    case "Army Achievement Medal":
      return {
        awardPriority: 19,
        awardAttachmentType: "oakClusters",
      };
    case "Prisoner of War Medal":
      return {
        awardPriority: 20,
        awardAttachmentType: "oakClusters",
      };
    case "Army Good Conduct Medal":
      return {
        awardPriority: 21,
        awardAttachmentType: "gcNotches",
      };
    case "Armed Forces Expeditionary Medal":
      return {
        awardPriority: 22,
        awardAttachmentType: "stars",
      };
    case "Afghanistan Campaign Medal":
      return {
        awardPriority: 23,
        awardAttachmentType: "stars",
      };
    case "Iraq Campaign Medal":
      return {
        awardPriority: 24,
        awardAttachmentType: "stars",
      };
    case "Global War on Terrorism Expeditionary Medal":
      return {
        awardPriority: 25,
        awardAttachmentType: "stars",
      };
    case "National Defense Service Medal":
      return {
        awardPriority: 26,
        awardAttachmentType: "stars",
      };
    case "Armed Forces Service Medal":
      return {
        awardPriority: 27,
        awardAttachmentType: "oakClusters",
      };
    case "Humanitarian Service Medal":
      return {
        awardPriority: 28,
        awardAttachmentType: "oakClusters",
      };
    case "Donation Ribbon":
      return {
        awardPriority: 29,
        awardAttachmentType: "oakClusters",
      };
    case "7th Cavalry Server Upgrade Award":
      return {
        awardPriority: 30,
        awardAttachmentType: "silverStars",
      };
    case "StackUp Donation Medal":
      return {
        awardPriority: 31,
        awardAttachmentType: "gcNotches", //TODO: Implement special count logic
      };
    case "Outstanding Volunteer Service Medal":
      return {
        awardPriority: 32,
        awardAttachmentType: "oakClusters",
      };
    case "NCO Professional Development Ribbon":
      return {
        awardPriority: 33,
        awardAttachmentType: "ncoNums",
      };
    case "Honor Graduate Ribbon":
      return {
        awardPriority: 34,
      };
    case "Army Service Ribbon":
      return {
        awardPriority: 35,
      };
    case "United Nations Service Medal":
      return {
        awardPriority: 36,
        awardAttachmentType: "stars",
      };
    case "Overseas Service Ribbon":
      return {
        awardPriority: 36,
        awardAttachmentType: "oakClusters", //will require extra logic
      };
    case "DCS Service Ribbon":
      return {
        awardPriority: 38,
        awardAttachmentType: "oakClusters", //will require extra logic
      };
    case "Squad Service Ribbon":
      return {
        awardPriority: 39,
        awardAttachmentType: "oakClusters", //will require extra logic
      };
    case "World War II Service Ribbon":
      return {
        awardPriority: 40,
        awardAttachmentType: "oakClusters", //will require extra logic
      };
    case "Hell Let Loose Service Ribbon":
      return {
        awardPriority: 41,
        awardAttachmentType: "oakClusters", //will require extra logic
      };
    case "Recruiting Ribbon":
      return {
        awardPriority: 42,
        awardAttachmentType: "oakClusters",
      };
    case "D-Day Commemorative Medal":
      return {
        awardPriority: 43,
      };
    case "Sniper Medal":
      return {
        awardPriority: 44,
      };
    case "Basic Assault Course Ribbon":
      return {
        awardPriority: 45,
      };
    default:
      return {
        awardPriority: "N/A",
      };
  }
}

export default await GetCanvasObject();

import GetIndividual from "../reusableModules/getIndividual";

export default async function test() {
  class Award {
    awardTitle = null;
    awardDetail = null;
    awardPriority = null;

    constructor(data) {
      this.awardTitle = data.awardName;
    }
  }

  class Ribbon extends Award {
    static totalRibbonCount = 0;
    hasValorDevice = null;
    maxAwardcount = null;
    ribbonAttachmentType = null;
    ribbonAttachmentCount = 0;

    constructor(data) {
      super(data);
      Ribbon.totalRibbonCount++;
    }
  }

  class Medal extends Ribbon {
    static totalMedalCount = 0;

    constructor(data) {
      super(data);
      if (this.awardTitle.includes("with Valor Device")) {
        this.overrideAwardTitle(data.awardName);
      }
      Medal.totalMedalCount++;
    }

    overrideAwardTitle(awardName) {
      const baseAwardName = awardName.replace(" with Valor Device", "");
      this.awardTitle = baseAwardName;
      this.hasValorDevice = true;
    }
  }

  class Badge extends Award {
    // Do things
  }

  class unitCitation extends Ribbon {
    // Do moar things
  }

  const userName = "Vercin.G";

  const data = await GetIndividual(userName);
  const awardMap = new Map();

  for (let i in data.awards) {
    //Check to see if the API medal is one with valor. If so, flag it w/ hasValorDevice.
    //Set the key of the Award to be the Award Name.

    let key;
    let hasValorDevice = false;

    if (data.awards[i].awardName.includes("with Valor Device")) {
      key = data.awards[i].awardName.replace(" with Valor Device", "");
      hasValorDevice = true;
    } else {
      key = data.awards[i].awardName;
    }

    //If there is already an award with the key, add the valor device to the existing obj if true and increment AttachmentCount
    //Otherwise, create the award, and add it (and the key) to the Map.

    if (awardMap.has(key)) {
      const existingAward = awardMap.get(key);
      if (hasValorDevice == true) {
        existingAward.hasValorDevice = true;
      }
      existingAward.awardAttachmentCount++;
    } else {
      const awardDetails = getawardDetails(key, hasValorDevice);
      if (awardDetails.awardType == "Ribbon") {
        const newRibbon = new Ribbon(data.awards[i]);
        awardMap.set(key, newRibbon);
      } else if (awardDetails.awardType == "Medal") {
        const newMedal = new Medal(data.awards[i]);
        awardMap.set(key, newMedal);
      } else {
        const newAward = new Award(data.awards[i]);
        awardMap.set(key, newAward);
      }
    }
  }

  //Create an output array from the Map and return it.

  const arr = Array.from(awardMap.values());
  console.log(arr);

  return <h1>Hello There!</h1>;
}

function getawardDetails(award, hasValorDevice) {
  switch (award) {
    case 'James "Krazee" Foster Lifetime Achievement Medal':
      return {
        awardPriority: 1,
        awardType: "Medal",
      };
    case 'Ronnie "Coldblud" Bussey Lifetime Achievement Medal':
      return {
        awardPriority: 2,
        awardType: "Medal",
      };
    case "Army Distinguished Service Cross":
      return {
        awardPriority: 3,
        awardAttachmentType: "oakClusters",
        awardType: "Medal",
      };
    case "Defense Distinguished Service Medal":
      return {
        awardPriority: 4,
        awardAttachmentType: "oakClusters",
        awardType: "Medal",
      };
    case "Army Distinguished Service Medal":
      return {
        awardPriority: 5,
        awardAttachmentType: "oakClusters",
        awardType: "Medal",
      };
    case "Silver Star":
      return {
        awardPriority: 6,
        awardAttachmentType: "oakClusters",
        awardType: "Medal",
      };
    case "Defense Superior Service Medal":
      return {
        awardPriority: 7,
        awardAttachmentType: "oakClusters",
        awardType: "Medal",
      };
    case "Legion of Merit":
      return {
        awardPriority: 8,
        awardAttachmentType: "oakClusters",
        awardType: "Medal",
      };
    case "Distinguished Flying Cross":
      return {
        awardPriority: 9,
        awardAttachmentType: "oakClusters",
        awardType: "Medal",
      };
    case "Soldiers Medal":
      return {
        awardPriority: 10,
        awardAttachmentType: "oakClusters",
        awardType: "Medal",
      };
    case "Bronze Star with Valor":
    case "Bronze Star Medal":
    case "Bronze Star":
      if (hasValorDevice == true) {
        return {
          awardPriority: 11,
          awardAttachmentType: "oakClustersValor",
          awardType: "Medal",
        };
      } else {
        return {
          awardPriority: 11,
          awardAttachmentType: "oakClusters",
          awardType: "Medal",
        };
      }
    case "Purple Heart":
      return {
        awardPriority: 12,
        awardAttachmentType: "oakClusters",
        awardType: "Medal",
      };
    case "Defense Meritorious Service Medal":
      return {
        awardPriority: 13,
        awardAttachmentType: "oakClusters",
        awardType: "Medal",
      };
    case "Meritorious Service Medal":
      return {
        awardPriority: 14,
        awardAttachmentType: "oakClusters",
        awardType: "Medal",
      };
    case "Army Air Medal":
      return {
        awardPriority: 15,
        awardAttachmentType: "ncoNums",
        awardType: "Medal",
      };
    case "Joint Service Commendation Medal":
      return {
        awardPriority: 16,
        awardAttachmentType: "oakClusters",
        awardType: "Medal",
      };
    case "Army Commendation Medal With Valor":
    case "Army Commendation Medal":
      if (hasValorDevice == true) {
        return {
          awardPriority: 17,
          awardAttachmentType: "oakClustersValor",
          awardType: "Medal",
        };
      } else {
        return {
          awardPriority: 17,
          awardAttachmentType: "oakClusters",
          awardType: "Medal",
        };
      }
    case "Joint Service Achievement Medal":
      return {
        awardPriority: 18,
        awardAttachmentType: "oakClusters",
        awardType: "Medal",
      };
    case "Army Achievement Medal":
      return {
        awardPriority: 19,
        awardAttachmentType: "oakClusters",
        awardType: "Medal",
      };
    case "Prisoner of War Medal":
      return {
        awardPriority: 20,
        awardAttachmentType: "oakClusters",
        awardType: "Medal",
      };
    case "Army Good Conduct Medal":
      return {
        awardPriority: 21,
        awardAttachmentType: "gcNotches",
        awardType: "Medal",
      };
    case "Armed Forces Expeditionary Medal":
      return {
        awardPriority: 22,
        awardAttachmentType: "stars",
        awardType: "Medal",
      };
    case "Afghanistan Campaign Medal":
      return {
        awardPriority: 23,
        awardAttachmentType: "stars",
        awardType: "Medal",
      };
    case "Iraq Campaign Medal":
      return {
        awardPriority: 24,
        awardAttachmentType: "stars",
        awardType: "Medal",
      };
    case "Global War on Terrorism Expeditionary Medal":
      return {
        awardPriority: 25,
        awardAttachmentType: "stars",
        awardType: "Medal",
      };
    case "National Defense Service Medal":
      return {
        awardPriority: 26,
        awardAttachmentType: "stars",
        awardType: "Medal",
      };
    case "Armed Forces Service Medal":
      return {
        awardPriority: 27,
        awardAttachmentType: "stars",
        awardType: "Medal",
      };
    case "Humanitarian Service Medal":
      return {
        awardPriority: 28,
        awardAttachmentType: "stars",
        awardType: "Medal",
      };
    case "Donation Ribbon":
      return {
        awardPriority: 29,
        awardAttachmentType: "starsDonation",
        awardType: "Ribbon",
      };
    case "7th Cavalry Server Upgrade Award":
      return {
        awardPriority: 30,
        awardAttachmentType: "silverStars",
        awardType: "Medal",
      };
    case "StackUp Donation Medal":
      return {
        awardPriority: 31,
        awardAttachmentType: "gcNotches",
        awardType: "Medal",
      };
    case "Outstanding Volunteer Service Medal":
      return {
        awardPriority: 32,
        awardAttachmentType: "oakClusters",
        awardType: "Medal",
      };
    case "NCO Professional Development Ribbon":
      return {
        awardPriority: 33,
        awardAttachmentType: "ncoNums",
        awardType: "Ribbon",
      };
    case "Honor Graduate Ribbon":
      return {
        awardPriority: 34,
        awardType: "Ribbon",
      };
    case "Army Service Ribbon":
      return {
        awardPriority: 35,
        awardType: "Ribbon",
      };
    case "Cavalry Centurion Medal":
      return {
        awardPriority: 36,
        awardAttachmentType: "silverStars",
        awardType: "Medal",
      };
    case "United Nations Service Medal":
      return {
        awardPriority: 37,
        awardAttachmentType: "stars",
        awardType: "Medal",
      };
    case "Overseas Service Ribbon":
      return {
        awardPriority: 38,
        awardAttachmentType: "oakClustersService",
        awardType: "Ribbon",
      };
    case "Ready or Not Service Ribbon":
      return {
        awardPriority: 39,
        awardAttachmentType: "oakClustersService",
        awardType: "Ribbon",
      };
    case "DCS World Service Ribbon":
      return {
        awardPriority: 40,
        awardAttachmentType: "oakClustersService",
        awardType: "Ribbon",
      };
    case "Squad Service Ribbon":
      return {
        awardPriority: 41,
        awardAttachmentType: "oakClustersService",
        awardType: "Ribbon",
      };
    case "WWII Service Ribbon":
      return {
        awardPriority: 42,
        awardAttachmentType: "oakClustersService",
        awardType: "Ribbon",
      };
    case "Hell Let Loose Service Ribbon":
      return {
        awardPriority: 43,
        awardAttachmentType: "oakClustersService",
        awardType: "Ribbon",
      };
    case "Hell Let Loose Console Service Ribbon":
      return {
        awardPriority: 44,
        awardAttachmentType: "oakClustersService",
        awardType: "Ribbon",
      };
    case "Recruiting Ribbon":
      return {
        awardPriority: 45,
        awardAttachmentType: "starsDonation",
        awardType: "Ribbon",
      };
    case "D-Day Commemorative Medal":
      return {
        awardPriority: 46,
        awardType: "Medal",
      };
    case "Ranger Selection Ribbon":
      return {
        awardPriority: 47,
        awardType: "Ribbon",
      };
    case "Sniper Ribbon":
      return {
        awardPriority: 48,
        awardType: "Ribbon",
      };
    case "Basic Assault Course Ribbon":
      return {
        awardPriority: 49,
        awardType: "Ribbon",
      };
    default:
      return {
        awardPriority: "N/A",
      };
  }
}

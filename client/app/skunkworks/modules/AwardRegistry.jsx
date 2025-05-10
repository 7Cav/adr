export class AwardRegistry {
  constructor() {
    this.awards = new Map();
    this.initalizeAwards();
  }

  // prettier-ignore
  initalizeAwards() {

    //____MAINLINE MEDALS AND RIBBONS____

    this.awards.set(`7th Cavalry Lifetime Dedication Award`, {awardPriority: 0, medalPriority: 0, awardType: "Medal"});
    this.awards.set(`James "Krazee" Foster Lifetime Achievement Medal`, {awardPriority: 1, medalPriority: 1, awardType: "Medal"});
    this.awards.set(`Ronnie "Coldblud" Bussey Lifetime Achievement Medal`, {awardPriority: 2, medalPriority: 2, awardType: "Medal"});
    this.awards.set("Army Distinguished Service Cross", {awardPriority: 3, medalPriority: 3, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Defense Distinguished Service Medal", {awardPriority: 4, medalPriority: 4, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Army Distinguished Service Medal", {awardPriority: 5, medalPriority: 5, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Silver Star", {awardPriority: 6, medalPriority: 6, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Defense Superior Service Medal", {awardPriority: 7, medalPriority: 7, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Legion of Merit", {awardPriority: 8, medalPriority: 8, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Distinguished Flying Cross", {awardPriority: 9, medalPriority: 9, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Soldiers Medal", {awardPriority: 10, medalPriority: 10, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Bronze Star", {awardPriority: 11, medalPriority: 11, awardAttachmentType: "oakClusters", awardType: "MedalWithValor"});
    this.awards.set("Purple Heart", {awardPriority: 12, medalPriority: 12, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Defense Meritorious Service Medal", {awardPriority: 13, medalPriority: 13, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Meritorious Service Medal", {awardPriority: 14, medalPriority: 14, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Air Medal", {awardPriority: 15, medalPriority: 15, awardAttachmentType: "ncoNums", awardType: "Medal"});
    this.awards.set("Joint Service Commendation Medal", {awardPriority: 16, medalPriority: 16, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Army Commendation Medal", {awardPriority: 17, medalPriority: 17, awardAttachmentType: "oakClusters", awardType: "MedalWithValor"});
    this.awards.set("Joint Service Achievement Medal", {awardPriority: 18, medalPriority: 18, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Army Achievement Medal",{awardPriority: 19, medalPriority: 19, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Prisoner of War Medal", {awardPriority: 20, medalPriority: 20, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Army Good Conduct Medal", {awardPriority: 21, medalPriority: 21, awardAttachmentType: "gcNotches", awardType: "Medal"});
    this.awards.set("Armed Forces Expeditionary Medal", {awardPriority: 22, medalPriority: 22, awardAttachmentType: "stars", awardType: "Medal"});
    this.awards.set("Afghanistan Campaign Medal", {awardPriority: 23, medalPriority: 23, awardAttachmentType: "stars", awardType: "Medal"});
    this.awards.set("Iraq Campaign Medal", {awardPriority: 24, medalPriority: 24, awardAttachmentType: "stars", awardType: "Medal"});
    this.awards.set("Global War on Terrorism Expeditionary Medal", {awardPriority: 25, medalPriority: 25, awardAttachmentType: "stars", awardType: "Medal"});
    this.awards.set("National Defense Service Medal", {awardPriority: 26, medalPriority: 26, awardAttachmentType: "stars", awardType: "Medal"});
    this.awards.set("Armed Forces Service Medal", {awardPriority: 27, medalPriority: 27, awardAttachmentType: "stars", awardType: "Medal"});
    this.awards.set("Humanitarian Service Medal", {awardPriority: 28, medalPriority: 28, awardAttachmentType: "stars", awardType: "Medal"});
    this.awards.set("Donation Ribbon", {awardPriority: 29, awardAttachmentType: "starsDonation", awardType: "RibbonDonationLogic"}); // Requires Special Case
    this.awards.set("7th Cavalry Server Upgrade Award", {awardPriority: 30, medalPriority: 29, awardAttachmentType: "stars", awardType: "MedalTiered"}); // Fuck you, whoever put this into SOP
    this.awards.set("StackUp Donation Medal", {awardPriority: 31, medalPriority: 30, awardAttachmentType: "gcNotches", awardType: "MedalTiered"}); // and again
    this.awards.set("Outstanding Volunteer Service Medal", {awardPriority: 32, medalPriority: 31, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("NCO Professional Development Ribbon", {awardPriority: 33, awardAttachmentType: "ncoNums", awardType: "Ribbon"});
    this.awards.set("Honor Graduate Ribbon", {awardPriority: 34, awardType: "Ribbon"});
    this.awards.set("Army Service Ribbon", {awardPriority: 35, awardType: "Ribbon"});
    this.awards.set("Cavalry Centurion Medal", {awardPriority: 36, medalPriority: 32, awardAttachmentType: "silverStars", awardType: "Medal"});
    this.awards.set("United Nations Service Medal", {awardPriority: 37, medalPriority: 33, awardAttachmentType: "stars", awardType: "Medal"});
    this.awards.set("Overseas Service Ribbon", {awardPriority: 38, medalPriority: 34, awardAttachmentType: "oakClustersService", awardType: "Medal"});
    this.awards.set("Ready or Not Service Ribbon",{awardPriority: 39, medalPriority: 35, awardAttachmentType: "oakClustersService", awardType: "Medal"});
    this.awards.set("DCS World Service Ribbon", {awardPriority: 40, medalPriority: 36, awardAttachmentType: "oakClustersService", awardType: "Medal"});
    this.awards.set("Squad Service Ribbon", {awardPriority: 41, medalPriority: 37, awardAttachmentType: "oakClustersService", awardType: "Medal"});
    this.awards.set("WWII Service Ribbon", {awardPriority: 42, medalPriority: 38, awardAttachmentType: "oakClustersService", awardType: "Medal"});
    this.awards.set("Hell Let Loose Service Ribbon", {awardPriority: 43, medalPriority: 39, awardAttachmentType: "oakClustersService", awardType: "Medal"});
    this.awards.set("Hell Let Loose Console Service Ribbon", {awardPriority: 44, medalPriority: 40, awardAttachmentType: "oakClustersService", awardType: "Medal"});
    this.awards.set("Recruiting Ribbon", {awardPriority: 45, awardAttachmentType: "starsDonation", awardType: "RibbonDonationLogic"}); // May Also require Special Case
    this.awards.set("D-Day Commemorative Medal", {awardPriority: 46, medalPriority: 41, awardType: "Medal"});
    this.awards.set("Ranger Selection Ribbon", {awardPriority: 47, awardType: "Ribbon"});
    this.awards.set("Sniper Ribbon", {awardPriority: 48, medalPriority: 42, awardType: "Medal"});
    this.awards.set("Basic Assault Course Ribbon", {awardPriority: 49, awardType: "Ribbon"});

    // ___ DISCONTINUED RIBBONS/MEDALS ___
    // These ones are a bit of an unknown precidence wise. Indeed we have some discon awards above, however precidence is known
    // Anything here is shown as is, and there is no inherent precicence for these. 

    this.awards.set("Cadre Course Ribbon", {awardPriority: 50, awardType: "Ribbon"});
    this.awards.set("Womens Army Corp Service Medal", {awardPriority: 51, medalPriority:43, awardType: "Medal"})
    this.awards.set("D Day Participation Ribbon", {awardPriority: 52, awardType: "Ribbon"})
    this.awards.set("European/African/Middle Eastern Campaign Medal", {awardPriority: 53, medalPriority:44, awardType: "Medal"})
    

    //____ UNIT CITATIONS ____
    
    this.awards.set("Army & Air Force Presidential Unit Citation", {awardPriority: 0, awardAttachmentType: "unitCitationClusters", awardType: "UnitCitation"});
    this.awards.set("Army Valorous Unit Citation", {awardPriority: 1, awardAttachmentType: "unitCitationClusters", awardType: "UnitCitation"});
    this.awards.set("Joint Meritorious Unit Citation", {awardPriority: 2, awardAttachmentType: "unitCitationClusters", awardType: "UnitCitation"});
    this.awards.set("Army Meritorious Unit Citation", {awardPriority: 3, awardAttachmentType: "unitCitationClusters", awardType: "UnitCitation"});
    this.awards.set("Army Superior Unit Citation", {awardPriority: 4, awardAttachmentType: "unitCitationClusters", awardType: "UnitCitation"});
    this.awards.set("7th Cavalry Black Ops Unit Citation", {awardPriority: 5, awardAttachmentType: "unitCitationSStars", awardType: "UnitCitation"});

    // ____ COMBAT BADGES ____

    this.awards.set("Flight Medic Badge", {awardPriority: 6, awardType: "BadgeCombat"});  // (3/1/b/1-7) (4/1/b/1-7)
    this.awards.set("Master Army Aviator Badge", {awardPriority: 8, awardType: "BadgeCombat"}); // (A/1-7) (A/ACD)
    this.awards.set("Senior Army Aviator Badge", {awardPriority: 7, awardType: "BadgeCombat"})
    this.awards.set("Army Aviator Badge", {awardPriority: 6, awardType: "BadgeCombat"})
    this.awards.set("Combat Infantry Badge 4th Award", {awardPriority: 5, awardType: "BadgeCombat"})
    this.awards.set("Combat Infantry Badge 2nd Award", {awardPriority: 3, awardType: "BadgeCombat"})
    this.awards.set("Combat Infantry Badge 3rd Award", {awardPriority: 4, awardType: "BadgeCombat"})
    this.awards.set("Combat Infantry Badge", {awardPriority: 2, awardType: "BadgeCombat"})
    this.awards.set("Expert Infantry Badge", {awardPriority: 1, awardType: "BadgeCombat"}) // et. al.


    //____ WEAPON QUALS ____
  }

  isInRegistry(awardName) {
    return this.awards.has(awardName);
  }

  getAwardDetails(awardName) {
    if (awardName.includes("with Valor Device")) {
      awardName = awardName.replace(" with Valor Device", "");
    }

    if (this.awards.get(awardName) == undefined) {
      return 0;
    }

    return this.awards.get(awardName);
  }

  getMaxAwardCount(awardName) {
    switch (this.getAwardDetails(awardName).awardAttachmentType) {
      case "oakClusters":
        return 19;
      case "unitCitationClusters":
        return 10;
      case "unitCitationSStars":
        return 5;
      case "oakClustersService":
        return 6;
      case "oakClustersValor":
        return 14;
      case "silverStars":
        return 5;
      case "stars":
        return 10;
      case "starsDonation": //Requires advanced logic
        return 12;
      case "gcNotches":
        return 9;
      case "ncoNums":
        return 6;
      default:
        return 1;
    }
  }
}

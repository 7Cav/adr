export class AwardRegistry {
  constructor() {
    this.awards = new Map();
    this.initalizeAwards();
  }

  // prettier-ignore
  initalizeAwards() {
    this.awards.set(`James "Krazee" Foster Lifetime Achievement Medal`, {awardPriority: 1, awardType: "Medal"});
    this.awards.set(`Ronnie "Coldblud" Bussey Lifetime Achievement Medal`, {awardPriority: 2, awardType: "Medal"});
    this.awards.set("Army Distinguished Service Cross", {awardPriority: 3, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Defense Distinguished Service Medal", {awardPriority: 4, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Army Distinguished Service Medal", {awardPriority: 5, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Silver Star", {awardPriority: 6, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Defense Superior Service Medal", {awardPriority: 7, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Legion of Merit", {awardPriority: 8, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Distinguished Flying Cross", {awardPriority: 9, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Soldiers Medal", {awardPriority: 10, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Bronze Star", {awardPriority: 11, awardAttachmentType: "oakClusters", awardType: "MedalWithValor"});
    this.awards.set("Purple Heart", {awardPriority: 12, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Defense Meritorious Service Medal", {awardPriority: 13, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Meritorious Service Medal", {awardPriority: 14, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Air Medal", {awardPriority: 15, awardAttachmentType: "ncoNums", awardType: "Medal"});
    this.awards.set("Joint Service Commendation Medal", {awardPriority: 16, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Army Commendation Medal", {awardPriority: 17, awardAttachmentType: "oakClusters", awardType: "AwardWithValor"});
    this.awards.set("Joint Service Achievement Medal", {awardPriority: 18, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Army Achievement Medal",{awardPriority: 19, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Prisoner of War Medal", {awardPriority: 20, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("Army Good Conduct Medal", {awardPriority: 21, awardAttachmentType: "gcNotches", awardType: "Medal"});
    this.awards.set("Armed Forces Expeditionary Medal", {awardPriority: 22, awardAttachmentType: "stars", awardType: "Medal"});
    this.awards.set("Afghanistan Campaign Medal", {awardPriority: 23, awardAttachmentType: "stars", awardType: "Medal"});
    this.awards.set("Iraq Campaign Medal", {awardPriority: 24, awardAttachmentType: "stars", awardType: "Medal"});
    this.awards.set("Global War on Terrorism Expeditionary Medal", {awardPriority: 25, awardAttachmentType: "stars", awardType: "Medal"});
    this.awards.set("National Defense Service Medal", {awardPriority: 26, awardAttachmentType: "stars", awardType: "Medal"});
    this.awards.set("Armed Forces Service Medal", {awardPriority: 27, awardAttachmentType: "stars", awardType: "Medal"});
    this.awards.set("Humanitarian Service Medal", {awardPriority: 28, awardAttachmentType: "stars", awardType: "Medal"});
    this.awards.set("Donation Ribbon", {awardPriority: 29, awardAttachmentType: "starsDonation", awardType: "Ribbon"});
    this.awards.set("7th Cavalry Server Upgrade Award", {awardPriority: 30, awardAttachmentType: "silverStars", awardType: "Medal"});
    this.awards.set("StackUp Donation Medal", {awardPriority: 31, awardAttachmentType: "gcNotches", awardType: "Medal"}); // This will likely need to be its own case
    this.awards.set("Outstanding Volunteer Service Medal", {awardPriority: 32, awardAttachmentType: "oakClusters", awardType: "Medal"});
    this.awards.set("NCO Professional Development Ribbon", {awardPriority: 33, awardAttachmentType: "ncoNums", awardType: "Ribbon"});
    this.awards.set("Honor Graduate Ribbon", {awardPriority: 34, awardType: "Ribbon"});
    this.awards.set("Army Service Ribbon", {awardPriority: 35, awardType: "Ribbon"});
    this.awards.set("Cavalry Centurion Medal", {awardPriority: 36, awardAttachmentType: "silverStars", awardType: "Medal"});
    this.awards.set("United Nations Service Medal", {awardPriority: 37, awardAttachmentType: "stars", awardType: "Medal"});
    this.awards.set("Overseas Service Ribbon", {awardPriority: 38, awardAttachmentType: "oakClustersService", awardType: "Ribbon"});
    this.awards.set("Ready or Not Service Ribbon",{awardPriority: 39, awardAttachmentType: "oakClustersService", awardType: "Ribbon"});
    this.awards.set("DCS World Service Ribbon", {awardPriority: 40, awardAttachmentType: "oakClustersService", awardType: "Ribbon"});
    this.awards.set("Squad Service Ribbon", {awardPriority: 41, awardAttachmentType: "oakClustersService", awardType: "Ribbon"});
    this.awards.set("WWII Service Ribbon", {awardPriority: 42, awardAttachmentType: "oakClustersService", awardType: "Ribbon"});
    this.awards.set("Hell Let Loose Service Ribbon", {awardPriority: 43, awardAttachmentType: "oakClustersService", awardType: "Ribbon"});
    this.awards.set("Hell Let Loose Console Service Ribbon", {awardPriority: 44, awardAttachmentType: "oakClustersService", awardType: "Ribbon"});
    this.awards.set("Recruiting Ribbon", {awardPriority: 45, awardAttachmentType: "starsDonation", awardType: "Ribbon"});
    this.awards.set("D-Day Commemorative Medal", {awardPriority: 46, awardType: "Medal"});
    this.awards.set("Ranger Selection Ribbon", {awardPriority: 47, awardType: "Ribbon"});
    this.awards.set("Sniper Ribbon", {awardPriority: 48, awardType: "Ribbon"});
    this.awards.set("Basic Assault Course Ribbon", {awardPriority: 49, awardType: "Ribbon"});
  }

  isInRegistry(awardName) {
    return this.awards.has(awardName);
  }

  getAwardDetails(awardName) {
    if (awardName.includes("with Valor Device")) {
      awardName = awardName.replace(" with Valor Device", "");
    }

    return this.awards.get(awardName);
  }

  getMaxAwardCount(awardName) {
    switch (this.getAwardDetails(awardName).awardAttachmentType) {
      case "oakClusters":
        return 19;
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
      default:
        return 1;
    }
  }
}

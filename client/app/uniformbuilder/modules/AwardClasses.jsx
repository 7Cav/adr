export class Award {
  awardTitle = null;
  //awardDetail = null;
  awardPriority = null;

  constructor(data) {
    this.awardTitle = data.awardName;
  }
}

export class Ribbon extends Award {
  maxAwardcount = null;
  ribbonAttachmentType = null;
  ribbonDisplayedAttachmentCount = 0;
  ribbonTrueAttachmentCount = 0;

  constructor(data, AwardRegistry) {
    super(data);

    const registryDetails = AwardRegistry.getAwardDetails(data.awardName);

    if (!(registryDetails.awardAttachmentType == undefined)) {
      this.ribbonAttachmentType = registryDetails.awardAttachmentType;
    }
    this.awardPriority = registryDetails.awardPriority;
    this.maxAwardcount = AwardRegistry.getMaxAwardCount(this.awardTitle);

    Ribbon.totalRibbonCount++;
  }

  incrementAwardCount() {
    this.ribbonTrueAttachmentCount++;
    this.calculateNewDisplayCount();
  }

  calculateNewDisplayCount() {
    if (this.ribbonTrueAttachmentCount <= this.maxAwardcount) {
      this.ribbonDisplayedAttachmentCount++;
    }
  }
}

export class Medal extends Ribbon {
  medalPriority;

  constructor(data, AwardRegistry) {
    super(data, AwardRegistry);
    const registryDetails = AwardRegistry.getAwardDetails(data.awardName);
    this.medalPriority = registryDetails.medalPriority;
    Medal.totalMedalCount++;
  }
}

export class MedalWithValor extends Medal {
  hasValorDevice = false;

  constructor(data, AwardRegistry) {
    super(data, AwardRegistry);

    if (this.awardTitle.includes("with Valor Device")) {
      this.overrideAwardTitle(data.awardName);
    }
  }

  overrideAwardTitle(awardName) {
    const baseAwardName = awardName.replace(" with Valor Device", "");
    this.awardTitle = baseAwardName;
    this.hasValorDevice = true;
    this.ribbonAttachmentType = "oakClustersValor";
  }
}

export class RibbonDonationLogic extends Ribbon {
  constructor(data, AwardRegistry) {
    super(data, AwardRegistry);
    this.ribbonTrueAttachmentCount = 1;
  }

  incrementAwardCount() {
    this.ribbonTrueAttachmentCount++;
    this.calculateNewDisplayCount();
  }

  //prettier-ignore
  calculateNewDisplayCount() {
    if (this.ribbonTrueAttachmentCount < 6) {
      this.ribbonDisplayedAttachmentCount++;
    }
    if ( this.ribbonTrueAttachmentCount >= 6 && this.ribbonTrueAttachmentCount < 10) {
      this.ribbonDisplayedAttachmentCount = 5;
    }
    if (this.ribbonTrueAttachmentCount >= 10 && this.ribbonTrueAttachmentCount < 15) {
      this.ribbonDisplayedAttachmentCount = 6;
    }
    if (this.ribbonTrueAttachmentCount >= 15 && this.ribbonTrueAttachmentCount < 20) {
      this.ribbonDisplayedAttachmentCount = 7;
    }
    if (this.ribbonTrueAttachmentCount >= 20 && this.ribbonTrueAttachmentCount < 25) {
      this.ribbonDisplayedAttachmentCount = 8;
    }
    if (this.ribbonTrueAttachmentCount >= 25 && this.ribbonTrueAttachmentCount < 50) {
      this.ribbonDisplayedAttachmentCount = 9;
    }
    if (this.ribbonTrueAttachmentCount >= 50 && this.ribbonTrueAttachmentCount < 75) {
      this.ribbonDisplayedAttachmentCount = 10;
    }
    if ( this.ribbonTrueAttachmentCount >= 75 && this.ribbonTrueAttachmentCount < 100) {
      this.ribbonDisplayedAttachmentCount = 11;
    }
    if (this.ribbonTrueAttachmentCount >= 100) {
      this.ribbonDisplayedAttachmentCount = 12;
    }
  }
}

export class MedalTiered extends Medal {
  highestTierAchieved = 0;

  constructor(data, AwardRegistry) {
    super(data, AwardRegistry);

    this.updateTieredMedal(data.awardDetails);
    this.ribbonTrueAttachmentCount = null;
  }

  incrementAwardCount() {
    return;
  }

  updateTieredMedal(detail) {
    //Stackup logic
    if (this.ribbonAttachmentType == "gcNotches") {
      switch (detail) {
        case "Gold Knot":
          this.highestTierAchieved = 3;
          this.ribbonDisplayedAttachmentCount = 7;
          break;
        case "Silver Knot":
          if (this.highestTierAchieved <= 1) {
            this.ribbonDisplayedAttachmentCount = 4;
            this.highestTierAchieved = 2;
          }
          break;
        case "Bronze Knot":
          if (this.highestTierAchieved <= 0) {
            this.ribbonDisplayedAttachmentCount = 1;
            this.highestTierAchieved = 1;
          }
          break;
        default:
          if (this.highestTierAchieved == 0) {
            this.ribbonDisplayedAttachmentCount = 0;
          }
          break;
      }
    }

    //Server upgrade ribbon logic
    if (this.ribbonAttachmentType == "stars") {
      switch (detail) {
        case "Gold Star":
          this.highestTierAchieved = 2;
          this.ribbonDisplayedAttachmentCount = 10;
          break;
        case "Silver Star":
          if (this.highestTierAchieved <= 1) {
            this.ribbonDisplayedAttachmentCount = 5;
            this.highestTierAchieved = 1;
          }
          break;
        default:
          if (this.highestTierAchieved == 0) {
            this.ribbonDisplayedAttachmentCount = 0;
          }
          break;
      }
    }
  }
}

export class Badge extends Award {
  // Do things
}

export class BadgeCombat extends Badge {
  isMedical = false;
  isAviation = false;
  imageNum = 0;
  maxAllowed;

  constructor(awardData, userMos, AwardRegistry) {
    super(awardData, AwardRegistry);

    const registryDetails = AwardRegistry.getAwardDetails(awardData.awardName);
    this.awardPriority = registryDetails.awardPriority;

    if (
      userMos == "153A" ||
      userMos == "155A" ||
      userMos == "15A" ||
      userMos == "15T"
    ) {
      this.isAviation = true;
    }

    if (userMos == "68W" || userMos == "67A") {
      this.isMedical = true;
    }

    this.imageNum = this.getImageNum(this.awardPriority);
    this.setMaxAllowed();
  }

  setMaxAllowed() {
    if (this.isMedical == true) {
      this.maxAllowed = 6;
      return;
    }

    if (this.isAviation == true) {
      this.maxAllowed = 8;
      return;
    }

    this.maxAllowed = 5;
    return;
  }

  getImageNum(num) {
    // 1 - 5 EIB thru CIB4
    // 6 FMB
    // 7 - 10 wings

    if (this.isAviation) {
      switch (num) {
        case 6:
          return 7;
        case 7:
          return 8;
        case 8:
          return 9;
      }
    }

    if (this.isMedical && num == 6) {
      return 6;
    }

    return num;
  }

  updateBadgeCombat(newAwardData, AwardRegistry) {
    const registryDetails = AwardRegistry.getAwardDetails(
      newAwardData.awardName
    );
    const newAwardPriority = registryDetails.awardPriority;

    if (
      newAwardPriority > this.awardPriority &&
      newAwardPriority <= this.maxAllowed
    ) {
      if (
        newAwardData.awardName == "Flight Medic Badge" &&
        this.isMedical == false
      ) {
        return;
      }

      if (
        newAwardData.awardName.includes("Aviator") &&
        this.isAviation == false
      ) {
        return;
      }

      this.awardTitle = newAwardData.awardName;
      this.awardPriority = newAwardPriority;
      this.imageNum = this.getImageNum(newAwardPriority);
    } else {
      return;
    }
  }
}

export class UnitCitation extends Award {
  //Why am i using extends Award even though it is the same as ribbon? Its because im grouping them seperately

  maxAwardcount = null;
  ribbonAttachmentType = null;
  ribbonDisplayedAttachmentCount = 0;
  ribbonTrueAttachmentCount = 0;

  constructor(data, AwardRegistry) {
    super(data);

    const registryDetails = AwardRegistry.getAwardDetails(data.awardName);

    if (!(registryDetails.awardAttachmentType == undefined)) {
      this.ribbonAttachmentType = registryDetails.awardAttachmentType;
    }
    this.awardPriority = registryDetails.awardPriority;
    this.maxAwardcount = AwardRegistry.getMaxAwardCount(this.awardTitle);

    Ribbon.totalRibbonCount++;
  }

  incrementAwardCount() {
    this.ribbonTrueAttachmentCount++;
    this.calculateNewDisplayCount();
  }

  calculateNewDisplayCount() {
    if (this.ribbonTrueAttachmentCount <= this.maxAwardcount) {
      this.ribbonDisplayedAttachmentCount++;
    }
  }
}

export class WeaponQual extends Award {
  expertQuals = [];
  sharpshooterQuals = [];
  marksmanQuals = [];

  weaponOrder = [
    "rifle",
    "grenade",
    "tankWeapons",
    "m203",
    "machineGun",
    "recoillessRifle",
    "pistol",
    "aeroweapons",
    //"carbine",
    //"autoRifle",
    "hydra70",
  ];

  constructor(data, AwardRegistry) {
    super(data);
    this.awardTitle = "Weapon Qualifications";
    this.addAward(data, AwardRegistry);
  }

  sortQuals(qualArray) {
    qualArray.sort((a, b) => {
      const indexA = this.weaponOrder.indexOf(a);
      const indexB = this.weaponOrder.indexOf(b);

      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });
  }

  addAward(data, AwardRegistry) {
    const registryDetails = AwardRegistry.getAwardDetails(data.awardName);

    if (data.awardName.includes("Expert")) {
      this.expertQuals.push(registryDetails.awardTag);
      this.sortQuals(this.expertQuals);
    }

    if (data.awardName.includes("Sharpshooter")) {
      this.sharpshooterQuals.push(registryDetails.awardTag);
      this.sortQuals(this.sharpshooterQuals);
    }

    if (data.awardName.includes("Marksman")) {
      this.marksmanQuals.push(registryDetails.awardTag);
      this.sortQuals(this.marksmanQuals);
    }
  }
}

export class Tab extends Award {
  constructor(data, AwardRegistry) {
    super(data);
    const registryDetails = AwardRegistry.getAwardDetails(data.awardName);
    this.awardPriority = registryDetails.awardPriority;
  }
}

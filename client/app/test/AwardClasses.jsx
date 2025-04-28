export class Award {
  awardTitle = null;
  //awardDetail = null;
  awardPriority = null;

  constructor(data) {
    this.awardTitle = data.awardName;
  }
}

export class Ribbon extends Award {
  static totalRibbonCount = 0;
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
  static totalMedalCount = 0;

  constructor(data, AwardRegistry) {
    super(data, AwardRegistry);
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
  }
}

export class RibbonDonationLogic extends Ribbon {
  constructor(data, AwardRegistry) {
    super(data, AwardRegistry);
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

export class unitCitation extends Award {
  // Do moar things
}

export class Award {
  awardTitle = null;
  //awardDetail = null; May not be needed if exclusive to badges
  awardPriority = null;

  constructor(data) {
    this.awardTitle = data.awardName;
  }
}

export class Ribbon extends Award {
  static totalRibbonCount = 0;
  maxAwardcount = null;
  ribbonAttachmentType = null;
  ribbonAttachmentCount = 0;

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

export class Badge extends Award {
  // Do things
}

export class unitCitation extends Ribbon {
  // Do moar things
}

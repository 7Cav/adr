import {
  MAX_AWARD_COUNT,
  hasValorDevice,
  stripValorDevice,
  AWARD_CATALOG,
} from "./constants";

export class AwardRegistry {
  constructor() {
    this.awards = new Map();
    this.initalizeAwards();
  }

  initalizeAwards() {
    for (const { name, ...details } of AWARD_CATALOG) {
      this.awards.set(name, details);
    }
  }

  isInRegistry(awardName) {
    return this.awards.has(awardName);
  }

  getAwardDetails(awardName) {
    if (hasValorDevice(awardName)) {
      awardName = stripValorDevice(awardName);
    }

    return this.awards.get(awardName) ?? 0;
  }

  getMaxAwardCount(awardName) {
    return (
      MAX_AWARD_COUNT[this.getAwardDetails(awardName).awardAttachmentType] ?? 1
    );
  }
}

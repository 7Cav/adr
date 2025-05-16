import { AwardRegistry } from "./AwardRegistry";
import GetIndividual from "../../reusableModules/getIndividual";
import {
  Award,
  Ribbon,
  Medal,
  MedalWithValor,
  MedalTiered,
  RibbonDonationLogic,
  UnitCitation,
  BadgeCombat,
  WeaponQual,
  Tab,
} from "./AwardClasses";
import GetUserInfo from "./GetUserInfo";

export default async function GetCanvasObject(userName) {
  const data = await GetIndividual(userName);

  let awardCounts = [];
  let totalRibbonCount = 0;
  let totalUnitCitationCount = 0;
  let yearsInService = 0;
  let tabCount = 0;

  const awardMap = new Map();
  const AwardRegistryInstance = new AwardRegistry();

  for (let i in data.awards) {
    //Check to see if the API medal is one with valor. If so, flag it w/ hasValorDevice.
    //Set the key of the Award to be the Award Name.

    let key;
    let hasValorDevice = false;
    let useCombatBadgeLogic = false;
    let combatBadgeKey;

    if (data.awards[i].awardName.includes("with Valor Device")) {
      key = data.awards[i].awardName.replace(" with Valor Device", "");
      hasValorDevice = true;
    } else {
      key = data.awards[i].awardName;
    }

    const awardType = AwardRegistryInstance.getAwardDetails(key).awardType;

    if (awardType == "BadgeCombat") {
      useCombatBadgeLogic = true;
      combatBadgeKey = "BadgeCombat";
    }

    if (awardType == "WeaponQual") {
      useCombatBadgeLogic = true;
      combatBadgeKey = "WeaponQual";
    }

    //If there is already an award with the key, add the valor device to the existing obj if true and increment AttachmentCount
    //Otherwise, create the award, and add it (and the key) to the Map.

    if (key == "Army Good Conduct Medal") {
      yearsInService++;
    }

    if (
      awardMap.has(key) ||
      (useCombatBadgeLogic == true && awardMap.has(combatBadgeKey))
    ) {
      let existingAward;

      if (useCombatBadgeLogic == true) {
        existingAward = awardMap.get(combatBadgeKey);
      } else {
        existingAward = awardMap.get(key);
      }

      if (!existingAward instanceof Ribbon) {
        continue;
      }

      if (existingAward instanceof MedalWithValor) {
        if (hasValorDevice == true) {
          existingAward.hasValorDevice = true;
          existingAward.ribbonAttachmentType = "oakClustersValor";
        }
      }

      if (existingAward instanceof MedalTiered) {
        existingAward.updateTieredMedal(data.awards[i].awardDetails);
      }

      if (existingAward instanceof BadgeCombat) {
        existingAward.updateBadgeCombat(data.awards[i], AwardRegistryInstance);
      }

      if (existingAward instanceof WeaponQual) {
        existingAward.addAward(data.awards[i], AwardRegistryInstance);
      }

      if (
        existingAward instanceof Ribbon ||
        existingAward instanceof UnitCitation
      ) {
        existingAward.incrementAwardCount();
      }
    } else {
      const awardDetails = AwardRegistryInstance.getAwardDetails(key);

      //If there is an entry in the registry for the award, Make the relevent object,
      //If not add generic award object

      //This can probably be written better, but thats a later problem
      if (AwardRegistryInstance.isInRegistry(key)) {
        switch (awardDetails.awardType) {
          case "Ribbon":
            const newRibbon = new Ribbon(data.awards[i], AwardRegistryInstance);
            awardMap.set(key, newRibbon);
            totalRibbonCount++;
            break;
          case "RibbonDonationLogic":
            const newRibbonDonation = new RibbonDonationLogic(
              data.awards[i],
              AwardRegistryInstance
            );
            awardMap.set(key, newRibbonDonation);
            totalRibbonCount++;
            break;
          case "Medal":
            const newMedal = new Medal(data.awards[i], AwardRegistryInstance);
            awardMap.set(key, newMedal);
            totalRibbonCount++;
            break;
          case "MedalTiered":
            const newTiered = new MedalTiered(
              data.awards[i],
              AwardRegistryInstance
            );
            awardMap.set(key, newTiered);
            totalRibbonCount++;
            break;
          case "MedalWithValor":
            const newMedalWithValor = new MedalWithValor(
              data.awards[i],
              AwardRegistryInstance
            );
            awardMap.set(key, newMedalWithValor);
            totalRibbonCount++;
            break;
          case "UnitCitation":
            const newUnitCitation = new UnitCitation(
              data.awards[i],
              AwardRegistryInstance
            );
            awardMap.set(key, newUnitCitation);
            totalUnitCitationCount++;
            break;
          case "BadgeCombat":
            const newBadgeCombat = new BadgeCombat(
              data.awards[i],
              data.primary.positionTitle,
              AwardRegistryInstance
            );
            awardMap.set("BadgeCombat", newBadgeCombat);
            break;
          case "WeaponQual":
            const newWeaponQual = new WeaponQual(
              data.awards[i],
              AwardRegistryInstance
            );
            awardMap.set("WeaponQual", newWeaponQual);
            break;
          case "Tab":
            const newTab = new Tab(data.awards[i], AwardRegistryInstance);
            tabCount++;
            awardMap.set(key, newTab);
            break;
        }
      } else {
        // const newAward = new Award(data.awards[i]);
        // awardMap.set(key, newAward);
      }
    }
  }
  //Create an output array from the Map and return it.

  const userInfo = GetUserInfo(
    data,
    totalRibbonCount,
    totalUnitCitationCount,
    yearsInService,
    tabCount
  );

  const arr = [];
  arr.push(userInfo);

  let ribbons = [];
  let medals = [];
  let unitCitations = [];
  let combatBadge = null;
  let weaponQual = null;
  let tabs = [];

  for (const award of awardMap.values()) {
    if (award instanceof Ribbon) {
      ribbons.push(award);
    }
    if (award instanceof Medal) {
      medals.push(award);
    }
    if (award instanceof UnitCitation) {
      unitCitations.push(award);
    }
    if (award instanceof BadgeCombat) {
      combatBadge = award;
    }
    if (award instanceof WeaponQual) {
      weaponQual = award;
    }
    if (award instanceof Tab) {
      tabs.push(award);
    }
  }

  if (weaponQual == null) {
    weaponQual = 0;
  }

  arr.push(ribbons.sort((a, b) => a.awardPriority - b.awardPriority));
  arr.push(unitCitations.sort((a, b) => a.awardPriority - b.awardPriority));
  arr.push(medals.sort((a, b) => a.awardPriority - b.awardPriority));
  arr.push(combatBadge);
  arr.push(weaponQual);
  arr.push(tabs);

  console.log(arr);

  return arr;
}

import GetIndividual from "../reusableModules/getIndividual";
import { AwardRegistry } from "./AwardRegistry";
import { Award, Ribbon, Medal } from "./AwardClasses";

export default async function test() {
  const userName = "Vercin.G";
  const data = await GetIndividual(userName);

  const awardMap = new Map();
  const AwardRegistryInstance = new AwardRegistry();

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
      existingAward.ribbonAttachmentCount++;
    } else {
      const awardDetails = AwardRegistryInstance.getAwardDetails(
        key /*,hasvalordevice*/
      );

      //If there is an entry in the registry for the award, Make the relevent object,
      //If not add generic award object

      if (AwardRegistryInstance.isInRegistry(key)) {
        if (awardDetails.awardType == "Ribbon") {
          const newRibbon = new Ribbon(data.awards[i], AwardRegistryInstance);
          awardMap.set(key, newRibbon);
        } else if (awardDetails.awardType == "Medal") {
          const newMedal = new Medal(data.awards[i], AwardRegistryInstance);
          awardMap.set(key, newMedal);
        }
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

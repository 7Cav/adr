import GetIndividual from "../reusableModules/getIndividual";

export default async function test() {
  const userName = "Vercin.G";

  const data = await GetIndividual(userName);
  const awardMap = new Map();

  class Award {
    awardTitle;
    awardDetail;
    awardType;
    awardPriority;
    awardAttachmentType;
    awardAttachmentCount;
    maxAwardCount;
    hasValorDevice;
    static totalAwardCount = 0;

    constructor(data) {
      this.setAwardTitle(data.awardName);
      this.awardAttachmentCount = 0;
      Award.totalAwardCount++;
    }

    setAwardTitle(awardName) {
      if (awardName.includes("with Valor Device")) {
        const baseAwardName = awardName.replace(" with Valor Device", "");
        this.awardTitle = baseAwardName;
        this.hasValorDevice = true;
      } else {
        this.awardTitle = awardName;
      }
    }
  }

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
      const newAward = new Award(data.awards[i]);
      awardMap.set(key, newAward);
    }
  }

  //Create an output array from the Map and return it.

  const arr = Array.from(awardMap.values());
  console.log(arr);

  console.log(Award.totalAwardCount);

  return <h1>Hello There!</h1>;
}

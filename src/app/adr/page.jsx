import GetCombatRoster from "./getCombatRoster";
import GetReserveRoster from "./getReserveRoster";
import AdrListEntry from "./modules/AdrListEntry";

let milpacArray = [];

milpacArray.push({
  combat: GetCombatRoster,
  reserve: GetReserveRoster,
});

export default async function ActiveDutyRoster() {
  return (
    <div>
      <AdrListEntry bBGroup={"regi"} milpacArray={milpacArray} />
    </div>
  );
}

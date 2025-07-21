import Link from "next/link";
import GetCombatRoster from "../reusableModules/getCombatRoster";
import GetReserveRoster from "../reusableModules/getReserveRoster";
import GetApiTimestamp from "../reusableModules/getApiTimestamp";
import GetRosterGroups from "../reusableModules/getGroups";
import AdrListEntry from "./modules/AdrListEntry";
import Logo from "../theme/adrLogo";
import "./page.css";
import "../globals.css";

export const metadata = {
  title: "Active Duty Roster",
};

export default async function ActiveDutyRoster() {
  const [combat, reserve, timestamp, groups] = await Promise.all([
    GetCombatRoster(),
    GetReserveRoster(),
    GetApiTimestamp(),
    GetRosterGroups(),
  ]);

  const milpacArray = [{ combat, reserve }];
  const rosterGroups = groups;

  console.log(milpacArray);
  console.log(rosterGroups);

  return <h1>Hello there!</h1>;
}

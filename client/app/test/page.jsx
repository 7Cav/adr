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

  const firstBattGroups = [2, 3, 4, 5, 6];

  return (
    <div className="MasterContainer">
      <div className="p-nav-primary">
        <div className="p-nav-wrapper">
          <nav className="p-nav">
            <div className="p-nav-inner">
              <div className="p-nav-scroller">
                <div className="p-nav-logo">
                  <Link href={"/"}>
                    <Logo
                      alt="ADR Logo"
                      title="Return to CavApps"
                      width="17em"
                      height="3em"
                    />
                  </Link>
                </div>
                <div className="p-nav-info">
                  {timestamp && timestamp[0]?.combat !== null && (
                    <div className="cache-time">
                      Database is {timestamp[0].combat} minutes old
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
      <div className="ListContainer">
        {/*<AdrListEntry bBGroup="regi" milpacArray={milpacArray} /> */}
        <div className="DepartmentContainer">
          <div className="Title">First Battalion</div>
          {firstBattGroups.map((selector) => (
            <AdrListEntry
              rGSelector={selector}
              milpacArray={milpacArray}
              rosterGroups={rosterGroups}
            />
          ))}
        </div>
        {/*<AdrListEntry bBGroup="twoSeven" milpacArray={milpacArray} />
        <AdrListEntry bBGroup="threeSeven" milpacArray={milpacArray} />
        <AdrListEntry bBGroup="acd" milpacArray={milpacArray} />
        <AdrListEntry bBGroup="secOps" milpacArray={milpacArray} />
        <AdrListEntry bBGroup="roo" milpacArray={milpacArray} />
        <AdrListEntry bBGroup="support" milpacArray={milpacArray} /> */}
      </div>
    </div>
  );
}

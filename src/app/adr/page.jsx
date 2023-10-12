import Link from "next/link";
import GetCombatRoster from "../reusableModules/getCombatRoster";
import GetReserveRoster from "../reusableModules/getReserveRoster";
import AdrListEntry from "./modules/AdrListEntry";
import Logo from "../theme/adrLogo";
import "./page.css";
import "../globals.css";

export const metadata = {
  title: "Active Duty Roster",
};

let milpacArray = [];

milpacArray.push({
  combat: GetCombatRoster,
  reserve: GetReserveRoster,
});

export default async function ActiveDutyRoster() {
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
                {/* Data Age Warning NEEDS REWORK */}
                <div className="p-nav-info">
                  {/*{cacheTime && cacheTime.combat !== null && (
                    <div className="cache-time">
                      Combat Roster Age: {cacheTime.combat} minutes old
                    </div>
                  )}
                  {cacheTime && cacheTime.reserve !== null && (
                    <div className="cache-time">
                      Reserve Roster Age: {cacheTime.reserve} minutes old
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
      {/*            Need to set Loading cases and Error Cases to reactivate this section
        loading ? (
        <div className="loading-container">
          <div className="gif-spinner-wrapper">
            <div className="spinner"></div>
            <img
              className="p-loading-png"
              src={require("../style/themes/7cav/hamster-hamtaro.gif")}
              alt="Loading"
            />
          </div>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-wrapper">
            <div>
              <ErrorMessage message={error.message} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="ListContainer">
            note: bBGroup = Billet Bank Group
            <AdrListEntry bBGroup={"regi"} milpacArray={milpacArray} />
            <AdrListEntry bBGroup={"oneSeven"} milpacArray={milpacArray} />
            <AdrListEntry bBGroup={"twoSeven"} milpacArray={milpacArray} />
            <AdrListEntry bBGroup={"acd"} milpacArray={milpacArray} />
            <AdrListEntry bBGroup={"imo"} milpacArray={milpacArray} />
            <AdrListEntry bBGroup={"secOps"} milpacArray={milpacArray} />
            <AdrListEntry bBGroup={"roo"} milpacArray={milpacArray} />
            <AdrListEntry bBGroup={"support"} milpacArray={milpacArray} />
          </div>
        </>
      ) */}
      <div className="ListContainer">
        {/* note: bBGroup = Billet Bank Group */}
        <AdrListEntry bBGroup={"regi"} milpacArray={milpacArray} />
        <AdrListEntry bBGroup={"oneSeven"} milpacArray={milpacArray} />
        <AdrListEntry bBGroup={"twoSeven"} milpacArray={milpacArray} />
        <AdrListEntry bBGroup={"acd"} milpacArray={milpacArray} />
        <AdrListEntry bBGroup={"imo"} milpacArray={milpacArray} />
        <AdrListEntry bBGroup={"secOps"} milpacArray={milpacArray} />
        <AdrListEntry bBGroup={"roo"} milpacArray={milpacArray} />
        <AdrListEntry bBGroup={"support"} milpacArray={milpacArray} />
      </div>
    </div>
  );
}

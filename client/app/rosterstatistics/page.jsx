import dynamic from "next/dynamic";
import GetCombatRoster from "../reusableModules/getCombatRoster";
import GetReserveRoster from "../reusableModules/getReserveRoster";
import GetApiTimestamp from "../reusableModules/getApiTimestamp";
import lists from "../reusableModules/BilletBank";
import "./page.css";

const Statistics = dynamic(() => import("./modules/statistics"), {
  ssr: false,
});

export const metadata = {
  title: "Roster Statistics",
};

// look into moving this into the API calls
let milpacArray = [];

milpacArray.push({
  combat: GetCombatRoster,
  reserve: GetReserveRoster,
});

export default async function Home() {
  return (
    <div className="MasterContainer">
      <div className="DepartmentContainer">
        <p>
          Please note, the Statistics app is currently pending rewrite by S6.
          The values, while accurate, only apply to Active Duty personnel.
        </p>
        {GetApiTimestamp && GetApiTimestamp[0].combat !== null && (
          <div className="cache-time2">
            Database is {GetApiTimestamp[0].combat} minutes old
          </div>
        )}
      </div>
      <div className="DepartmentContainer">
        <div className="RegimentBreakdown">
          <div className="Subtitle">
            7th Cavalry Regiment {"("}Active Duty and Line Billets only
            {")"}
          </div>
          <Statistics
            billetIDs={[
              lists.regiCommand,
              lists.oneSevenCommand,
              lists.alpha1,
              lists.bravo1,
              lists.charlie1,
              lists.twoSevenCommand,
              lists.alpha2,
              lists.bravo2,
              lists.charlie2,
              lists.acdCommand,
              lists.alpha3,
              lists.bravo3,
              lists.charlie3,
              lists.starterPlatoon,
            ]}
            labelArray={[
              "General Staff",
              "1-7 Headquarters",
              "Alpha Company 1-7",
              "Bravo Troop 1-7",
              "Charlie Company 1-7",
              "2-7 Headquarters",
              "Alpha Company 2-7",
              "Bravo Company 2-7",
              "Charlie Company 2-7",
              "ACD Headquarters",
              "Alpha Company ACD",
              "Bravo Company ACD",
              "Charlie Company ACD",
              "Star Citizen Starter Platoon",
            ]}
            milpacArray={milpacArray}
            useRegiLogic={true}
          />
        </div>
        <div className="OneSevenBreakdown">
          <div className="Subtitle">First Battalion</div>
          <Statistics
            billetIDs={[
              lists.oneSevenCommand,
              lists.alpha1,
              lists.bravo1,
              lists.charlie1,
            ]}
            centerLabel={"Total 1-7 Strength"}
            labelArray={[
              "1-7 Headquarters",
              "Alpha Company",
              "Bravo Troop",
              "Charlie Company",
            ]}
            milpacArray={milpacArray}
          />
        </div>
        <div className="TwoSevenBreakdown">
          <div className="Subtitle">Second Battalion</div>
          <Statistics
            billetIDs={[
              lists.twoSevenCommand,
              lists.alpha2,
              lists.bravo2,
              lists.charlie2,
            ]}
            centerLabel={"Total 2-7 Strength"}
            labelArray={[
              "2-7 Headquarters",
              "Alpha Company",
              "Bravo Company",
              "Charlie Company",
            ]}
            milpacArray={milpacArray}
          />
        </div>
        <div className="ACDStrength">
          <div className="Subtitle">Auxillary Combat Division</div>
          <Statistics
            billetIDs={[
              lists.acdCommand,
              lists.alpha3,
              lists.bravo3,
              lists.charlie3,
              lists.starterPlatoon,
            ]}
            centerLabel={"Total ACD Strength"}
            labelArray={[
              "ACD Headquarters",
              "Alpha Company",
              "Bravo Company",
              "Charlie Company",
              "Star Citizen Starter Platoon",
            ]}
            milpacArray={milpacArray}
          />
        </div>
      </div>
    </div>
  );
}

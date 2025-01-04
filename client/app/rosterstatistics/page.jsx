import dynamic from "next/dynamic";
import GetCombatRoster from "../reusableModules/getCombatRoster";
import GetReserveRoster from "../reusableModules/getReserveRoster";
import GetApiTimestamp from "../reusableModules/getApiTimestamp";
import lists from "../reusableModules/BilletBank";
import "./page.css";

// ssr: false cause apex charts
const Statistics = dynamic(
  () => import("../rosterstatistics/modules/statistics"),
  {
    ssr: false,
  },
);

export const metadata = {
  title: "Roster Statistics",
};

export default async function RosterStatistics() {
  const [combat, reserve, timestamp] = await Promise.all([
    GetCombatRoster(),
    GetReserveRoster(),
    GetApiTimestamp(),
  ]);

  const milpacArray = [{ combat, reserve }];

  return (
    <div className="MasterContainer">
      <div className="DepartmentContainer">
        <h4>
          Please note, the Statistics app is currently pending rewrite by S6.
          The values, while accurate, only apply to active duty personnel
        </h4>
      </div>
      {timestamp && timestamp[0]?.combat !== null && (
        <div className="DepartmentContainer">
          Database is {timestamp[0].combat} minutes old
        </div>
      )}
      <div className="DepartmentContainer">
        <div className="RegimentBreakdown">
          <div className="Subtitle">
            7th Cavalry Regiment (Active Duty and Line Billets only)
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
              lists.echo2,
              lists.threeSevenCommand,
              lists.alpha3,
              //lists.bravo3,
              //lists.charlie3,
              lists.acdCommand,
              lists.alpha4,
              lists.bravo4,
              lists.charlie4,
              //lists.starterPlatoon,
              //lists.starterPlatoon2,
              //lists.starterPlatoon3,
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
              "Echo Company 2-7",
              "3-7 Headquarters",
              "Alpha Company 3-7",
              //"Bravo Company 3-7",
              //"Charlie Company 3-7",
              "ACD Headquarters",
              "Alpha Company ACD",
              "Bravo Company ACD",
              "Charlie Company ACD",
              //"Star Citizen SP",
              //"Star Wars RPG SP",
              //"Counter Strike 2 SP",
            ]}
            milpacArray={milpacArray}
            useRegiLogic
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
            centerLabel="Total 1-7 Strength"
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
              lists.echo2,
            ]}
            centerLabel="Total 2-7 Strength"
            labelArray={[
              "2-7 Headquarters",
              "Able Company",
              "Baker Company",
              "Charlie Company",
              "Easy Company",
            ]}
            milpacArray={milpacArray}
          />
        </div>

        <div className="threeSevenBreakdown">
          <div className="Subtitle">Third Battalion</div>
          <Statistics
            billetIDs={[
              lists.threeSevenCommand,
              lists.alpha3,
              //lists.bravo3,
              //lists.charlie3,
            ]}
            centerLabel="Total 3-7 Strength"
            labelArray={[
              "3-7 Headquarters",
              "Alpha Company",
              //"Bravo Company",
              //"Charlie Company",
            ]}
            milpacArray={milpacArray}
          />
        </div>

        <div className="ACDStrength">
          <div className="Subtitle">Auxillary Combat Division</div>
          <Statistics
            billetIDs={[
              lists.acdCommand,
              //lists.alpha4,
              lists.bravo4,
              lists.charlie4,
              //lists.starterPlatoon,
              //lists.starterPlatoon2,
              //lists.starterPlatoon3,
            ]}
            centerLabel="Total ACD Strength"
            labelArray={[
              "ACD Headquarters",
              //"Alpha Company",
              "Bravo Company",
              "Charlie Company",
              //"Star Citizen SP",
              //"Star Wars RPG SP",
              //"Counter Strike 2 SP",
            ]}
            milpacArray={milpacArray}
          />
        </div>
      </div>
    </div>
  );
}

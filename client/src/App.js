import React, { useEffect, useState } from "react";
import "./App.css";
import Collapsible from "react-collapsible";
import lists from "./modules/Generic/BilletBank";
import MilpacParse from "./modules/Generic/MilpacParse";
import ErrorMessage from "./errorMessage";
import Statistics from "./modules/Generic/Statistics";

const CLIENT_TOKEN = process.env.REACT_APP_CLIENT_TOKEN;
const combatApiUrl = process.env.REACT_APP_COMBAT_API_URL;
const reserveApiUrl = process.env.REACT_APP_RESERVE_API_URL;
const cacheTimestampUrl = process.env.REACT_APP_CACHE_TIMESTAMP_URL;
const millisecondsToMinutes = (milliseconds) => {
  return Math.round(milliseconds / (1000 * 60));
};

// import {Helmet} from 'react-helmet';

function MilpacRequest() {
  const [milpacList, setMilpacList] = useState([]);
  const [reserveList, setReserveList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cacheTime, setCacheTime] = useState(null);
  const clscript = `<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "dig85agbqz");
  </script>`;

  // Reusable API fetching function
  async function fetchData(url, setFunction) {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: CLIENT_TOKEN,
        },
      });

      if (!response.ok) {
        throw new Error("HTTP Error! status: " + response.status);
      }

      const responseJSON = await response.json();
      setFunction(responseJSON);
    } catch (error) {
      console.error(`Error fetching data from ${url}: `, error);
      setError(error);
    }
  }

  useEffect(() => {
    // Set loading to true
    setLoading(true);
    fetch(cacheTimestampUrl)
      .then((response) => response.json())
      .then((data) => {
        setCacheTime({
          combat: millisecondsToMinutes(Date.now() - data.cacheTime.combat),
          reserve: millisecondsToMinutes(Date.now() - data.cacheTime.reserve),
        });
      })
      .catch((error) => {
        console.error("Error fetching cache timestamp: ", error);
      });

    Promise.all([
      fetchData(combatApiUrl, setMilpacList),
      fetchData(reserveApiUrl, setReserveList),
    ]).then(() => {
      // Set loading to false once both promises are resolved
      setLoading(false);
    });
  }, []);

  var milpacArray = [];
  milpacArray.push({
    combat: milpacList,
    reserve: reserveList,
  });

  return (
    <div className="MasterContainer">
      <div dangerouslySetInnerHTML={{ __html: clscript }} />
      <div className="p-nav-primary">
        <div className="p-nav-wrapper">
          <nav className="p-nav">
            <div className="p-nav-inner">
              <div className="p-nav-scroller">
                <div className="p-nav-logo">
                  <a href="https://7cav.us">
                    <img
                      className="p-nav-png"
                      src={require("./style/themes/7cav/logo-m.png")}
                      alt="ADR Logo"
                      title="Return to the main website"
                      width=""
                      height=""
                    />
                  </a>
                </div>
                {/* Data Age Warning */}
                <div className="p-nav-info">
                  {cacheTime && cacheTime.combat !== null && (
                    <div className="cache-time">
                      Combat Roster Age: {cacheTime.combat} minutes old
                    </div>
                  )}
                  {cacheTime && cacheTime.reserve !== null && (
                    <div className="cache-time">
                      Reserve Roster Age: {cacheTime.reserve} minutes old
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
      {loading ? (
        <div className="loading-container">
          <div className="gif-spinner-wrapper">
            <div className="spinner"></div>
            <img
              className="p-loading-png"
              src={require("./style/themes/7cav/hamster-hamtaro.gif")}
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
            <div className="DepartmentContainer">
              <Collapsible
                trigger="Regimental Command"
                triggerClassName="Title"
                triggerOpenedClassName="Title"
                open={true}
              >
                <MilpacParse
                  usePrimaryOnly={true}
                  milpacArray={milpacArray}
                  billetIDs={lists.regiCommand}
                  subtitle={"Command Staff"}
                />
              </Collapsible>
            </div>
            <div className="DepartmentContainer">
              <Collapsible
                trigger="First Battalion"
                triggerClassName="Title"
                triggerOpenedClassName="Title"
                open={true}
              >
                <div className="OneSevenCommand">
                  <MilpacParse
                    usePrimaryOnly={true}
                    milpacArray={milpacArray}
                    billetIDs={lists.oneSevenCommand}
                    subtitle={"1-7 Command"}
                  />
                </div>
                <div className="Alpha1">
                  <MilpacParse
                    usePrimaryOnly={true}
                    milpacArray={milpacArray}
                    billetIDs={lists.alpha1}
                    subtitle={"Alpha Company 1-7"}
                  />
                </div>
                <div className="Bravo1">
                  <MilpacParse
                    usePrimaryOnly={true}
                    milpacArray={milpacArray}
                    billetIDs={lists.bravo1}
                    subtitle={"Bravo Company 1-7"}
                  />
                </div>
                <div className="Charlie1">
                  <MilpacParse
                    usePrimaryOnly={true}
                    milpacArray={milpacArray}
                    billetIDs={lists.charlie1}
                    subtitle={"Charlie Company 1-7"}
                  />
                </div>
              </Collapsible>
            </div>
            <div className="DepartmentContainer">
              <Collapsible
                trigger="Second Battalion"
                triggerClassName="Title"
                triggerOpenedClassName="Title"
                open={true}
              >
                <div className="TwoSevenCommand">
                  <MilpacParse
                    usePrimaryOnly={true}
                    milpacArray={milpacArray}
                    billetIDs={lists.twoSevenCommand}
                    subtitle={"2-7 Command"}
                  />
                </div>
                <div className="Alpha2">
                  <MilpacParse
                    usePrimaryOnly={true}
                    milpacArray={milpacArray}
                    billetIDs={lists.alpha2}
                    subtitle={"Alpha Company 2-7"}
                  />
                </div>
                <div className="Bravo2">
                  <MilpacParse
                    usePrimaryOnly={true}
                    milpacArray={milpacArray}
                    billetIDs={lists.bravo2}
                    subtitle={"Bravo Company 2-7"}
                  />
                </div>
                <div className="Charlie2">
                  <MilpacParse
                    usePrimaryOnly={true}
                    milpacArray={milpacArray}
                    billetIDs={lists.charlie2}
                    subtitle={"Charlie Company 2-7"}
                  />
                </div>
              </Collapsible>
            </div>
            <div className="DepartmentContainer">
              <Collapsible
                trigger="Auxillary Combat Division"
                triggerClassName="Title"
                triggerOpenedClassName="Title"
                open={true}
              >
                <div className="ACDCommand">
                  <MilpacParse
                    usePrimaryOnly={true}
                    milpacArray={milpacArray}
                    billetIDs={lists.acdCommand}
                    subtitle={"ACD Command"}
                  />
                </div>
                <div className="Alpha3">
                  <MilpacParse
                    usePrimaryOnly={true}
                    milpacArray={milpacArray}
                    billetIDs={lists.alpha3}
                    subtitle={"Alpha Company"}
                  />
                </div>
                <div className="Bravo3">
                  <MilpacParse
                    usePrimaryOnly={true}
                    milpacArray={milpacArray}
                    billetIDs={lists.bravo3}
                    subtitle={"Bravo Company"}
                  />
                </div>
                <div className="Charlie3">
                  <MilpacParse
                    usePrimaryOnly={true}
                    milpacArray={milpacArray}
                    billetIDs={lists.charlie3}
                    subtitle={"Charlie Company"}
                  />
                </div>
                <div className="Delta3">
                  <MilpacParse
                    usePrimaryOnly={true}
                    milpacArray={milpacArray}
                    billetIDs={lists.delta3}
                    subtitle={"Delta Company"}
                  />
                </div>
                <div className="Echo3">
                  <MilpacParse
                    usePrimaryOnly={true}
                    milpacArray={milpacArray}
                    billetIDs={lists.echo3}
                    subtitle={"Echo Company"}
                  />
                </div>
                <div className="starterPlatoon">
                  <MilpacParse
                    usePrimaryOnly={true}
                    milpacArray={milpacArray}
                    billetIDs={lists.starterPlatoon}
                    subtitle={"Starter Platoon"}
                  />
                </div>
                <div className="futureC">
                  <MilpacParse
                    milpacArray={milpacArray}
                    billetIDs={lists.futureC}
                    subtitle={"Futures and Concepts Center"}
                  />
                </div>
              </Collapsible>
            </div>
            <div className="DepartmentContainer">
              <Collapsible
                trigger="Information Management Office"
                triggerClassName="Title"
                triggerOpenedClassName="Title"
                open={true}
              >
                <div className="IMOStaff">
                  <MilpacParse
                    milpacArray={milpacArray}
                    billetIDs={lists.imoCommand}
                    subtitle={"Information Management Office Command"}
                  />
                </div>
                <div className="S1">
                  <MilpacParse
                    milpacArray={milpacArray}
                    billetIDs={lists.s1}
                    subtitle={"S1 - Administration"}
                  />
                </div>
                <div className="S6">
                  <MilpacParse
                    milpacArray={milpacArray}
                    billetIDs={lists.s6}
                    subtitle={"S6 - Information Management"}
                  />
                </div>
                <div className="WAG">
                  <MilpacParse
                    milpacArray={milpacArray}
                    billetIDs={lists.wag}
                    subtitle={"Wiki Administration Group"}
                  />
                </div>
              </Collapsible>
            </div>
            <div className="DepartmentContainer">
              <Collapsible
                trigger="Security Operations Department"
                triggerClassName="Title"
                triggerOpenedClassName="Title"
                open={true}
              >
                <div className="SecOpsStaff">
                  <MilpacParse
                    milpacArray={milpacArray}
                    billetIDs={lists.secOpsCommand}
                    subtitle={"Security Operations Command"}
                  />
                </div>
                <div className="JAG">
                  <MilpacParse
                    milpacArray={milpacArray}
                    billetIDs={lists.jag}
                    subtitle={"Judge Advocate General Corps"}
                  />
                </div>
                <div className="MP">
                  <MilpacParse
                    milpacArray={milpacArray}
                    billetIDs={lists.mp}
                    subtitle={"Military Police"}
                  />
                </div>
                <div className="S2">
                  <MilpacParse
                    milpacArray={milpacArray}
                    billetIDs={lists.s2}
                    subtitle={"S2 - Intelligence and Security"}
                  />
                </div>
              </Collapsible>
            </div>
            <div className="DepartmentContainer">
              <Collapsible
                trigger="Recruitment Oversight Office"
                triggerClassName="Title"
                triggerOpenedClassName="Title"
                open={true}
              >
                <div className="ROOStaff">
                  <MilpacParse
                    milpacArray={milpacArray}
                    billetIDs={lists.rooCommand}
                    subtitle={"Recruitment Oversight Command"}
                  />
                </div>
                <div className="RRD">
                  <MilpacParse
                    milpacArray={milpacArray}
                    billetIDs={lists.rrd}
                    subtitle={"Regimental Recruiting Department"}
                  />
                </div>
                <div className="RTC">
                  <MilpacParse
                    milpacArray={milpacArray}
                    billetIDs={lists.rtc}
                    subtitle={"Recruit Training Command"}
                  />
                </div>
                <div className="S5">
                  <MilpacParse
                    milpacArray={milpacArray}
                    billetIDs={lists.s5}
                    subtitle={"S5 - Public Relations"}
                  />
                </div>
              </Collapsible>
            </div>
            <div className="DepartmentContainer">
              <Collapsible
                trigger="Support Departments"
                triggerClassName="Title"
                triggerOpenedClassName="Title"
                open={true}
              >
                <div className="SPD">
                  <MilpacParse
                    milpacArray={milpacArray}
                    billetIDs={lists.spd}
                    subtitle={"Special Projects Division"}
                  />
                </div>
                <div className="S3">
                  <MilpacParse
                    milpacArray={milpacArray}
                    billetIDs={lists.s3}
                    subtitle={"S3 - Operations"}
                  />
                </div>
                <div className="S7">
                  <MilpacParse
                    milpacArray={milpacArray}
                    billetIDs={lists.s7}
                    subtitle={"S7 - Training"}
                  />
                </div>
                <div className="LD">
                  <MilpacParse
                    milpacArray={milpacArray}
                    billetIDs={lists.ld}
                    subtitle={"Leadership Development"}
                  />
                </div>
              </Collapsible>
            </div>
            <div className="DepartmentContainer">
              <Collapsible
                trigger="Statistics"
                triggerClassName="Title"
                triggerOpenedClassName="Title"
                open={true}
              >
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
              </Collapsible>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default MilpacRequest;

import React, { useEffect, useState } from "react";
import "./App.css";
import Collapsible from "react-collapsible";
import lists from "./modules/Generic/BilletBank";
import ErrorMessage from "./errorMessage";
import Statistics from "./modules/Generic/Statistics";
import CombinedFunction from "./modules/Generic/CombinedFunction";
import Logo from "./style/themes/7cav/logo";

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
                    <Logo
                      className="p-nav-svg"
                      alt="ADR Logo"
                      title="Return to the main website"
                      width="17em"
                      height="3em"
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
            {/*
            <CombinedFunction
              billetBankObject={lists.billetBankObject.regi.positionIds}
              collapsibleTitle={lists.billetBankObject.regi.collapsibleTitle}
              headerTitles={lists.billetBankObject.regi.positionTitles}
              milpacArray={milpacArray}
              usePrimaryOnly={lists.billetBankObject.regi.isPrimaryOnly}
            />
            */}
            <CombinedFunction
              billetBankObject={lists.billetBankObject.oneSeven.positionIds}
              collapsibleTitle={lists.billetBankObject.oneSeven.collapsibleTitle}
              headerTitles={lists.billetBankObject.oneSeven.positionTitles}
              milpacArray={milpacArray}
              usePrimaryOnly={lists.billetBankObject.oneSeven.isPrimaryOnly}
            />
            {/*
            <CombinedFunction
              billetBankObject={lists.billetBankObject.twoSeven.positionIds}
              collapsibleTitle={lists.billetBankObject.twoSeven.collapsibleTitle}
              headerTitles={lists.billetBankObject.twoSeven.positionTitles}
              milpacArray={milpacArray}
              usePrimaryOnly={lists.billetBankObject.twoSeven.isPrimaryOnly}
            />
            <CombinedFunction
              billetBankObject={lists.billetBankObject.acd.positionIds}
              collapsibleTitle={lists.billetBankObject.acd.collapsibleTitle}
              headerTitles={lists.billetBankObject.acd.positionTitles}
              milpacArray={milpacArray}
            />
            <CombinedFunction
              billetBankObject={lists.billetBankObject.imo.positionIds}
              collapsibleTitle={lists.billetBankObject.imo.collapsibleTitle}
              headerTitles={lists.billetBankObject.imo.positionTitles}
              milpacArray={milpacArray}
            />
            <CombinedFunction
              billetBankObject={lists.billetBankObject.secOps.positionIds}
              collapsibleTitle={lists.billetBankObject.secOps.collapsibleTitle}
              headerTitles={lists.billetBankObject.secOps.positionTitles}
              milpacArray={milpacArray}
            />
            <CombinedFunction
              billetBankObject={lists.billetBankObject.roo.positionIds}
              collapsibleTitle={lists.billetBankObject.roo.collapsibleTitle}
              headerTitles={lists.billetBankObject.roo.positionTitles}
              milpacArray={milpacArray}
            />
            <CombinedFunction
              billetBankObject={
                lists.billetBankObject.supportDepartments.positionIds
              }
              collapsibleTitle={lists.billetBankObject.supportDepartments.collapsibleTitle}
              headerTitles={
                lists.billetBankObject.supportDepartments.positionTitles
              }
              milpacArray={milpacArray}
            />
            */}
            <div className="DepartmentContainer">
              {/*
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
              */}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default MilpacRequest;

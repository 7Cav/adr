import React, { useEffect, useState } from "react";
import lists from "../modules/Generic/BilletBank"
import ErrorMessage from "../errorMessage";
import "./Rosterstatistics.css";
import Statistics from '../modules/Generic/Statistics'

const CLIENT_TOKEN = process.env.REACT_APP_CLIENT_TOKEN;
const combatApiUrl = process.env.REACT_APP_COMBAT_API_URL;
const reserveApiUrl = process.env.REACT_APP_RESERVE_API_URL;
const cacheTimestampUrl = process.env.REACT_APP_CACHE_TIMESTAMP_URL;
const millisecondsToMinutes = (milliseconds) => {
  return Math.round(milliseconds / (1000 * 60));
};

const StatisticsPage = (props) => {
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

  // Change Page Title
  document.title = props.title

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
  };

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
      <div className="DepartmentContainer">
        <h4>Please note, the Statistics app is currently pending rewrite by S6. The values, while accurate, only apply to Active Duty Personell</h4>
      </div>
      {cacheTime && cacheTime.combat !== null && (
        <div className="DepartmentContainer">
          API return is: {cacheTime.combat} minutes old
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: clscript }} />
      {loading ? (
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
        </>
      )}
    </div>
  );
}

export default StatisticsPage;
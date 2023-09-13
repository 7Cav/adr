// This document utilizes Apex charts. If you plan on changing how the pie charts look, you can do it here. Apex charts docs can be found here: https://apexcharts.com/docs/

import React, { Component } from "react";
import Chart from "react-apexcharts";

class Statistics extends Component {
  constructor(props) {
    super(props);

    let useRegiLogic = props.useRegiLogic;
    let milpacArray = props.milpacArray;
    let billetIDs = props.billetIDs;
    let labelArray = props.labelArray;
    let piechartData = [];
    let combinedArray = Array(billetIDs.length)
      .fill()
      .map(() => []);
    let centerLabel = props.centerLabel;

    for (let milpacIdCombat in milpacArray[0].combat.profiles) {
      var primary = milpacArray[0].combat.profiles[milpacIdCombat].primary;

      for (let billetIdArray in billetIDs) {
        if (billetIDs[billetIdArray].includes(primary.positionId)) {
          combinedArray[billetIdArray].push(primary.positionTitle);
        }
      }
    }

    combinedArray.forEach((subArray) => {
      piechartData.push(subArray.length);
    });

    if (useRegiLogic !== true) {
      this.state = {
        options: {
          labels: labelArray,
          legend: {
            show: false,
          },
          dataLabels: {
            enabled: false,
          },
          tooltip: {
            enabled: false,
          },
          stroke: {
            curve: ["smooth", "monotoneCubic"],
            colors: ["#222222"],
            width: 1.5,
          },
          colors: ["#109640", "#b61217", "#2a487c", "#ebc729", "#e68c08"],
          plotOptions: {
            pie: {
              donut: {
                size: "85%",
                background: "transparent",
                labels: {
                  fontFamily: "Segoe UI",
                  show: true,
                  value: {
                    show: true,
                    fontFamily: "Segoe UI",
                  },
                  name: {
                    fontFamily: "Segoe UI",
                  },
                  value: {
                    fontFamily: "Segoe UI",
                    fontWeight: "bold",
                    color: "#a1a1a1",
                  },
                  total: {
                    color: "#f1f1f1",
                    show: true,
                    showAlways: false,
                    label: centerLabel,
                    fontFamily: "Segoe UI",
                    fontWeight: "bold",
                  },
                },
              },
            },
          },
        },
        series: piechartData,
      };
    } else if (useRegiLogic === true) {
      this.state = {
        options: {
          labels: labelArray,
          legend: {
            show: false,
          },
          dataLabels: {
            enabled: false,
          },
          tooltip: {
            enabled: false,
          },
          stroke: {
            curve: ["smooth", "monotoneCubic"],
            colors: ["#222222"],
            width: 1.5,
          },
          colors: [
            "#109640",
            "#b61217",
            "#b61217",
            "#b61217",
            "#b61217",
            "#2a487c",
            "#2a487c",
            "#2a487c",
            "#2a487c",
            "#ebc729",
            "#ebc729",
            "#ebc729",
            "#ebc729",
            "#ebc729",
          ],
          plotOptions: {
            pie: {
              donut: {
                size: "85%",
                background: "transparent",
                labels: {
                  fontFamily: "Segoe UI",
                  show: true,
                  value: {
                    show: true,
                    fontFamily: "Segoe UI",
                  },
                  name: {
                    fontFamily: "Segoe UI",
                  },
                  value: {
                    fontFamily: "Segoe UI",
                    fontWeight: "bold",
                    color: "#a1a1a1",
                  },
                  total: {
                    color: "#f1f1f1",
                    show: true,
                    showAlways: false,
                    label: "Total Active Duty",
                    fontFamily: "Segoe UI",
                    fontWeight: "bold",
                  },
                },
              },
            },
          },
        },
        series: piechartData,
      };
    }
  }

  render() {
    return (
      <div className="donut">
        <Chart
          options={this.state.options}
          series={this.state.series}
          type="donut"
          width="65%"
        />
      </div>
    );
  }
}

export default Statistics;

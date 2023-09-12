import React, { Component } from "react";
import Chart from "react-apexcharts";

class Statistics extends Component {
  constructor(props) {
    super(props);

    let milpacArray = props.milpacArray;
    let billetIDs = props.billetIDs;
    let labelArray = props.labelArray;
    let piechartData = [];
    let combinedArray = Array(billetIDs.length)
      .fill()
      .map(() => []);

    console.log(billetIDs);
    console.log(milpacArray);

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

    console.log(combinedArray);

    this.state = {
      options: {
        labels: labelArray,
        legend: {
          show: true,
        },
        dataLabels: {
          enabled: false,
        },
        tooltip: {
          enabled: false,
        },
        plotOptions: {
          pie: {
            donut: {
              size: "65%",
              background: "transparent",
              labels: {
                show: true,
                value: {
                  show: true,
                },
                total: {
                  show: true,
                  showAlways: false,
                  label: "Total",
                },
              },
            },
          },
        },
      },
      series: piechartData,
    };
  }

  render() {
    return (
      <div className="donut">
        <Chart
          options={this.state.options}
          series={this.state.series}
          type="donut"
          width="380"
        />
      </div>
    );
  }
}

export default Statistics;

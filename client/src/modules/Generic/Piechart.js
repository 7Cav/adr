import React, { Component } from 'react';
import Chart from 'react-apexcharts'

class Donut extends Component {

  constructor(props) {
    super(props);

    //for the love of god, this is terrible. If you are reading this, DONT DO THIS! this is so unbelievibly bad. This will be reworked once the duplicated pieChartArray items are fixed 

    var piechartObject = props.piechartObject;
    var useSelector0 = props.useSelector0
    var useSelector2 = props.useSelector2
    var useSelector4 = props.useSelector4
    var useSelector6 = props.useSelector6
    var useSelector8 = props.useSelector8
    var finalInput = [];
    
    if (useSelector0 !== false) {
      finalInput.push(piechartObject[0])
    }if (useSelector2 !== false) {
      finalInput.push(piechartObject[2])
    }if (useSelector4 !== false) {
      finalInput.push(piechartObject[4])
    }if (useSelector6 !== false) {
      finalInput.push(piechartObject[6])
    }if (useSelector8 !== false) {
      finalInput.push(piechartObject[8])
    };

    console.log (finalInput);

    this.state = {
      options: {},
      series: finalInput,
      labels: ['A', 'B', 'C', 'D', 'E']
    }
  }

  render() {

    return (
      <div className="donut">
        <Chart options={this.state.options} series={this.state.series} type="donut" width="380" />
      </div>
    );
  }
}

export default Donut;
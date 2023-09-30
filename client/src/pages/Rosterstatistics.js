import React, { useEffect } from "react";

const Statistics = (props) => {

  // Change Page Title
  useEffect(() => document.title = props.title, [])

  return <h1>Pending Rework!</h1>;
  };
  
  export default Statistics;
  
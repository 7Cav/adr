"use client";
import React, { useRef, useEffect } from "react";

const Canvas = (props) => {
  const canvasRef = useRef(null);

  const data = props.data;

  console.log(data);

  let rankOrder;
  let rankGrade;

  if (data[0].rank == "2LT") {
    rankOrder = "Officer";
    rankGrade = "O1";
  }

  useEffect(() => {
    const uniformBase = new Image();
    uniformBase.src = "/skunkworks/uniformBase/uniformBase.png";

    const uniformLapel = new Image();
    uniformLapel.src = "/skunkworks/uniformBase/uniformRightLapel.png";

    const uniformEpaulette = new Image();
    uniformEpaulette.src = `skunkworks/uniformOfficer/officerEpaulettes/${rankGrade}.png`;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.fillStyle = "#000000";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    uniformBase.onload = () => {
      context.drawImage(uniformBase, 0, 0);
      context.drawImage(uniformLapel, 0, 0);
      context.drawImage(uniformEpaulette, 0, 0);
    };
  }, []);

  return <canvas ref={canvasRef} {...props} width={837} height={1025} />;
};

export default Canvas;

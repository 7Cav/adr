"use client";
import React, { useRef, useEffect } from "react";

const Canvas = (props) => {
  const canvasRef = useRef(null);

  const data = props.data;

  console.log(data[1]);

  useEffect(() => {
    const uniformBase = new Image();
    uniformBase.src = "/skunkworks/uniformBase/uniformBase.png";

    const uniformLapel = new Image();
    uniformLapel.src = "/skunkworks/uniformBase/uniformRightLapel.png";

    const uniformEpaulette = new Image();
    uniformEpaulette.src = `skunkworks/uniformOfficer/officerEpaulettes/${data[0].rankGrade}.png`;

    const ribbonSprites = new Image();
    ribbonSprites.src =
      "skunkworks/uniformRibbons/ribbons/ribbonSpriteSheetAlt.png";

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.fillStyle = "#000000";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    uniformBase.onload = () => {
      context.drawImage(uniformBase, 0, 0);
      for (let i = 1; i < 2; i++) {
        placeRibbon(data[i], ribbonSprites);
      }
      context.drawImage(uniformLapel, 0, 0);
      context.drawImage(uniformEpaulette, 0, 0);
    };

    function placeRibbon(data, ribbonSprites) {
      const ribbonWidth = 43;
      const ribbonHeight = 14;

      const ribbonSelection = data.awardPriority + 1;

      return context.drawImage(
        ribbonSprites,
        0,
        ribbonSelection * ribbonHeight,
        ribbonWidth,
        ribbonHeight,
        524,
        245,
        ribbonWidth,
        ribbonHeight
      );
    }
  }, []);

  return <canvas ref={canvasRef} {...props} width={837} height={1025} />;
};

export default Canvas;

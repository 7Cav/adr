"use client";
import React, { useRef, useEffect } from "react";

const Canvas = (props) => {
  const canvasRef = useRef(null);

  const data = props.data;

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
      for (let i = 1; i < 16; i++) {
        placeRibbon(data[i], ribbonSprites, data[0].coordArray[i - 1]);
      }
      context.drawImage(uniformLapel, 0, 0);
      context.drawImage(uniformEpaulette, 0, 0);
    };

    function placeRibbon(data, ribbonSprites, coordData) {
      console.log(coordData);

      const ribbonWidth = 43;
      const ribbonHeight = 14;

      const desiredX = coordData.dx;
      const desiredY = coordData.dy;

      const ribbonSelection = data.awardDetails.awardPriority;

      if (
        data.count != 0 ||
        data.awardDetails.awardAttachmentType == "oakClustersValor"
      ) {
        const attachmentType = data.awardDetails.awardAttachmentType;
        const attachmentCount = data.count.toString();

        const ribbonAttachment = new Image();
        ribbonAttachment.src = `skunkworks/uniformRibbons/attachments/${attachmentType}/${attachmentCount}.png`;

        ribbonAttachment.onload = () => {
          context.drawImage(
            ribbonSprites,
            0,
            ribbonSelection * ribbonHeight,
            ribbonWidth,
            ribbonHeight,
            desiredX,
            desiredY,
            ribbonWidth,
            ribbonHeight
          );

          context.drawImage(
            ribbonAttachment,
            0,
            0,
            ribbonWidth,
            ribbonHeight,
            desiredX,
            desiredY,
            ribbonWidth,
            ribbonHeight
          );
        };
      } else {
        context.drawImage(
          ribbonSprites,
          0,
          ribbonSelection * ribbonHeight,
          ribbonWidth,
          ribbonHeight,
          desiredX,
          desiredY,
          ribbonWidth,
          ribbonHeight
        );
      }
    }
  }, []);

  return <canvas ref={canvasRef} {...props} width={837} height={1025} />;
};

export default Canvas;

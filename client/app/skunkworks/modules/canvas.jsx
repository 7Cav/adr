"use client";
import { useState, useRef, useEffect } from "react";
import {
  Award,
  Ribbon,
  Medal,
  MedalWithValor,
  MedalTiered,
  RibbonDonationLogic,
} from "./AwardClasses";

function Canvas(props) {
  const canvasRef = useRef(null);
  const data = props.data;

  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setImages({});
    const loadImage = (src, key) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ key, image: img });
        img.onerror = () =>
          reject({ key, error: new Error(`Failed to load image: ${src}`) });
        img.src = src;
      });
    };

    let imagePromises = [
      loadImage("/skunkworks/uniformBase/uniformBase.png", "uniformBase"),
      loadImage(
        "/skunkworks/uniformBase/uniformRightLapel.png",
        "uniformLapel"
      ),
      loadImage(
        `skunkworks/uniformEpaulettes/${data[0].rankGrade}.png`,
        "uniformEpaulette"
      ),
      loadImage(
        "skunkworks/uniformRibbons/ribbons/ribbonSpriteSheet.png",
        "ribbonSprites"
      ),
      loadImage(
        "skunkworks/uniformRibbons/ribbons/unitCitationSprite.png",
        "citationSprites"
      ),
      loadImage(
        "skunkworks/uniformMedals/medalSpriteSheet.png",
        "medalSprites"
      ),
    ];

    if (data[4] != null) {
      imagePromises.push(
        loadImage(
          `skunkworks/uniformBadges/combatBadges/${data[4].imageNum}.png`,
          "uniformCombatBadge"
        )
      );
    }

    Promise.all(imagePromises)
      .then((loadedImages) => {
        const imagesMap = loadedImages.reduce((acc, { key, image }) => {
          acc[key] = image;
          return acc;
        }, {});
        setImages(imagesMap);
        setLoading(false);
      })
      .catch((errors) => {
        console.error("Error loading images:", errors);
        setLoading(false); // Important: Set loading to false even on error
      });
  }, [data]);

  const placeRibbon = (data, ribbonSprites, coordData, context) => {
    return new Promise((resolve) => {
      const ribbonWidth = 43;
      const ribbonHeight = 14;
      const desiredX = coordData.dx;
      const desiredY = coordData.dy;
      const ribbonSelection = data.awardPriority;

      if (data.awardPriority == 0) {
        resolve();
        return;
      }

      const drawRibbon = () => {
        // Function to draw the base ribbon
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
      };

      if (
        data.ribbonDisplayedAttachmentCount !== 0 ||
        (data instanceof MedalWithValor && data.hasValorDevice == true)
      ) {
        const attachmentType = data.ribbonAttachmentType;
        const attachmentCount = data.ribbonDisplayedAttachmentCount.toString();
        const ribbonAttachment = new Image();

        ribbonAttachment.onload = () => {
          drawRibbon(); //Draw the ribbon first
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
          resolve(); // Resolve AFTER drawing BOTH ribbon and attachment
        };
        ribbonAttachment.onerror = () => {
          console.error("Error loading ribbon attachment");
          drawRibbon(); //Draw the ribbon even if attachment fails
          resolve();
        };
        ribbonAttachment.src = `skunkworks/uniformRibbons/attachments/${attachmentType}/${attachmentCount}.png`;
      } else {
        drawRibbon(); //Draw the ribbon if no attachment
        resolve(); // Resolve immediately if no attachment
      }
    });
  };

  const placeCitation = (data, ribbonSprites, coordData, context) => {
    return new Promise((resolve) => {
      const ribbonWidth = 43;
      const ribbonHeight = 17;
      const desiredX = coordData.dx;
      const desiredY = coordData.dy;
      const ribbonSelection = data.awardPriority;

      const drawRibbon = () => {
        // Function to draw the base ribbon
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
      };

      if (data.ribbonDisplayedAttachmentCount !== 0) {
        const attachmentType = data.ribbonAttachmentType;
        const attachmentCount = data.ribbonDisplayedAttachmentCount.toString();
        const ribbonAttachment = new Image();

        ribbonAttachment.onload = () => {
          drawRibbon(); //Draw the ribbon first
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
          resolve(); // Resolve AFTER drawing BOTH ribbon and attachment
        };
        ribbonAttachment.onerror = () => {
          console.error("Error loading ribbon attachment");
          drawRibbon(); //Draw the ribbon even if attachment fails
          resolve();
        };
        ribbonAttachment.src = `skunkworks/uniformRibbons/attachments/${attachmentType}/${attachmentCount}.png`;
      } else {
        drawRibbon(); //Draw the ribbon if no attachment
        resolve(); // Resolve immediately if no attachment
      }
    });
  };

  const placeInfantryBadge = (image, coordData, context) => {
    return new Promise((resolve) => {
      if (image == undefined) {
        resolve();
        return;
      }

      const desiredX = coordData.dx;
      const desiredY = coordData.dy;

      const drawBadge = () => {
        // Function to draw the base ribbon
        context.drawImage(image, desiredX, desiredY);
      };
      drawBadge();
      resolve();
    });
  };

  const placeMedal = (data, medalSprites, context, xCoord, yCoord) => {
    return new Promise((resolve) => {
      const ribbonWidth = 70;
      const ribbonHeight = 120;
      const ribbonSelection = data.medalPriority;

      const drawMedal = () => {
        // Function to draw the base ribbon
        context.drawImage(
          medalSprites,
          0,
          (ribbonSelection - 2) * ribbonHeight,
          ribbonWidth,
          ribbonHeight,
          xCoord,
          yCoord,
          ribbonWidth,
          ribbonHeight
        );
      };

      if (data.ribbonDisplayedAttachmentCount !== 0) {
        const attachmentType = data.ribbonAttachmentType;
        const attachmentCount = data.ribbonDisplayedAttachmentCount.toString();
        const ribbonAttachment = new Image();

        ribbonAttachment.onload = () => {
          drawMedal(); //Draw the ribbon first
          context.drawImage(
            ribbonAttachment,
            0,
            0,
            ribbonWidth,
            ribbonHeight,
            xCoord + 8,
            yCoord + 5,
            ribbonWidth,
            ribbonHeight
          );
          resolve(); // Resolve AFTER drawing BOTH ribbon and attachment
        };
        ribbonAttachment.onerror = () => {
          console.error("Error loading ribbon attachment");
          drawMedal(); //Draw the ribbon even if attachment fails
          resolve();
        };
        ribbonAttachment.src = `skunkworks/uniformRibbons/attachments/${attachmentType}/${attachmentCount}.png`;
      } else {
        drawMedal(); //Draw the ribbon if no attachment
        resolve(); // Resolve immediately if no attachment
      }
    });
  };

  const drawSpecialMedal = (data, context) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        console.log(img.src, data.awardPriority, context);
        context.drawImage(img, 0, 0);
        resolve(); // Resolve AFTER loading and drawing
      };
      img.onerror = () => {
        console.error(
          `Error loading special award image: skunkworks/uniformSpecialMedals/${data.awardPriority}.png`
        );
        resolve(); // Resolve even on error
      };
      img.src = `skunkworks/uniformSpecialMedals/${data.awardPriority}.png`;
    });
  };

  const drawGeneric = (image, context) => {
    return new Promise((resolve) => {
      context.drawImage(image, 0, 0);
      resolve();
    });
  };

  useEffect(() => {
    if (
      !loading &&
      images.uniformBase &&
      images.uniformLapel &&
      images.uniformEpaulette &&
      images.ribbonSprites &&
      images.citationSprites &&
      images.medalSprites
    ) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

      const drawLayers = async () => {
        context.drawImage(images.uniformBase, 0, 0);

        // First, draw all ribbons, unit citations and the infantry badge.
        await Promise.all([
          ...data[1]
            .slice(0, data[0].ribbonMedalCount)
            .map((ribbonData, index) =>
              placeRibbon(
                ribbonData,
                images.ribbonSprites,
                data[0].ribbonCoordArray[index],
                context
              )
            ),
          ...data[2]
            .slice(0, data[0].unitCitationCount)
            .map((ribbonData, index) =>
              placeCitation(
                ribbonData,
                images.citationSprites,
                data[0].unitCitationCoordArray[index],
                context
              )
            ),
          placeInfantryBadge(
            // Include the infantry badge promise here
            images.uniformCombatBadge,
            data[0].combatBadgeCoords,
            context
          ),
        ]);

        //Draw the lapel and the epaulette
        await Promise.all([
          drawGeneric(images.uniformLapel, context),
          drawGeneric(images.uniformEpaulette, context),
        ]);

        //Calculate medal coords

        const medalCoords = [];
        const canvasWidth = canvas.width;
        const borderWidth = 25;
        const widthInner = canvasWidth - 2 * borderWidth;
        const offsetX = borderWidth;
        const offsetY = 745;
        const medalWidth = 70;
        const medalHeight = 120;
        let medalsPerRow = 12;
        const medalSpacing = -5;
        let x = 0;
        let y = 0;
        let indexOffset = 0;
        let secondRowOffset = medalWidth / 2 + medalSpacing / 2;
        let rowSpacing = medalHeight; // Initial row spacing

        data[3].forEach((medalData, index) => {
          if (medalData.awardPriority == 0 || medalData.awardPriority == 1) {
            medalCoords.push({ x: 0, y: 0 });
            indexOffset++;
            return;
          }

          if (data[3].length > 25) {
            rowSpacing = 70;
          }

          let currentIndex = index - indexOffset;
          x = currentIndex % medalsPerRow;
          y = Math.floor(currentIndex / medalsPerRow);

          // Apply the offset to x for the second row
          if (y === 1 && data[3].length - indexOffset > 25) {
            x = (currentIndex - medalsPerRow) % (medalsPerRow - 1);
          }
          // Calculate x for the third row
          if (y === 2) {
            x =
              (currentIndex - medalsPerRow - (medalsPerRow - 1)) % medalsPerRow;
          }

          let _offsetX = Math.floor(
            offsetX + 4 + x * (medalWidth + medalSpacing)
          );
          let _offsetY = offsetY + y * rowSpacing;

          if (y % 2 !== 0 && data[3].length - indexOffset > 24) {
            _offsetX += secondRowOffset;
          }

          if (y == 2) {
            _offsetX += medalWidth;
          }

          console.log(currentIndex == 23, data[3].length - indexOffset >= 25);

          if (currentIndex == 23 && data[3].length - indexOffset >= 25) {
            // Force x-coordinate to be the same as entry 0
            _offsetX = medalCoords[1 + indexOffset].x + 5;
            _offsetY = 885;
          }

          medalCoords.push({ x: _offsetX, y: _offsetY });
        });

        // Separate medals into rows
        const row1Medals = [];
        const row2Medals = [];
        const row3Medals = [];
        const specialMedals = [];
        const medalCoordsRow1 = [];
        const medalCoordsRow2 = [];
        const medalCoordsRow3 = [];

        data[3].forEach((medal, index) => {
          if (medal.awardPriority == 0 || medal.awardPriority == 1) {
            specialMedals.push(medal);
            return;
          }
          const medalY = medalCoords[index].y;

          if (medalY === offsetY) {
            row1Medals.push(medal);
            medalCoordsRow1.push(medalCoords[index]);
          } else if (medalY === offsetY + rowSpacing) {
            row2Medals.push(medal);
            medalCoordsRow2.push(medalCoords[index]);
          } else {
            row3Medals.push(medal);
            medalCoordsRow3.push(medalCoords[index]);
          }
        });
        // Draw medals in reverse row order (row 3, then 2, then 1)
        await Promise.all([
          ...specialMedals.map((medalData) =>
            drawSpecialMedal(medalData, context)
          ),
        ]);
        await Promise.all([
          ...row3Medals.map((medalData, index) =>
            placeMedal(
              medalData,
              images.medalSprites,
              context,
              medalCoordsRow3[index].x,
              medalCoordsRow3[index].y
            )
          ),
        ]);
        await Promise.all([
          ...row2Medals.map((medalData, index) =>
            placeMedal(
              medalData,
              images.medalSprites,
              context,
              medalCoordsRow2[index].x,
              medalCoordsRow2[index].y
            )
          ),
        ]);

        await Promise.all([
          ...row1Medals.map((medalData, index) =>
            placeMedal(
              medalData,
              images.medalSprites,
              context,
              medalCoordsRow1[index].x,
              medalCoordsRow1[index].y
            )
          ),
        ]);

        canvas.toBlob(function (blob) {
          canvasDownload.href = URL.createObjectURL(blob);
        });
      };
      drawLayers();
    }
  }, [loading, images, data]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="canvasreturn">
      <a id="canvasDownload" href="#" download>
        Download Image
      </a>
      <div>
        Note: This tool is in early development and may not accurately follow
        established Standard Operating Procedures.
        <br /> Use at your own risk. Please submit all feedback/bugs to the S1
        Uniforms Lead.
      </div>
      <canvas ref={canvasRef} {...props} width={837} height={1025} />
    </div>
  );
}

export default Canvas;

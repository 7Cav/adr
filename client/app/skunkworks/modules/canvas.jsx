"use client";
import { useState, useRef, useEffect } from "react";

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

    const imagePromises = [
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
    ];

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
      const ribbonSelection = data.awardDetails.awardPriority;

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
        data.count !== 0 ||
        data.awardDetails.awardAttachmentType == "oakClustersValor"
      ) {
        const attachmentType = data.awardDetails.awardAttachmentType;
        const attachmentCount = data.count.toString();
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

  useEffect(() => {
    if (
      !loading &&
      images.uniformBase &&
      images.uniformLapel &&
      images.uniformEpaulette &&
      images.ribbonSprites
    ) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

      const drawLayers = async () => {
        context.drawImage(images.uniformBase, 0, 0);

        // Use Promise.all to wait for ALL ribbons to load
        await Promise.all(
          data
            .slice(1, data[0].ribbonMedalCount + 1)
            .map((ribbonData, index) =>
              placeRibbon(
                ribbonData,
                images.ribbonSprites,
                data[0].coordArray[index],
                context
              )
            )
        );

        context.drawImage(images.uniformLapel, 0, 0);
        context.drawImage(images.uniformEpaulette, 0, 0);

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
        <br /> Use at your own risk. Please submit all feedback/bugs to S6 via
        ticket.
      </div>
      <canvas ref={canvasRef} {...props} width={837} height={1025} />
    </div>
  );
}

export default Canvas;

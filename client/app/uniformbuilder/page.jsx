"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import GetCanvasObject from "./modules/getCanvasObject";
import CavColor from "../theme/cavColor";
import UniformText from "../theme/uniformBuilderText";
import Canvas from "./modules/canvas";
import "./page.css";
import Loading from "../adr/loading";

export default function Skunkworks() {
  const [userName, setUserName] = useState("");
  const [canvasData, setCanvasData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittedUserName, setSubmittedUserName] = useState(""); // Track submitted username

  const handleInputChange = (event) => {
    setUserName(event.target.value);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      setSubmittedUserName(userName); // Update submitted username on Enter
    }
  };

  useEffect(() => {
    if (submittedUserName) {
      // Use submittedUserName in useEffect
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          console.log(submittedUserName);
          const data = await GetCanvasObject(submittedUserName);
          setCanvasData(data);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      setCanvasData(null);
    }
  }, [submittedUserName]); // Effect runs when submittedUserName changes

  return (
    <div className="masterboxbuilder">
      <div className="logoboxbuilder">
        <Link href={"/"}>
          <div className="logobuilder">
            <CavColor width="3em" height="3em" />
          </div>
        </Link>
        <div className="textboxbuilder">
          <Link href={"/"}>
            <UniformText width="16em" height="3em" />
          </Link>
        </div>
      </div>
      <div className="inputboxbuilder">
        <input
          type="text"
          value={userName}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown} // Add key down handler
          placeholder="Please enter a 7Cav Username e.g Doe.J"
        />
        {
          //!submittedUserName && (
          //<div>Please enter a username and press Enter.</div>
          //)
        }
      </div>
      {loading && <Loading />}
      {error && <div>Error: {error.message}</div>}
      {canvasData && !loading && !error && (
        <div className="canvasboxbuilder">
          <Canvas data={canvasData} />
        </div>
      )}
    </div>
  );
}

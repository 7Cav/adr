"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import GetCanvasObject from "./modules/getCanvasObject";
import SkunkworksLogo from "../theme/skunkworksLogo";
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
    <div className="masterbox">
      <div className="logobox">
        <div className="logo">
          <SkunkworksLogo width="3em" height="3em" />
        </div>
        <div className="textbox">
          7th Cavalry Skunkworks <br /> Ribbon Builder
        </div>
      </div>
      <div className="inputbox">
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
        <div className="canvasbox">
          <Canvas data={canvasData} />
        </div>
      )}
    </div>
  );
}

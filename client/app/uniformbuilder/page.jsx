"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import GetCanvasObject from "./modules/getCanvasObject";
import CavColor from "../theme/cavColor";
import UniformText from "../theme/uniformBuilderText";
import Canvas from "./modules/canvas";
import "./page.css";
import Loading from "../adr/loading";
import searchForUser from "../reusableModules/searchForUser";

export default function Skunkworks() {
  const [userName, setUserName] = useState("");
  const [canvasData, setCanvasData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittedUserName, setSubmittedUserName] = useState(""); // Track submitted username
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  const handleInputChange = (event) => {
    setUserName(event.target.value);
  };

  const handleInputKeyDown = (event) => {
    if (suggestions.length > 0) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (
        (event.key === "Enter" || event.key === "ArrowRight") &&
        activeIndex !== -1
      ) {
        event.preventDefault();
        const selectedName = suggestions[activeIndex];
        if (selectedName !== "...") {
          selectUser(selectedName);
        }
      } else if (event.key === "Enter") {
        setSubmittedUserName(userName);
        setSuggestions([]);
      }
    } else if (event.key === "Enter") {
      setSubmittedUserName(userName);
    }
  };

  const suggestionClicked = (name) => {
    setSuggestions([]);
    selectUser(name);
  };

  const selectUser = (name) => {
    setSuggestions([]);
    setUserName(name);
    setSubmittedUserName(name);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (userName.length >= 3 && userName !== submittedUserName) {
        try {
          const data = await searchForUser(userName);
          setSuggestions(data);
        } catch (err) {
          console.error("Suggestion fetch failed", err);
        }
      } else {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [userName]);

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
  }, [submittedUserName]);

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
        <div className="inputboxflex">
          <input
            type="text"
            value={userName}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="Please enter a 7Cav Username e.g Doe.J"
          />
          {suggestions.length > 0 && (
            <div className="suggestions-container">
              {suggestions.map((name, index) => (
                <div
                  key={index}
                  className={`${
                    name === "..." ? "suggestion-more" : "suggestion-item"
                  } ${index === activeIndex ? "active" : ""}`}
                  style={{ animationDelay: `${index * 0.03}s` }}
                  onClick={() => name !== "..." && suggestionClicked(name)}
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {loading && <Loading />}
      {error && (
        <div className="canvasboxbuilder">
          <div className="errorbox">
            <h3 className="errorheader">Network Error!</h3>
            {error.message}
          </div>
        </div>
      )}
      {canvasData && !loading && !error && (
        <div className="canvasboxbuilder">
          <Canvas data={canvasData} />
        </div>
      )}
    </div>
  );
}

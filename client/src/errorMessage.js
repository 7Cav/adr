import React, { useState, useEffect } from "react";
import "./errorMessage.css";

const ErrorMessage = ({ message }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (message) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return message ? (
    <div className={`error-message ${animate ? "shake" : ""}`}>
      <span className="error-text">
        <div className="center-text">
          <i className="error-icon">⚠️</i>
          {message}
        </div>
        <div className="center-text">
          <p>Please try again or contact S6 if it persists</p>
        </div>
      </span>
    </div>
  ) : null;
};

export default ErrorMessage;

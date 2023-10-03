import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

import Layout from "./pages/Layout.js";
import CavApps from "./pages/Cavapps.js";
import ActiveDutyRoster from "./pages/Activedutyroster.js";
import Statisticspage from "./pages/Rosterstatistics.js";
import NoPage from "./pages/NoPage.js";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CavApps title="7th Cavalry Apps" />} />
          <Route
            path="adr"
            element={<ActiveDutyRoster title="7th Cavalry ADR" />}
          />
          <Route
            path="rosterstatistics"
            element={<Statisticspage title="7th Cavalry Statistics" />}
          />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

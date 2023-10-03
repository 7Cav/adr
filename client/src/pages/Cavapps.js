import { Link } from "react-router-dom";
import Logo from "../style/themes/7cav/appsLogo";
import "./CavApps.css";

function CavApps(props) {
  // Change Page Title
  document.title = props.title;

  return (
    <div className="masterbox">
      <div className="logobox">
        <Logo width="50em" height="15em" />
      </div>
      <div className="buttonbox">
        <Link to="/adr">
          <button className="button">Active Duty Roster</button>
        </Link>
        <Link to="/rosterstatistics">
          <button className="button">Roster Statistics</button>
        </Link>
      </div>
    </div>
  );
}

export default CavApps;

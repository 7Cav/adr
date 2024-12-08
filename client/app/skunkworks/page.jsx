import Link from "next/link";
import SkunkworksLogo from "../theme/skunkworksLogo";
import "./page.css";

export default function Skunkworks() {
  return (
    <div className="masterbox">
      <div className="logobox">
        <SkunkworksLogo width="30em" height="30em" />
      </div>
      <div className="textbox">Under Construction</div>
    </div>
  );
}

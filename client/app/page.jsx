import Link from "next/link";
import Logo from "./theme/appsLogo";
import "./page.css";

export default function Home() {
  return (
    <div className="masterbox">
      <div className="logobox">
        <Logo width="50em" height="15em" />
      </div>
      <div className="buttonbox">
        <Link href="/adr">
          <button className="button">Active Duty Roster</button>
        </Link>
        <Link href="/rosterstatistics">
          <button className="button">Roster Statistics</button>
        </Link>
        <Link href="/uniformbuilder">
          <button className="button">Uniform Builder</button>
        </Link>
      </div>
    </div>
  );
}

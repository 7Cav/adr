import { Suspense } from "react";
import Link from "next/link";
import Logo from "../theme/adrLogo";
import RosterHistoryClient from "./RosterHistoryClient";
import "../adr/page.css";
import "../globals.css";

export const metadata = {
  title: "Roster History",
};

export default function RosterHistoryPage() {
  return (
    <div className="MasterContainer">
      <div className="p-nav-primary">
        <div className="p-nav-wrapper">
          <nav className="p-nav">
            <div className="p-nav-inner">
              <div className="p-nav-scroller">
                <div className="p-nav-logo">
                  <Link href="/">
                    <Logo
                      alt="ADR Logo"
                      title="Return to CavApps"
                      width="17em"
                      height="3em"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Suspense fallback={null}>
          <RosterHistoryClient />
        </Suspense>
      </div>
    </div>
  );
}

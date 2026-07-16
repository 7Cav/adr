"use client";

import dynamic from "next/dynamic";

// ssr: false cause apex charts reaches for `window` at import time. Next 15+
// forbids ssr:false dynamic imports inside Server Components, so the boundary
// lives here in a Client Component and the server page renders this instead.
const Statistics = dynamic(() => import("./statistics"), { ssr: false });

export default Statistics;

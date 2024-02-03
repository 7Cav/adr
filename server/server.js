const middleware = require("./routes");
const express = require("express");
const compression = require("compression");
const app = express();
const cors = require("cors");
const port = 4000;
const { CLIENT_TOKEN } = require("./credentials/token");
const { cacheTime } = require("./controllers/cacheManager");

const corsOptions = {
  origin: function (origin, callback) {
    const allowlist = [
      "http://localhost:3000",
      "http://apps.7cav.us",
      "https://apps.7cav.us",
      "https://apps.7cav.us/",
    ];
    if (allowlist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// Token Checking Middleware
const checkToken = (req, res, next) => {
  const authToken = req.headers["authorization"];
  if (authToken === CLIENT_TOKEN) {
    next(); // proceed to the next middleware or route handler
  } else {
    res.status(403).send("Forbidden");
  }
};

app.use(compression());

app.use(
  cors({
    origin: corsOptions.origin,
  })
);
// Apply token checking middleware only to these routes
app.use("/roster", checkToken, middleware);
app.get("/", (req, res) => {
  res.send(
    "Server Test Page Loaded Successfully. Any issues? Submit a ticket to S6! Frontend is at https://adr.7cav.us/"
  );
});

app.get("/cache-timestamp", (req, res) => {
  res.json({ cacheTime });
});

app.listen(port, () => {
  console.log(`Roster Server listening on ${port}`);
});

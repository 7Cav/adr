const express = require("express");
const router = express.Router();
const cors = require("cors");
const cRequest = require("../controllers/cRequest");
const rRequest = require("../controllers/rRequest");
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

router.get("/combat", cRequest);
router.get("/reserves", rRequest);
module.exports = router;

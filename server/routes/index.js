const express = require("express");
const router = express.Router();
const cors = require("cors");
const cRequest = require("../controllers/cRequest");
const rRequest = require("../controllers/rRequest");
const iRequest = require("../controllers/iRequest");
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

router.get("/combat", cRequest);
router.get("/reserves", rRequest);
router.get("/individual", iRequest);
module.exports = router;

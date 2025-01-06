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
router.get("/individual", (req, res) => {
  const userName = req.query.username;
  if (!userName) {
    return res.status(400).send("Username is required");
  }
  iRequest(req, res, userName);
});
module.exports = router;

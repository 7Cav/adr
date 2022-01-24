const express = require("express");
const router = express.Router();
const cRequest = require("../controllers/cRequest");
const rRequest = require("../controllers/rRequest");

router.get("/combat", cRequest);
router.get("/reserves", rRequest);
module.exports = router;
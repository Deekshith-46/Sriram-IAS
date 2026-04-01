const express = require("express");
const router = express.Router();
const { getGS, getCSAT } = require("../controllers/resultController");

// GET /result/gs?phone=...
router.get("/gs", getGS);

// GET /result/csat?phone=...
router.get("/csat", getCSAT);

module.exports = router;

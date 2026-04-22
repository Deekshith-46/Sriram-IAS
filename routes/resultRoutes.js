const express = require("express");
const router = express.Router();
const { getGS, getCSAT, getAllResults, getResultsByCenter, getOnlineResults } = require("../controllers/resultController");

// GET /result/gs?phone=... (Single user result)
router.get("/gs", getGS);

// GET /result/csat?phone=... (Single user result)
router.get("/csat", getCSAT);

// GET /result/all (Complete data separated by sheets)
router.get("/all", getAllResults);

// GET /result/center?centre=... (Results by center)
router.get("/center", getResultsByCenter);

// GET /result/online (Online results for GS and CSAT)
router.get("/online", getOnlineResults);

module.exports = router;

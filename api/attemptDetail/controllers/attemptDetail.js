const express = require("express");
const router = express.Router();
const func = require("../function/attemptDetail");

router.route("/createAttemptDetail").post(async (req, res) => {
  try {
    let response = await func.createAttemptDetail(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getAttemptDetail").post(async (req, res) => {
  try {
    let response = await func.getAttemptDetail();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getAttemptDetailById").post(async (req, res) => {
  try {
    let response = await func.getAttemptDetailById(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;

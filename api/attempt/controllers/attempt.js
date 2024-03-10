const express = require("express");
const router = express.Router();
const func = require("../function/attempt");

router.route("/createAttempt").post(async (req, res) => {
  try {
    let response = await func.createAttempt(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getAttempt").post(async (req, res) => {
  try {
    let response = await func.getAttempt();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getAttemptById").post(async (req, res) => {
  try {
    let response = await func.getAttemptById(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;

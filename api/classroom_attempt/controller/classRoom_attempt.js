const express = require("express");
const router = express.Router();
const func = require("../function/classRoom_attempt");

router.route("/createClassroomAttempt").post(async (req, res) => {
  try {
    let response = await func.createClassroomAttempt(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getClassroomAttempt").post(async (req, res) => {
  try {
    let response = await func.getClassroomAttempt();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getClassroomAttemptById").post(async (req, res) => {
  try {
    let response = await func.getClassroomAttemptById(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;

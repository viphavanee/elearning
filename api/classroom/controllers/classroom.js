const express = require("express");
const router = express.Router();
const func = require("../function/classroom");

router.route("/createClassroom").post(async (req, res) => {
  try {
    let response = await func.createClassroom(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getClassroom").post(async (req, res) => {
  try {
    let response = await func.getClassroom();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getClassroomById").post(async (req, res) => {
  try {
    let response = await func.getClassroomById(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;

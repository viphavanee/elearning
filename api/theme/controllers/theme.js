const express = require("express");
const router = express.Router();
const func = require("../function/theme");

router.route("/createTheme").post(async (req, res) => {
  try {
    let response = await func.createTheme(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getTheme").post(async (req, res) => {
  try {
    let response = await func.getTheme();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getThemeById").post(async (req, res) => {
  try {
    let response = await func.getThemeById(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;

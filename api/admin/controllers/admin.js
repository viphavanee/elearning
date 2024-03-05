const express = require("express");
const router = express.Router();
const func = require("../function/admin");

router.route("/createAdmin").post(async (req, res) => {
  try {
    let response = await func.createAdmin(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getAdmin").post(async (req, res) => {
  try {
    let response = await func.getAdmin();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

router.route("/getAdminById").post(async (req, res) => {
    try {
      let response = await func.getAdminById(req.body);
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  });

module.exports = router;

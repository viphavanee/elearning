const express = require("express");
const router = express.Router();
const func = require("../function/user");

router.route("/createUser").post(async (req, res) => {
  try {
    let response = await func.createUser(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getUsers").post(async (req, res) => {
  try {
    let response = await func.getUsers();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getUserById").post(async (req, res) => {
  try {
    let response = await func.getUserById(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/updateUserById/:id").put(async (req, res) => {
  try {
    const id = req.params.id;
    const userData = req.body;
    let response = await func.updateUserById(id, userData);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;

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
router.route("/").get(async (req, res) => {
  try {
    let response = await func.getUsers();
    res.render("userList", { user: response.data });
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
    console.log(userData)
    console.log(id)
    let response = await func.updateUserById(id, userData);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.route("/delete/:id").get(async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      console.error("Invalid user ID:", userId);
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const softDeleteResult = await func.softDelete({ id: userId });

    if (softDeleteResult.status_code === "200") {
      res.render("softDeleteSuccess", { message: "Soft delete complete" });
      res.redirect('/user');
    } else {
      res.status(404).json({ error: "user not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

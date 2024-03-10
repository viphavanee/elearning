const express = require("express");
const router = express.Router();
const func = require("../function/teacher");

router.route("/createTeacher").post(async (req, res) => {
    try {
      let response = await func.createTeacher(req.body);
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  });
  router.route("/getTeacher").post(async (req, res) => {
    try {
      let response = await func.getTeacher();
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  });
  router.route("/getTeacherById").post(async (req, res) => {
    try {
      let response = await func.getTeacherById(req.body);
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  });
  
  module.exports = router;
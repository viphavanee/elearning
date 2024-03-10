const express = require("express");
const router = express.Router();
const func = require("../function/question");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.route("/").get(async (req, res) => {
  try {
    const response = await func.getQuestion();
    if (response.status_code === "200") {
      const questions = response.data;
      res.render("question", { questions });
    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/createQuestion").get(async (req, res) => {
  res.render("createQuestion");
});

router.route("/createQuestion").post(upload.single("image"), async (req, res) => {
  try {
    const response = await func.createQuestion(req.body, req.file);
    res.redirect('/questionAdmin');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.route("/getQuestion").post(async (req, res) => {
  try {
    let response = await func.getQuestion();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getQuestionById").post(async (req, res) => {
  try {
    let response = await func.getQuestionById(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/edit/:id").get(async (req, res) => {
  try {
    const questionId = req.params.id;
    if (!questionId) {
      console.error("Invalid question ID:", questionId);
      return res.status(400).json({ error: "Invalid question ID" });
    }

    const editQuestion = await func.getQuestionById({ id: questionId });
    if (editQuestion.status_code === "200") {
      res.render("editQuestion", { editQuestion: editQuestion.data });
    } else {
      res.status(404).json({ error: "News not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



router.route("/delete/:id").get(async (req, res) => {
  try {
    const questionId = req.params.id;
    if (!questionId) {
      console.error("Invalid News ID:", lessonId);
      return res.status(400).json({ error: "Invalid News ID" });
    }

    const softDeleteResult = await func.softDelete({ id: questionId });

    if (softDeleteResult.status_code === "200") {
      res.render("softDeleteSuccess", { message: "Soft delete complete" });
      res.redirect('/question');
    } else {
      res.status(404).json({ error: "question not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;

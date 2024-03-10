const express = require("express");
const router = express.Router();
const func = require("../function/quiz");


router.route("/").get(async (req, res) => {
  try {
    const response = await func.getQuiz();
    if (response.status_code === "200") {
      const quiz = response.data;
      res.render("quizManage", { quiz });
    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/createQuiz").get(async (req, res) => {
  res.render("createQuiz");
});

router.route("/createQuiz").post(async (req, res) => {
  try {
    const { lessonId, quizName, status, numberOfQuestions, timeInMinutes, score } = req.body;
    let selectedStatus;
    if (status === 'pre' || status === 'post') {
      selectedStatus = status;
    } else {
      selectedStatus = null;
    }
    const result = await func.createQuiz({
      lessonId,
      quizName,
      numberOfQuestions,
      timeInMinutes,
      score,
      status: selectedStatus,
    });

    if (result.status_code === '200') {
      res.status(200).json(result);
    } else {
      res.status(500).json({ error: result.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.route("/edit/:id").get(async (req, res) => {
  try {
    const quizId = req.params.id;
    if (!quizId) {
      console.error("Invalid quiz ID:", newsId);
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    const editQuiz = await func.getQuizById({ id: quizId });

    if (editQuiz.status_code === "200") {
      res.render("editQuiz", { editQuiz: editQuiz.data });
    } else {
      res.status(404).json({ error: "Quiz not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/edit/:id").post(async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    data.id = id;

    const result = await func.updateQuiz(data);
    res.status(result.status_code).json(result);
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({
      status_code: "500",
      status_phrase: "internal server error",
      message: "Internal server error",
    });
  }
});


router.route("/delete/:id").get(async (req, res) => {
  try {
    const quizId = req.params.id;
    if (!quizId) {
      console.error("Invalid quiz ID:", quizId);
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    const softDeleteResult = await func.softDelete({ id: quizId });

    if (softDeleteResult.status_code === "200") {
      res.render("softDeleteSuccess", { message: "Soft delete complete" });
      res.redirect('/quiz');
    } else {
      res.status(404).json({ error: "quiz not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
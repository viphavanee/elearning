const express = require("express");
const router = express.Router();
const func = require("../function/quiz");
const lessonFunc = require("../../lesson/function/lesson")


router.route("/").get(async (req, res) => {
  try {
    const response = await func.getQuiz();
    const lesson = await lessonFunc.getLesson();
    if (response.status_code === "200" && lesson.status_code === "200") {
      const quiz = response.data;
      const lessonData = lesson.data;
      res.render("quizAdmin", { quiz, lessons: lessonData });
    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/tchr").get(async (req, res) => {
  try {
    const response = await func.getQuiz();
    if (response.status_code === "200") {
      const quiz = response.data;
      res.render("quizTchr", { quiz });
    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/createQuiz").get(async (req, res) => {
  try {

    const response = await lessonFunc.getLesson();

    if (response.status_code === "200") {
      const lessons = response.data;
      res.render("createQuiz", { lessons }); // Render createQuiz template with lessons data
    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.route("/createQuiz").post(async (req, res) => {
  try {
    const test = req.body
    const { lessonId, quizName, numberOfQuestions, timeInMinutes, score } = req.body;
    const response = await func.createQuiz({
      lessonId,
      quizName,
      numberOfQuestions,
      timeInMinutes,
      score
    });
    if (response.status_code === "200") {
      res.redirect('/quizAdmin');

    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }

});

//Pre-test
router.route("/pre/:id").get(async (req, res) => {
  try {
    const quizId = req.params.id;
    if (!quizId) {
      console.error("Invalid Quiz ID:", quizId);
      return res.status(400).json({ error: "Invalid Quiz ID" });
    }

    const quiz = await func.getQuizById({ id: quizId });

    if (quiz.status_code === "200") {
      res.render("quizPre", { quiz: quiz.data });
    } else {
      res.status(404).json({ error: "Quiz not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Post-test
router.route("/post/:id").get(async (req, res) => {
  try {
    const quizId = req.params.id;
    if (!quizId) {
      console.error("Invalid Quiz ID:", quizId);
      return res.status(400).json({ error: "Invalid Quiz ID" });
    }

    const quiz = await func.getQuizById({ id: quizId });

    if (quiz.status_code === "200") {
      res.render("quizPost", { quiz: quiz.data });
    } else {
      res.status(404).json({ error: "Quiz not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/edit/:id").get(async (req, res) => {
  try {
    const quizId = req.params.id;
    if (!quizId) {
      console.error("Invalid Quiz ID:", quizId);
      return res.status(400).json({ error: "Invalid news ID" });
    }

    const editquiz = await func.getQuizById({ id: quizId });
    console
    if (editquiz.status_code === "200") {
      res.status(200).json({ data: editquiz.data });
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
    const quizId = req.params.id;
    if (!quizId) {
      console.error("Invalid quiz Id:", quizId);
      return res.status(400).json({ error: "Invalid quiz Id" });
    }

    const newquizName = req.body.newquizName
    const newnumberOfQuestions = req.body.newnumberOfQuestions;
    const newtimeInMinutes = req.body.newtimeInMinutes;
    const newscore = req.body.newscore;
    const newlessonId = req.body.newlessonId;
    const updateResult = await func.updateQuiz({
      id: quizId,
      newquizName,
      newnumberOfQuestions,
      newtimeInMinutes,
      newscore,
      newlessonId
    });

    if (updateResult.status_code === "200") {
      res.redirect('/quizAdmin');
    } else {
      res.status(404).json({ error: updateResult.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
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
      res.redirect('/quizAdmin');
    } else {
      res.status(404).json({ error: softDeleteResult.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/:id/questionAdmin").get(async (req, res) => {
  try {
    const quizId = req.params.id;
    if (!quizId) {
      console.error("Invalid Quiz ID:", quizId);
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    const editquiz = await func.getQuizById({ id: quizId });

    if (editquiz.status_code === "200") {
      res.render("questionAdmin", { editquiz: editquiz.data });
    } else {
      res.status(404).json({ error: "Quiz not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// router.get("/quizAdmin/:quizId/questionAdmin/createQuestion", (req, res) => {
//   const quizId = req.params.quizId;

//   res.render("adminquestion", { quizId });
// });

module.exports = router;
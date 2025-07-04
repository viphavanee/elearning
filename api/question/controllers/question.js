const express = require("express");
const router = express.Router();
const func = require("../function/question")
const quizFunc = require("../../quiz/function/quiz")
const lFunc = require("../../lesson/function/lesson");
const AFunc = require("../../attempt/function/attempt");


router.route("/").get(async (req, res) => {
  try {
    const response = await func.getQuestion();
    if (response.status_code === "200") {
      const question = response.data;
      res.render("questionAdmin", { question });
    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* router.route("/createQuestion").get(async (req, res) => {
  res.render("createQuestion");
}); */

router.route("/createQuestion").post(async (req, res) => {
  try {

    // Check if request body is empty
    if (!req.body) {
      return res.status(400).json({ error: "Request body is empty" });
    }

    // Assuming func.createQuestion returns an object with quizId in response
    const response = await func.createQuestion(req.body, req.file);

    // Check if response contains quizId and status_code is "200"
    if (response.status_code === "200" && response.quizId) {
      return res.redirect(`/question/${response.quizId}`); // Redirect to the question page
    } else {
      return res.status(400).json({ error: "Failed to create question", response });
    }
  } catch (error) {
    console.error("Error creating question:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/getQuestion/:id").get(async (req, res) => {
  const questionId = req.params.id;
  try {
    let response = await func.getQuestionById({ id: questionId });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getQuestion").post(async (req, res) => {
  try {
    let response = await func.getQuestion();
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

// Utility function to shuffle an array
function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle…
  while (currentIndex !== 0) {
    // Pick a remaining element…
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

//[0, 1, 2]
//[2, 0, 1]

router.route("/pre/:lessonId/:studentId/:roomCode").get(async (req, res) => {
  try {
    const {lessonId, studentId, roomCode} = req.params;
    const getLesson = await lFunc.getLessonById({ id: lessonId });
    const lessonNum = getLesson.data.lessonNum;

    const quiz = await quizFunc.getQuizByLessonNum({ lessonNum });
    const quizId = quiz.data._id.toString();

    const attemptCheck = await AFunc.checkAttempt({studentId, quizId, roomCode, attemptType: "pre"})
    if(attemptCheck.data){
      return res.redirect('/protected');
    }

    if (quiz.status_code === "200") {
      const question = await func.getQuestionByQId({ quizId: quizId });
      if (question.status_code === "200") {
        // Shuffle the questions
        const shuffledQuestions = shuffleArray(question.data);
        res.render("questionPre", { question: shuffledQuestions, quizData: quiz.data });
      } else {
        res.status(404).json({ error: "Question not found" });
      }
    } else {
      res.status(404).json({ error: `Quiz with id ${quizId} not found` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.route("/post/:lessonId/:studentId/:roomCode").get(async (req, res) => {
  try {
    const {lessonId, studentId, roomCode} = req.params;
    const getLesson = await lFunc.getLessonById({ id: lessonId });
    const lessonNum = getLesson.data.lessonNum;

    const quiz = await quizFunc.getQuizByLessonNum({ lessonNum });
    const quizId = quiz.data._id.toString();

    const attemptCheck = await AFunc.checkAttempt({studentId, quizId, roomCode, attemptType: "post"})
    if(attemptCheck.data){
      return res.redirect('/protected');
    }

    if (quiz.status_code === "200") {
      const question = await func.getQuestionByQId({ quizId: quizId });
      if (question.status_code === "200") {
        // Shuffle the questions
        const shuffledQuestions = shuffleArray(question.data);
        res.render("questionPost", { question: shuffledQuestions, quizData: quiz.data });
      } else {
        res.status(404).json({ error: "Question not found" });
      }
    } else {
      res.status(404).json({ error: `Quiz with id ${quizId} not found` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



router.route("/:id").get(async (req, res) => {
  try {
    const quizId = req.params.id;
    if (!quizId) {
      console.error("Invalid quiz ID:", quizId);
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    const quiz = await quizFunc.getQuizById({ id: quizId });

    if (quiz.status_code === "200") {
      const question = await func.getQuestionByQId({ quizId: quizId });
      if (question.status_code === "200") {
        res.render("questionAdmin", { question: question.data, quizData: quiz.data });
      } else {
        res.status(404).json({ error: "Question not found" });
      }
    } else {
      res.status(404).json({ error: `Quiz with id ${quizId} not found` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.route("/tchr/:id").get(async (req, res) => {
  try {
    const quizId = req.params.id;
    if (!quizId) {
      console.error("Invalid quiz ID:", quizId);
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    const quiz = await quizFunc.getQuizById({ id: quizId });

    if (quiz.status_code === "200") {
      const question = await func.getQuestionByQId({ quizId: quizId });
      if (question.status_code === "200") {
        res.render("questionTchr", { question: question.data, quizData: quiz.data });
      } else {
        res.status(404).json({ error: "Question not found" });
      }
    } else {
      res.status(404).json({ error: `Quiz with id ${quizId} not found` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.route("/edit/:id").post(async (req, res) => {
  try {
    const questionId = req.params.id;
    if (!questionId) {
      console.error("Invalid question Id:", quizId);
      return res.status(400).json({ error: "Invalid news Id" });
    }
    const { question, choiceA, choiceB, choiceC, choiceD, correctAnswer, quizId } = req.body;

    const updateData = {
      id: questionId,
      question,
      choiceA,
      choiceB,
      choiceC,
      choiceD,
      correctAnswer,
    };

    const updateResult = await func.updateQuestion(updateData);

    if (updateResult.status_code === "200") {
      res.redirect(`/question/${quizId}`);
      return res.status(200).json({ message: `Question with id ${questionId} updated successfully` });
    } else {
      return res.status(500).json({ error: `Failed to update question with id ${questionId}` });
    }
  } catch (error) {

  }

});

router.route("/delete/:id").get(async (req, res) => {
  try {
    const questionId = req.params.id;
    if (!questionId) {
      console.error("Invalid News ID:", lessonId);
      return res.status(400).json({ error: "Invalid News ID" });
    }
    const getQuizId = await func.getQuestionById({ id: questionId });
    const softDeleteResult = await func.softDelete({ id: questionId });

    if (softDeleteResult.status_code === "200") {
      res.render("softDeleteSuccess", { message: "Soft delete complete" });
      res.redirect(`/question/${getQuizId.data.quizId}`);
    } else {
      res.status(404).json({ error: "question not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;

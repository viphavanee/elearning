const express = require("express");
const router = express.Router();
const func = require("../function/attempt");
const Qfunc = require("../../question/function/question");
const Dfunc = require("../../attemptDetail/function/attemptDetail");

router.route("/createAttempt").post(async (req, res) => {
  try {
    const {
      studentId,
      quizId,
      attemptType,
      durationInSec
    } = req.body;

    let totalScore = 0;

    // Get all questions for the given quizId
    const questions = await Qfunc.getQuestionByQId({ quizId: quizId });

    // Ensure questions data exists and is an array
    if (!questions || !Array.isArray(questions.data)) {
      return res.status(400).json({ error: "Invalid questions data" });
    }
    //{answer_1: chioceA}
    // Correct answers mapping
    const correctAnswers = questions.data.reduce((acc, question) => {
      acc[question.questionNumber] = question.correctAnswer;
      return acc;
    }, {});

    // Prepare attempt data
    const attemptData = {
      studentId,
      quizId,
      attemptType,
      durationInSec,
      totalScore,
    };

    // Save attempt data to the database
    const response = await func.createAttempt(attemptData);
    const attemptId = response.data._id; // Assuming response.data contains the saved attempt data

    // Collect attempt details
    const attemptDetails = [];
    for (let i = 1; i <= 10; i++) {
      const userAnswer = req.body[`answer_${i}`];
      const question = questions.data.find(q => q.questionNumber === i);
      const isCorrect = userAnswer === correctAnswers[i] ? 1 : 0;
      if (isCorrect) totalScore++;

      const detailData = {
        questionId: question._id,
        attemptId,
        questionNumber: question.questionNumber,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
      };

      attemptDetails.push(detailData);
    }

    // Save all attempt details in a batch
    await Dfunc.createAttemptDetail(attemptDetails);

    // Update the totalScore in attempt data after processing all answers
    await func.updateAttempt(attemptId, { totalScore });

    res.status(200).json({ success: true, data: { ...attemptData, totalScore } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


router.route("/getAttempt").get(async (req, res) => {
  try {
    let response = await func.getAttempt();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getAttemptById").get(async (req, res) => {
  try {
    let response = await func.getAttemptById(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const func = require("../function/attemptDetail");
const UFunc = require("../../user/function/user");
const QFunc = require("../../quiz/function/quiz");


router.route("/createAttemptDetail").post(async (req, res) => {
  try {
    let response = await func.createAttemptDetail(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getAttemptDetail").post(async (req, res) => {
  try {
    let response = await func.getAttemptDetail();
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getAttemptDetailById").get(async (req, res) => {
  try {
    let response = await func.getAttemptDetailById(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.route("/:attemptId/:studentId/:quizId").get(async (req, res) => {
  const { attemptId, studentId, quizId } = req.params
  try {
    let attemptDetails = await func.getAttemptDetailByAttemptId({ id: attemptId });
    const student = await UFunc.getStudent({ id: studentId });
    const quiz = await QFunc.getQuizById({ id: quizId });

    const quizRes = quiz.data;
    const attemptDetailsRes = attemptDetails.data;
    const studentRes = student.data[0];
    res.render("attemptScoreDetail", { attemptDetails: attemptDetailsRes, student: studentRes, quizRes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;

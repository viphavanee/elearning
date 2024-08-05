const express = require("express");
const router = express.Router();
const func = require("../function/attempt");
const Qfunc = require("../../question/function/question");
const Dfunc = require("../../attemptDetail/function/attemptDetail");
const Ufunc = require("../../user/function/user");
const QuizFunc = require("../../quiz/function/quiz");
const Cfunc = require("../../classroom/function/classroom");

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

router.route("/list/:id").get(async (req, res) => {
  const { id } = req.params; // Get the teacher ID from the URL parameters

  try {
    // Fetch the classroom data by teacher ID

    const classroomResponse = await Cfunc.getClassroombyTeacherId({ id });
    const classroom = classroomResponse?.data || null; // Use optional chaining with fallback to null

    // Fetch the teacher data by ID
    const teacherResponse = await Ufunc.getUserById({ id });
    const teacher = teacherResponse?.data || null; // Use optional chaining with fallback to null
    // Render the classroomTeacher view with the classroom and teacher data
    res.render("attemptTchr", { classroom, teacher });
  } catch (error) {
    console.error('Error in getClassroom controller:', error);
    res.status(500).json({ error: error.message });
  }
});


router.route("/:teacherId/quiz/:roomCode").get(async (req, res) => {
  const { roomCode } = req.params;
  try {
    let getQuiz = await QuizFunc.getQuiz();
    res.render("score", { quiz: getQuiz.data, roomCode });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});


router.route("/list/:id/pre/:roomCode").get(async (req, res) => {
  const { id, roomCode } = req.params;

  try {
    // Fetch attempts data
    const getAttempt = await func.getAttemptByRoomCode({ id, attemptType: "pre", roomCode });
    const attemptData = getAttempt.data;

    // Extract student IDs
    const studentIds = attemptData.map(attempt => attempt.studentId);

    // Fetch student details
    const studentDetailsPromises = studentIds.map(async studentId => {
      const studentResponse = await Ufunc.getStudent({ id: studentId });
      // Extract the first item from the array if available
      return studentResponse.data[0] || {}; // Handle potential empty array
    });

    const studentDetails = await Promise.all(studentDetailsPromises);

    // Combine attemptData with studentDetails
    const combinedData = attemptData.map((attempt, index) => ({
      ...attempt,
      student: studentDetails[index] || {} // Ensure student is an object
    }));


    // Render the view with combined data
    res.render("attemptScorePre", { combinedData });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
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

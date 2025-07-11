const express = require("express");
const router = express.Router();
const func = require("../function/admin");
const Ufunc = require("../../user/function/user");
const Lfunc = require("../../lesson/function/lesson");
const Cfunc = require("../../classroom/function/classroom");
const Afunc = require("../../attempt/function/attempt");
const Qfunc = require("../../quiz/function/quiz");

router.route("/createAdmin").post(async (req, res) => {
  try {
    let response = await func.createAdmin(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});
router.route("/dashboard").get(async (req, res) => {
  try {
    let attemptWithLessonNum = [];
    const getStudent = await Ufunc.getUsersByRole({ role: "student" });
    const getTchr = await Ufunc.getUsersByRole({ role: "teacher" });
    const getLesson = await Lfunc.getLesson();
    const getClassroom = await Cfunc.getClassroom();
    const attempt = await Afunc.getAttempt();

    const uniqueSchools = new Set();
    getStudent.data.forEach((student) => {
      if (student.school) {
        uniqueSchools.add(student.school);
      }
    });

    const schoolCount = uniqueSchools.size;

    for (const item of attempt.data) {
      const getQuiz = await Qfunc.getQuizById({ id: item.quizId });
      attemptWithLessonNum.push({
        ...item,
        lessonNum: getQuiz.data.lessonId,
      });
    }


    const stdCount = getStudent.data.length;
    const tchrCount = getTchr.data.length;
    const lessonCount = getLesson.data.length;
    const classroomCount = getClassroom.data.length;

    const getLatestUser = await Ufunc.getLastFiveUsers();
    const latestUser = getLatestUser.data;

    const teachers = getTchr.data;
    const classrooms = getClassroom.data;

    const groupedData = teachers.map(teacher => {
      return {
        ...teacher,
        classrooms: classrooms.filter(classroom => classroom.teacherId === teacher._id.toString()),
      };
    });


    res.render("adminDashboard", {
      stdCount,
      tchrCount,
      lessonCount,
      classroomCount,
      latestUser,
      schoolCount, 
      groupedData,
      attempts: attemptWithLessonNum,
      lesson: getLesson.data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});


router.route("/getAdminById").post(async (req, res) => {
  try {
    let response = await func.getAdminById(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;

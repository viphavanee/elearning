const express = require("express");
const router = express.Router();
const func = require("../function/teacher");
const Ufunc = require("../../user/function/user");
const Lfunc = require("../../lesson/function/lesson");
const Cfunc = require("../../classroom/function/classroom");
const Afunc = require("../../attempt/function/attempt");
const Qfunc = require("../../quiz/function/quiz");

router.route("/createTeacher").post(async (req, res) => {
  try {
    let response = await func.createTeacher(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getTeacher").post(async (req, res) => {
  try {
    let response = await func.getTeacher();
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getTeacherById").post(async (req, res) => {
  try {
    let response = await func.getTeacherById(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});
router.route("/dashboard/:id").get(async (req, res) => {
  try {
    // Arrays for categorized attempts
    const teacherId = req.params.id;
    let attemptWithLessonNum = [];

    // Get data from model
    const getClassroom = await Cfunc.getClassroombyTeacherId({id: teacherId});
    const getStudent = await Promise.all(
      getClassroom.data.map(room => Ufunc.getUserByRoomCode({ roomCode: room.roomCode }))
  );
  const getTchr = await Ufunc.getUsersByRole({role: 'teacher'})
    const getLesson = await Lfunc.getLesson();
    const attempt = await Afunc.getAttempt();

    // Filter and categorize attempts
    for (const item of attempt.data) {
      const getQuiz = await Qfunc.getQuizById({ id: item.quizId });
      attemptWithLessonNum.push({
        ...item,
        lessonNum: getQuiz.data.lessonId,
      });
    }


    // Data length
    const stdCount = getStudent.reduce((sum, student) => sum + student.data.length, 0);
    const lessonCount = getLesson.data.length;
    const classroomCount = getClassroom.data.length;

    // Get the latest 5 users
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


    // Render adminDashboard view and pass the retrieved data
    res.render("tchrDashboard", {
      stdCount,
      lessonCount,
      classroomCount,
      groupedData,
      teacherId,
      attempts: attemptWithLessonNum,
      lesson: getLesson.data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});
module.exports = router;
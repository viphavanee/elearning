const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken')
const func = require("../function/classRoom_attempt");
const Cfunc = require("../../classroom/function/classroom");
const Ufunc = require("../../user/function/user");

router.route("/create").post(async (req, res) => {
  try {

    const response = await func.createClassroomAttempt(req.body);
    const classroom = await Cfunc.getByRoomCode({roomCode: req.body.roomCode});
    const payload = {
      userId: req.body.studentId,
      email: req.body.email,
      role: req.body.role,
      firstname: req.body.firstname,
      classroomId: classroom.data._id
    }
    const newToken = jwt.sign(payload, process.env.JWT_SECRET_KEY);

    res.json({studentId: req.body.studentId, newToken});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});
// router.route("/").get(async (req, res) => {
//   try {
//     res.render('joinClass');
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error });
//   }
// });

router.route("/getClassroomAttempt").post(async (req, res) => {
  try {
    let response = await func.getClassroomAttempt();
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getClassroomAttemptById").post(async (req, res) => {
  try {
    let response = await func.getClassroomAttemptById(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});
router.route("/delete/:studentId/:roomCode/:classId").get(async (req, res) => {
  const { studentId, roomCode, classId } = req.params;

  try {
    let response = await func.softDelete({ studentId: studentId, roomCode: roomCode });
    const updateUser = await Ufunc.updateIsJoined({id: studentId})
    res.redirect(`/classroom/id/${classId}`);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});
router.route("/std/delete/:studentId/:classroomId").get(async (req, res) => {
  const { studentId, classroomId } = req.params;

  try {
    const classroom = await Cfunc.getClassroomById({id: classroomId})
    let response = await func.softDelete({ studentId: studentId, roomCode: classroom.data.roomCode });
    const updateUser = await Ufunc.updateIsJoined({id: studentId})
    res.redirect(`/classroom/std/${studentId}`);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;

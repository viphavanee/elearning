const express = require("express");
const router = express.Router();
const func = require("../function/classRoom_attempt");

router.route("/create").post(async (req, res) => {
  try {
    const response = await func.createClassroomAttempt(req.body);

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
// router.route("/").get(async (req, res) => {
//   try {
//     res.render('joinClass');
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: error });
//   }
// });

router.route("/getClassroomAttempt").post(async (req, res) => {
  try {
    let response = await func.getClassroomAttempt();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getClassroomAttemptById").post(async (req, res) => {
  try {
    let response = await func.getClassroomAttemptById(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/delete/:studentId/:roomCode/:classId").get(async (req, res) => {
  const { studentId, roomCode, classId } = req.params;

  try {
    let response = await func.softDelete({ studentId: studentId, roomCode: roomCode });
    res.redirect(`/classroom/id/${classId}`);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;

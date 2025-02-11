const express = require("express");
const router = express.Router();
const func = require("../function/classroom");
const tFunc = require("../../user/function/user");
const AFunc = require("../../classroom_attempt/function/classRoom_attempt");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const jwt = require('jsonwebtoken')

router.route('/createClassroom').post(upload.single('feature_image'), async (req, res) => {
  try {
    // Verify and decode JWT token from Authorization header
    const token = req.headers.authorization.split(' ')[1]; // Extract token from Authorization header
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify token validity and decode it
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decodedToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extract userId from decoded token
    const { userId } = decodedToken;

    // Token is valid, proceed with creating classroom
    const imageFile = req.file;

    // Call the function to create a classroom and get the response
    const newClassroom = await func.createClassroom(req.body, imageFile, userId);

    // Respond with the newly created classroom or a success message
    res.status(201).json({ message: 'Classroom created successfully', classroom: newClassroom });
  } catch (error) {
    console.error('Error creating classroom:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});


router.route("/std/:id").get(async (req, res) => {
  const { id } = req.params;
  try {

    let response = await func.getClassroomByRoomCode({ id });
    if (response.status_code === "200") {
      const classroom = response.data;
      const teacherId = classroom[0]?.teacherId;
      const teacherResponse = await tFunc.getUserById({ id: teacherId });
      const teacher = teacherResponse?.data || null;
      res.render("classroomStd", { classroom, teacher });
    } else {
      res.render("classroomStd", { classroom: null, teacher: null });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.route("/teacher/:id").get(async (req, res) => {
  const { id } = req.params; // Get the teacher ID from the URL parameters

  try {
    // Fetch the classroom data by teacher ID
    const classroomResponse = await func.getClassroombyTeacherId({ id });
    const classrooms = classroomResponse?.data || []; // Use optional chaining with fallback to an empty array

    // Fetch the teacher data by ID
    const teacherResponse = await tFunc.getUserById({ id });
    const teacher = teacherResponse?.data || null; // Use optional chaining with fallback to null

    // Initialize an array to hold classrooms with their attempt counts
    const classroomsWithAttempts = [];

    // Iterate over each classroom to fetch and count attempts
    for (const classroom of classrooms) {
      // Assuming classroom has a roomCode property for fetching attempts
      const attemptResponse = await AFunc.getClassroomByRoomCode({ roomCode: classroom.roomCode });
      const attempts = attemptResponse?.data || []; // Fetch attempts

      // Create an object for the classroom with its attempt count
      classroomsWithAttempts.push({
        ...classroom,
        attemptCount: attempts.length, // Count the number of attempts
      });
    }

    // Render the classroomTeacher view with the classrooms and teacher data
    res.render("classroomTeacher", { classroom: classroomsWithAttempts, teacher });
  } catch (error) {
    console.error('Error in getClassroom controller:', error);
    res.status(500).json({ error: error.message });
  }
});




router.route("/id/:id").get(async (req, res) => {
  try {
    const { id } = req.params;
    const response = await func.getClassroomById({ id: id });
    const classroom = response.data;

    // Check if the classroom exists
    if (!classroom) {
      return res.status(404).json({ error: "Classroom not found" });
    }

    const roomCode = classroom.roomCode;
    const getClassroomDetail = await AFunc.getClassroomByRoomCode({ roomCode: roomCode });
    const getDetailsRes = getClassroomDetail.data;

    // Create an array to hold student details
    const studentDetails = [];

    // Loop through the classroom details
    for (const detail of getDetailsRes) {
      const userId = detail.studentId;
      const getStd = await tFunc.getUserById({ id: userId });
      // Assuming getStd.data returns student details for that userId
      if (getStd.data) {
        studentDetails.push(getStd.data);
      }
    }

    res.render("classroomDetail", { classroom, studentDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});


router.route("/delete/:id/:teacherId").get(async (req, res) => {
  try {
    const classroomId = req.params.id;
    const teacherId = req.params.teacherId;
    if (!classroomId) {
      console.error("Invalid classroom ID:", classroomId);
      return res.status(400).json({ error: "Invalid classroom ID" });
    }

    const softDeleteResult = await func.softDelete({ id: classroomId });

    if (softDeleteResult.status_code === "200") {
      res.render("softDeleteSuccess", { message: "Soft delete complete" });
      res.redirect(`/classroom/teacher/${teacherId}`)
    } else {
      res.status(404).json({ error: "classroom not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.route("/edit/:id").get(async (req, res) => {
  try {
    const classroomId = req.params.id;
    const editClassroom = await func.getClassroomById({ id: classroomId });
    if (editClassroom.status_code === "200") {
      res.status(200).json({ data: editClassroom.data });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/edit/:id").post(upload.single("image"), async (req, res) => {
  try {
    const classroomId = req.params.id;
    if (!classroomId) {
      console.error("Invalid classroom ID:", classroomId);
      return res.status(400).json({ error: "Invalid classroom ID" });
    }

    const newImage = req.file;

    const newClassroomName = req.body.classroomName;

    const updateResult = await func.updateClassroomImage({
      id: classroomId,
      newImage,
      newClassroomName
    });

    if (updateResult.status_code === "200") {
      res.status(200).json({ message: 'OK' });
    } else {
      res.status(404).json({ error: updateResult.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

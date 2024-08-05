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
      console.log(classroom);
      const teacherResponse = await tFunc.getUserById({ id });
      const teacher = teacherResponse?.data || null; 
      res.render("classroomStd", { classroom, teacher });
    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

router.route("/teacher/:id").get(async (req, res) => {
  const { id } = req.params; // Get the teacher ID from the URL parameters

  try {
    // Fetch the classroom data by teacher ID
    const classroomResponse = await func.getClassroombyTeacherId({ id });
    const classroom = classroomResponse?.data || null; // Use optional chaining with fallback to null

    // Fetch the teacher data by ID
    const teacherResponse = await tFunc.getUserById({ id });
    const teacher = teacherResponse?.data || null; // Use optional chaining with fallback to null
    // Render the classroomTeacher view with the classroom and teacher data
    res.render("classroomTeacher", { classroom, teacher });
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

    let detail = null;
    let std = null;
    const roomCode = classroom.roomCode;
    const getClassroomDetail = await AFunc.getClassroomByRoomCode({ roomCode: roomCode });
    const getDetailsRes = getClassroomDetail.data;

    const userId = getDetailsRes[0]?.studentId;
    const getStd = await tFunc.getStudent({ id: userId });

    std = getStd.data;
    detail = getDetailsRes;
    res.render("classroomDetail", { classroom, std, detail });
  } catch (error) {
    console.log(error);
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

router.route("/edit/:id").post(upload.single("newImage"), async (req, res) => {
  try {
    const classroomId = req.params.id;
    const teacherId = req.params.teacherId;
    if (!classroomId) {
      console.error("Invalid classroom ID:", classroomId);
      return res.status(400).json({ error: "Invalid classroom ID" });
    }

    let newImage = null;
    if (req.file) {
      newImage = req.file.buffer.toString("base64");
    }

    const newContent = req.body.newContent
    const newClassroomName = req.body.newClassroomName;
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

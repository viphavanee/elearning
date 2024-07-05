const express = require("express");
const router = express.Router();
const func = require("../function/classroom");
const tFunc = require("../../user/function/user");
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

    // Extract role from decoded token
    const { userId } = decodedToken;

    // Token is valid, proceed with creating classroom
    const imageFile = req.file;
    const response = await func.createClassroom(req.body, imageFile, userId);

    // Return success response or redirect
    res.redirect('/classroom');
  } catch (error) {
    console.error('Error creating classroom:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

router.route("/std").get(async (req, res) => {
  try {
    let response = await func.getClassroom();
    if (response.status_code === "200") {
      const classroom = response.data;
      res.render("classroomStd", { classroom });
    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/").get(async (req, res) => {
  try {
    // Assuming func.getClassroom() returns a Promise that resolves to classroom data
    let response = await func.getClassroom();

    if (response.status_code === "200") {
      const classroom = response.data;

      let teacher = null;
      if (classroom.length > 0 && classroom[0].teacherId) {
        const userId = classroom[0].teacherId;
        // Assuming tFunc.getUserById() fetches user data by ID
        const teacherRes = await tFunc.getUserById({ id: userId });
        if (teacherRes.status_code === "200") {
          teacher = teacherRes.data;
        } else {
          console.error(`Error fetching teacher with ID ${userId}: ${teacherRes.message}`);
        }
      }

      // Render the classroom and teacher data to your view
      res.render("classroomTeacher", { classroom, teacher });
    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.error('Error in getClassroom controller:', error);
    res.status(500).json({ error: error.message });
  }
});



router.route("/getClassroomById/:id").get(async (req, res) => {
  try {
    const { id } = req.params
    let response = await func.getClassroomById({ id: id });
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});
router.route("/delete/:id").get(async (req, res) => {
  try {
    const classroomId = req.params.id;
    if (!classroomId) {
      console.error("Invalid classroom ID:", classroomId);
      return res.status(400).json({ error: "Invalid classroom ID" });
    }

    const softDeleteResult = await func.softDelete({ id: classroomId });

    if (softDeleteResult.status_code === "200") {
      res.render("softDeleteSuccess", { message: "Soft delete complete" });
      res.redirect('/classroom');
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
    if (!classroomId) {
      console.error("Invalid classroom ID:", classroomId);
      return res.status(400).json({ error: "Invalid classroom ID" });
    }
    const editClassroom = await func.getClassroomById({ id: classroomId });
    if (editClassroom.status_code === "200") {
      res.render("editClassroom", { editClassroom: editClassroom.data });
    } else {
      res.status(404).json({ error: "Classroom not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/edit/:id").post(upload.single("newImage"), async (req, res) => {
  try {
    const classroomId = req.params.id;
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
      res.redirect('/classroom');
    } else {
      res.status(404).json({ error: updateResult.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

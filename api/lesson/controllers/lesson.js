const express = require("express");
const router = express.Router();
const func = require("../function/lesson");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.route("/").get(async (req, res) => {
  try {
    const response = await func.getLesson();
    if (response.status_code === "200") {//Login  ->  token sign -> localStorage
      const lessons = response.data;      //Client -> Middleware -> API -> DB -> API -> Client
      console.log(lessons)
      res.render("lesson", { lessons });
    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/Std").get(async (req, res) => {
  try {
    let response = await func.getLesson();
    if (response.status_code === "200") {
      const lessons = response.data;
      res.render("lessonStd", { lessons });
    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});


router.route("/createLesson").get(async (req, res) => {
  res.render("createLesson");
});

router.route("/createLesson").post(upload.single("image"), async (req, res) => {
  try {
    const response = await func.createLesson(req.body, req.file);
    res.redirect('/lesson');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.route("/lesson/:id").get(async (req, res) => {
  try {
    const lessonId = req.params.id;
    if (!lessonId) {
      console.error("Invalid lesson ID:", lessonId);
      return res.status(400).json({ error: "Invalid lesson ID" });
    }

    console.log("Lesson ID:", lessonId);
    let response = await func.getLessonById({ id: lessonId });
    console.log(response);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/viewLesson/:id").get(async (req, res) => {
  try {
    const lessonId = req.params.id;
    if (!lessonId) {
      console.error("Invalid lesson ID:", lessonId);
      return res.status(400).json({ error: "Invalid lesson ID" });
    }

    const lesson = await func.getLessonById({ id: lessonId });

    if (lesson.status_code === "200") {
      res.render("viewLesson", { lesson: lesson.data });
    } else {
      res.status(404).json({ error: "lesson not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.route("/edit/:id").get(async (req, res) => {
  try {
    const lessonId = req.params.id;
    if (!lessonId) {
      console.error("Invalid lesson ID:", lessonId);
      return res.status(400).json({ error: "Invalid lesson ID" });
    }
    const editLesson = await func.getLessonById({ id: lessonId });
    if (editLesson.status_code === "200") {
      res.render("editLesson", { editLesson: editLesson.data });
    } else {
      res.status(404).json({ error: "Lesson not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/edit/:id").post(upload.single("newImage"), async (req, res) => {
  try {
    const lessonId = req.params.id;
    if (!lessonId) {
      console.error("Invalid lesson ID:", lessonId);
      return res.status(400).json({ error: "Invalid lesson ID" });
    }

    let newImage = null;
    if (req.file) {
      newImage = req.file.buffer.toString("base64");
    }

    const newContent = req.body.newContent
    const newLessonName = req.body.newLessonName;
    const updateResult = await func.updateLessonImage({
      id: lessonId,
      newImage,
      newLessonName,
      newContent
    });

    if (updateResult.status_code === "200") {
      res.redirect('/lesson');
    } else {
      res.status(404).json({ error: updateResult.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




router.route("/delete/:id").get(async (req, res) => {
  try {
    const lessonId = req.params.id;
    if (!lessonId) {
      console.error("Invalid lesson ID:", lessonId);
      return res.status(400).json({ error: "Invalid lesson ID" });
    }

    const softDeleteResult = await func.softDelete({ id: lessonId });

    if (softDeleteResult.status_code === "200") {
      res.render("softDeleteSuccess", { message: "Soft delete complete" });
      res.redirect('/lesson');
    } else {
      res.status(404).json({ error: "Lesson not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;

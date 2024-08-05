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

router.route("/Std/:id/directory").get(async (req, res) => {
  const { id } = req.params;
  try {
    let response = await func.getLessonById({ id });
    if (response.status_code === "200") {
      const lessons = response.data;
      res.render("lessonStdDir", { lessons });
    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

router.route("/tchr").get(async (req, res) => {
  try {
    let response = await func.getLesson();
    if (response.status_code === "200") {
      const lessons = response.data;
      res.render("lessonTchr", { lessons });
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
    res.status(response.status_code).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status_code: "500", status_phrase: "fail", message: "Internal Server Error" });
  }
});


router.route("/lesson/:id").get(async (req, res) => {
  try {
    const lessonId = req.params.id;
    if (!lessonId) {
      console.error("Invalid lesson ID:", lessonId);
      return res.status(400).json({ error: "Invalid lesson ID" });
    }

    let response = await func.getLessonById({ id: lessonId });
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
      console.log("Lesson Data:", lesson.data);
      res.render("viewLesson", { lesson: lesson.data });
    } else {
      res.status(404).json({ error: "Lesson not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/stdViewLesson/:id").get(async (req, res) => {
  try {
    const lessonId = req.params.id;
    if (!lessonId) {
      console.error("Invalid lesson ID:", lessonId);
      return res.status(400).json({ error: "Invalid lesson ID" });
    }

    const lesson = await func.getLessonById({ id: lessonId });

    if (lesson.status_code === "200") {
      console.log("Lesson Data:", lesson.data);
      res.render("stdViewLesson", { lesson: lesson.data });
    } else {
      res.status(404).json({ error: "Lesson not found" });
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
      const contentData = editLesson.data.content;
      // Escape characters to prevent issues in HTML
      const escapedContent = contentData.replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25');
      res.render("editLesson", { editLesson: editLesson.data, escapedContent });
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
    const newLessonNum = req.body.newLessonNum;

    console.log(req.body)
    const updateResult = await func.updateLessonImage({
      id: lessonId,
      newLessonNum,
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




router.route("/delete/:id/:lesson").get(async (req, res) => {
  try {
    const lessonId = req.params.id;
    const lessonNum = req.params.lesson;
    if (!lessonId) {
      console.error("Invalid lesson ID:", lessonId);
      return res.status(400).json({ error: "Invalid lesson ID" });
    }

    const softDeleteResult = await func.softDelete({ id: lessonId, lessonNum });

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

const express = require("express");
const router = express.Router();
const func = require("../function/lessonLog");
const Cfunc = require("../../classroom/function/classroom");
const Lfunc = require("../../lesson/function/lesson");
const Pfunc = require("../../progress/function/progress");

router.route("/createLessonLog").post(async (req, res) => {
    try {
        let response = await func.createLessonLog(req.body);
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error });
    }
});


router.route("/getLessonLog").get(async (req, res) => {
    const { studentId, lessonNum, roomCode } = req.query;
    try {
        let response = await func.getLessonLog({ studentId, lessonNum, roomCode });
        if (response.status_code === '400') {
            return res.status(404).json({ data: "lesson log not found" })
        }
        res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error });
    }
});

router.route("/updateLessonLog").put(async (req, res) => {
    try {
        const dataId = req.query;
        const dataUpdate = req.body;
        let response = await func.updateLessonLog(dataId, dataUpdate);
        if (dataUpdate.status === "Complete") {
            const lessonResponse = await Lfunc.getLessonByLessonNum({ lessonNum: dataId.lessonNum });
            const lessonId = lessonResponse.data._id;
            const updateProgress = await Pfunc.updateLearning({ lessonId, studentId: dataId.studentId, roomCode: dataId.roomCode });
            console.log(updateProgress.message);
        }
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error });
    }
});

module.exports = router;
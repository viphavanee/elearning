const express = require("express");
const router = express.Router();
const func = require("../function/progress");
const lFunc = require("../../lesson/function/lesson");
const cFunc = require("../../classroom/function/classroom");
const uFunc = require("../../user/function/user");
const qFunc = require("../../quiz/function/quiz");


router.route("/:teacherId").get(async (req, res) => {
    try {
        const classroomResponse = await cFunc.getClassroombyTeacherId({ id: req.params.teacherId });
        const classroom = classroomResponse?.data || [];
        res.render("progressTchr", { classroom, teacherId: req.params.teacherId });
      
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.route("/:teacherId/:roomCode").get(async (req, res) => {
    try {
        const lessonResponse = await lFunc.getLesson();
        const lessons = lessonResponse?.data || [];
      
        const classroomResponse = await cFunc.getClassroombyTeacherId({ id: req.params.teacherId });
        const classrooms = classroomResponse?.data || [];
        
        const classroom = classrooms.find(c => c.roomCode === req.params.roomCode);
        
        res.render("progressTchrDir", { classroom, lessons, teacherId: req.params.teacherId, roomCode: req.params.roomCode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.route("/std/:studentId/:roomCode").get(async (req, res) => {
    try {
        const { studentId, roomCode } = req.params;
      
        const result = await func.getByStd({ studentId, roomCode });

        const data = result.data;

        console.log(data)
        
        return res.send(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


router.route("/:teacherId/:roomCode/:lessonId").get(async (req, res) => { 
    try {
        const { lessonId, roomCode } = req.params;
        const userResponse = await uFunc.getUserByRoomCode({ roomCode: req.params.roomCode });
        const users = userResponse?.data || [];
        const progressResponse = await func.getAll({ lessonId, roomCode });
        const progress = progressResponse?.progress || [];
        const lessonResponse = await lFunc.getLessonById({ id: lessonId });
        const lesson = lessonResponse?.data || {};


        // Merging the users and progress data
        const mergedData = users.map(user => {
            const studentProgress = progress.find(p => p.studentId.toString() === user._id.toString());
            return {
                ...user, 
                progress: studentProgress ? studentProgress : null, 
            };
        });
        console.log(mergedData);
        res.render("progressTchrDetail", { processData: mergedData, lessonNum: lesson.lessonNum, lessonName: lesson.lessonName});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;
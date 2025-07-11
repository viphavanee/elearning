const express = require("express");
const router = express.Router();
const func = require("../function/attempt");
const Qfunc = require("../../question/function/question");
const Dfunc = require("../../attemptDetail/function/attemptDetail");
const Ufunc = require("../../user/function/user");
const QuizFunc = require("../../quiz/function/quiz");
const Cfunc = require("../../classroom/function/classroom");
const Lfunc = require("../../lesson/function/lesson");
const Pfunc = require("../../progress/function/progress");
const XLSX = require('xlsx-js-style');
const fs = require('fs');
const path = require('path');

router.route("/createAttempt").post(async (req, res) => {
  try {
    const {
      studentId,
      quizId,
      attemptType,
      durationInSec,
    } = req.body;

    let totalScore = 0;
    const getLessonNum = await QuizFunc.getQuizById({ id: quizId });
    const lessonNum = getLessonNum.data.lessonId;
    const getLessonId = await Lfunc.getLessonByLessonNum({ lessonNum });
    const lessonId = getLessonId.data._id;
    const questions = await Qfunc.getQuestionByQId({ quizId: quizId });

    if (!questions || !Array.isArray(questions.data)) {
      return res.status(400).json({ error: "Invalid questions data" });
    }

    // mapping (loop)
    const correctAnswers = questions.data.reduce((acc, question) => {
      acc[question.questionNumber] = question.correctAnswer;
      return acc;
    }, {});

    const attemptData = {
      studentId,
      quizId,
      attemptType,
      durationInSec,
      totalScore,
    };

    const response = await func.createAttempt(attemptData);
    const attemptId = response.data._id; 

    const attemptDetails = [];
    for (let i = 1; i <= 10; i++) {
      const userAnswer = req.body[`answer_${i}`];
      const question = questions.data.find(q => q.questionNumber === i);
      const isCorrect = userAnswer === correctAnswers[i] ? 1 : 0;
      if (isCorrect) totalScore++;

      const detailData = {
        questionId: question._id,
        attemptId,
        questionNumber: question.questionNumber,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
      };

      attemptDetails.push(detailData);
    }

    await Dfunc.createAttemptDetail(attemptDetails);
    const studentResponse = await Ufunc.getUserById({ id: studentId });
    const roomCode = studentResponse.data.roomCode;

    await func.updateAttempt(attemptId, { totalScore });
    if (attemptType === 'pre') {
      await Pfunc.create({ studentId, lessonId, roomCode });
      return res.redirect(`/attempt/pre/result/${attemptId}`);
    } else if (attemptType === 'post') {
      await Pfunc.updatePost({ studentId, lessonId, roomCode });
      return res.redirect(`/attempt/post/result/${studentId}/${quizId}/${roomCode}`);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.route("/pre/result/:id").get(async (req, res) => {
  const { id } = req.params;
  try {
    let getResult = await func.getAttemptById({ id: id });
    const getLessonNum = await QuizFunc.getQuizById({ id: getResult.data.quizId });
    const lessonNum = getLessonNum.data.lessonId;
    const getLessonId = await Lfunc.getLessonByLessonNum({ lessonNum });
    const lesson = getLessonId.data;
    const getAttemptDetail = await Dfunc.getAttemptDetailByAttemptId({ id });
    const attemptDetail = getAttemptDetail.data;
    const attemptType = getResult.data.attemptType;
    const fullScore = attemptDetail.length;
    const correctAnswers = attemptDetail.filter(detail => detail.isCorrect === 1).length;
    const falseAnswers = attemptDetail.filter(detail => detail.isCorrect === 0).length;



    res.render("resultPre", { attemptType, fullScore, correctAnswers, falseAnswers, lesson });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.route("/post/result/:id").get(async (req, res) => {
  const { id } = req.params;
  try {
    let getResult = await func.getAttemptById({ id: id });
    const getLessonNum = await QuizFunc.getQuizById({ id: getResult.data.quizId });
    const lessonNum = getLessonNum.data.lessonId;
    const getLessonId = await Lfunc.getLessonByLessonNum({ lessonNum });
    const lesson = getLessonId.data;
    const getAttemptDetail = await Dfunc.getAttemptDetailByAttemptId({ id });
    const attemptDetail = getAttemptDetail.data;
    const attemptType = getResult.data.attemptType;
    const fullScore = attemptDetail.length;
    const correctAnswers = attemptDetail.filter(detail => detail.isCorrect === 1).length;
    const falseAnswers = attemptDetail.filter(detail => detail.isCorrect === 0).length;



    res.render("resultPost", { attemptType, fullScore, correctAnswers, falseAnswers, lesson });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.route("/post/result/:studentId/:quizId/:roomCode").get(async (req, res) => {
  const { studentId, quizId, roomCode } = req.params;
  try {

    const result = await func.getAttemptSummary({ studentId, quizId, roomCode });
    const quiz = await QuizFunc.getQuizById({ id: quizId });
    const fullScore = quiz.data.score;
    const lessonNum = quiz.data.lessonId;
    const lesson = await Lfunc.getLessonByLessonNum({ lessonNum });

    res.render("resultPost", { result: result.data, fullScore, lesson: lesson.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});


router.route("/list/:id").get(async (req, res) => {
  const { id } = req.params; 

  try {

    const classroomResponse = await Cfunc.getClassroombyTeacherId({ id });
    const classroom = classroomResponse?.data || null; 
    const teacherResponse = await Ufunc.getUserById({ id });
    const teacher = teacherResponse?.data || null; 
    
    res.render("attemptTchr", { classroom, teacher });
  } catch (error) {
    console.error('Error in getClassroom controller:', error);
    res.status(500).json({ error: error.message });
  }
});

router.route("/:teacherId/quiz/:roomCode").get(async (req, res) => {
  const { roomCode } = req.params;
  try {
    let getQuiz = await QuizFunc.getQuiz();
    const classroom = await Cfunc.getByRoomCode({ roomCode });

    // Render the quizzes page (provide a download link)
    res.render("score", { quiz: getQuiz.data, roomCode, classroom: classroom.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

//Excel
router.route("/generateXlsx/:roomCode/:quizId").get(async (req, res) => {
  const { roomCode, quizId } = req.params;
  try {
    const quiz = await QuizFunc.getQuizById({ id: quizId });
    const preAttempt = await func.getAttemptByRoomCode({
      id: quizId,
      attemptType: "pre",
      roomCode,
    });
    const postAttempt = await func.getAttemptByRoomCode({
      id: quizId,
      attemptType: "post",
      roomCode,
    });
    const lesson = await Lfunc.getLessonByLessonNum({ lessonNum: quiz.data.lessonId });
    const lessonData = lesson.data;
    const classroom = await Cfunc.getByRoomCode({ roomCode });
    const classroomData = classroom.data;
    const teacher = await Ufunc.getUserById({ id: classroomData.teacherId });
    const teacherData = teacher.data;

    const student = await Ufunc.getUserByRoomCode({ roomCode });
    const studentData = student.data;

    const processedData = studentData.map((student) => {
      const preAttempts = preAttempt.data.filter((attempt) => attempt.studentId === student._id.toString());
      const postAttempts = postAttempt.data.filter((attempt) => attempt.studentId === student._id.toString());
      const preTotalScore = preAttempts.length > 0 ? preAttempts[0].totalScore : null;
      const postTotalScore = postAttempts.length > 0 ? postAttempts[0].totalScore : null;

      if (preTotalScore === null || postTotalScore === null) {
        return {
          studentId: student._id,
          studentName: `${student.firstname} ${student.lastname}`,
          preAttempts: '-',
          prePercent: '-',
          postAttempts: '-',
          postPercent: '-',
          changeScore: '-',
          changePercent: '-',
        };
      }

      const changeScore = postTotalScore - preTotalScore;
      const prePercent = (preTotalScore / 10) * 100;
      const postPercent = (postTotalScore / 10) * 100;
      const changePercent = postPercent - prePercent;

      return {
        studentId: student._id,
        studentName: `${student.firstname} ${student.lastname}`,
        preAttempts: preTotalScore,
        prePercent,
        postAttempts: postTotalScore,
        postPercent,
        changeScore,
        changePercent,
      };
    });
    const formattedDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const rows = [
      ['วันที่', formattedDate,],
      ['อาจารย์', teacherData.firstname + ' ' + teacherData.lastname],
      ['ห้อง', classroomData.classroomName],
      ['โรงเรียน', teacherData.school],
      ['บทเรียน', lessonData.lessonNum + ' - ' + lessonData.lessonName],
      [''],
      ['ลำดับที่', 'ชื่อ - สกุล', 'คะแนนก่อนเรียน', '(%)', 'คะแนนหลังเรียน', '(%)', 'ค่าความต่าง', '(%)'],
      ...processedData.map((data, idx) => [
        idx + 1,
        data.studentName,
        data.preAttempts,
        data.prePercent !== '-' ? data.prePercent.toFixed(2) + '%' : '-',
        data.postAttempts,
        data.postPercent !== '-' ? data.postPercent.toFixed(2) + '%' : '-',
        data.changeScore,
        data.changePercent !== '-' ? data.changePercent.toFixed(2) + '%' : '-',
      ])
    ];

    const totalPreScore = processedData.reduce((sum, data) => data.preAttempts !== '-' ? sum + data.preAttempts : sum, 0);
    const totalPostScore = processedData.reduce((sum, data) => data.postAttempts !== '-' ? sum + data.postAttempts : sum, 0);
    const totalChangeScore = processedData.reduce((sum, data) => data.changeScore !== '-' ? sum + data.changeScore : sum, 0);
    const totalStudents = processedData.filter(data => data.preAttempts !== '-').length;

    rows.push([
      'Total',
      '',
      totalPreScore,
      '',
      totalPostScore,
      '',
      totalChangeScore,
      ''
    ]);

    rows.push([
      'Average',
      '',
      (totalPreScore / totalStudents).toFixed(2),
      '',
      (totalPostScore / totalStudents).toFixed(2),
      '',
      (totalChangeScore / totalStudents).toFixed(2),
      ''
    ]);

    // Find the best and lowest score persons
    const bestScorePerson = processedData.reduce((best, student) => {
      return (student.postAttempts > (best.postAttempts || 0)) ? student : best;
    }, {});

    const lowestScorePerson = processedData.reduce((lowest, student) => {
      return (student.postAttempts < (lowest.postAttempts || Infinity)) ? student : lowest;
    }, {});

    rows.push([
      '', '', '', '', '', '', '', ''
    ]);
    rows.push([
      '', '', '', '', '', '', '', ''
    ]);
    rows.push([
      'สูงสุด',
      'หลังเรียน',
      bestScorePerson.postAttempts || '',
      '',
      '',
      '',
      '',
      ''
    ]);

    rows.push([
      'ต่ำสุด',
      'หลังเรียน',
      lowestScorePerson.postAttempts || '',
      '',
      '',
      '',
      '',
      ''
    ]);

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Set column widths
    ws['!cols'] = [
      { wch: 10 }, // ลำดับที่
      { wch: 30 }, // ชื่อ - สกุล
      { wch: 15 }, // Pre-test Score
      { wch: 10 }, // (%)
      { wch: 15 }, // Post-test Score
      { wch: 10 }, // (%)
      { wch: 20 }, // Different Pre and Post
      { wch: 10 }  // (%)
    ];

    // Set row heights
    ws['!rows'] = rows.map((_, idx) => ({ hpt: idx === 5 ? 20 : 15 })); // Header row height 20, others 15

    Object.keys(ws).forEach((cell) => {
      if (ws[cell].v) {
        ws[cell].s = {
          font: {
            name: "Tahoma", 
            sz: 12, // font size
          },
          border: {
            right: { style: "thin", color: { rgb: "000000" } }, 
            left: { style: "thin", color: { rgb: "000000" } },  
            top: { style: "thin", color: { rgb: "000000" } },   
            bottom: { style: "thin", color: { rgb: "000000" } }, 
          }
        };
      }
    });
    const headerCells = ['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'];  
    headerCells.forEach(cell => {
      if (ws[cell]) {
        ws[cell].s = {
          fill: {
            fgColor: { rgb: "FBE2D5" }, // background color
          },
          font: {
            name: "Tahoma",
            sz: 12, 
            weight: "bold", 
          },
          // Black border 
          border: {
            right: { style: "thin", color: { rgb: "000000" } }, 
            left: { style: "thin", color: { rgb: "000000" } },  
            top: { style: "thin", color: { rgb: "000000" } },   
            bottom: { style: "thin", color: { rgb: "000000" } }, 
          }
        };
      }
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Quiz ${quiz.data.quizName}`);

    const filePath = path.join(__dirname, `../downloads/${roomCode}_${lessonData.lessonName}.xlsx`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Existing file for Quiz: ${quiz.data.quizName} replaced.`);
    }

    XLSX.writeFile(wb, filePath);

    res.download(filePath, `${roomCode}_${lessonData.lessonName}.xlsx`, (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to download file' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


router.route("/list/:id/pre/:roomCode").get(async (req, res) => {
  const { id, roomCode } = req.params;

  try {
    // Fetch attempts data
    const getAttempt = await func.getAttemptByRoomCode({ id, attemptType: "pre", roomCode });
    const attemptData = getAttempt.data;
    // Extract student IDs
    const studentIds = attemptData.map(attempt => attempt.studentId);

    // Fetch student details
    const studentDetailsPromises = studentIds.map(async studentId => {
      const studentResponse = await Ufunc.getStudent({ id: studentId });
      // Extract the first item from the array if available
      return studentResponse.data[0] || {}; // Handle potential empty array
    });

    const studentDetails = await Promise.all(studentDetailsPromises);

    // Combine attemptData with studentDetails
    const combinedData = attemptData.map((attempt, index) => ({
      ...attempt,
      student: studentDetails[index] || {} // Ensure student is an object
    }));


    // Render the view with combined data
    res.render("attemptScorePre", { combinedData });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.route("/list/:id/post/:roomCode").get(async (req, res) => {
  const { id, roomCode } = req.params;

  try {
    // Fetch attempts data
    const getAttempt = await func.getAttemptByRoomCode({ id, attemptType: "post", roomCode });
    const attemptData = getAttempt.data;

    // Extract student IDs
    const studentIds = attemptData.map(attempt => attempt.studentId);

    // Fetch student details
    const studentDetailsPromises = studentIds.map(async studentId => {
      const studentResponse = await Ufunc.getStudent({ id: studentId });
      // Extract the first item from the array if available
      return studentResponse.data[0] || {}; // Handle potential empty array
    });

    const studentDetails = await Promise.all(studentDetailsPromises);

    // Combine attemptData with studentDetails
    const combinedData = attemptData.map((attempt, index) => ({
      ...attempt,
      student: studentDetails[index] || {} // Ensure student is an object
    }));


    // Render the view with combined data
    res.render("attemptScorePost", { combinedData });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.route("/score/:studentId").get(async (req, res) => {
  try {
    const { studentId } = req.params;

    // Fetch pre-test and post-test data
    const allLesson = await Lfunc.getLesson();
    const preTest = await func.getAttemptByStudentId({ studentId, attemptType: "pre" });
    const postTest = await func.getAttemptByStudentId({ studentId, attemptType: "post" });

    const preTestData = preTest.data || [];  // Default to empty array if no data
    const postTestData = postTest.data || []; // Default to empty array if no data

    // Helper function to get quiz info and merge it into the test data
    const mergeTestWithLessons = async (testData) => {
      const mergedData = [];
      for (const test of testData) {
        const quiz = await QuizFunc.getQuizById({ id: test.quizId });
        const lesson = quiz && quiz.data ? await Lfunc.getLessonByLessonNum({ lessonNum: quiz.data.lessonId }) : null;

        if (quiz && quiz.data) {
          mergedData.push({
            ...test,
            lessonNum: quiz.data.lessonId, // Add lessonNum from quiz
            fullScore: quiz.data.score,
            lessonName: lesson ? lesson.data.lessonName : null // Handle lesson retrieval
          });

        }
      }
      return mergedData;
    };

    // Merge lesson numbers with pre-test and post-test data
    const preTestWithLessons = await mergeTestWithLessons(preTestData);
    const postTestWithLessons = await mergeTestWithLessons(postTestData);

    // Combine preTest and postTest data grouped by lessonNum
    const groupedResults = {};

    const groupByLessonNum = (testData, type) => {
      testData.forEach(test => {
        const lessonKey = test.lessonNum;
        if (!groupedResults[lessonKey]) {
          groupedResults[lessonKey] = {
            preTest: [],
            postTest: []
          };
        }
        groupedResults[lessonKey][type].push(test);
      });
    };

    // Group the data
    groupByLessonNum(preTestWithLessons, 'preTest');
    groupByLessonNum(postTestWithLessons, 'postTest');

    // Return the grouped data
    res.render("scoreStd", { data: groupedResults, lesson: allLesson.data });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;

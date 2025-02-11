const express = require("express");
const router = express.Router();
const func = require("../function/theme");
const Lfunc = require("../../lesson/function/lesson");
const Ufunc = require("../../user/function/user");
const Cfunc = require("../../comment/function/comment");
const Nfunc = require("../../notification/function/notification");


router.route("/").get(async (req, res) => {
  try {
    // Fetch lessons and themes concurrently
    const [getLesson, themeResponse] = await Promise.all([
      Lfunc.getLesson(),
      func.getTheme()
    ]);

    if (themeResponse.status_code === "200") {
      const themes = themeResponse.data; // Assuming this is an array
      const lessons = getLesson.data;

      // Fetch all user details and comments concurrently
      const userIds = [...new Set(themes.map((theme) => theme.userId))]; // Unique user IDs
      const themeIds = themes.map((theme) => theme._id.toString()); // All theme IDs

      const [usersResponse, commentsResponse] = await Promise.all([
        Promise.all(userIds.map((id) => Ufunc.getUserById({ id }))),
        Promise.all(themeIds.map((id) => Cfunc.getCommentByThemeId({ themeId: id })))
      ]);

      // Map user and comment data for quick access
      const userMap = Object.fromEntries(
        usersResponse.map((response, index) => [userIds[index], response.data || null])
      );

      const commentCountMap = Object.fromEntries(
        commentsResponse.map((response, index) => [
          themeIds[index],
          response.data ? response.data.length : 0
        ])
      );

      // Enhance themes with user and comment count
      const themesWithDetails = themes.map((theme) => ({
        ...theme,
        user: userMap[theme.userId] || null,
        commentCount: commentCountMap[theme._id.toString()] || 0
      }));
      // Render the view with themes and lessons
      res.render("themeStd", { theme: themesWithDetails, lesson: lessons });
    } else {
      res.status(500).json({ error: themeResponse.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.route("/teacher").get(async (req, res) => {
  try {
    // Fetch lessons and themes
    const getLesson = await Lfunc.getLesson();
    const response = await func.getTheme();

    if (response.status_code === "200") {
      const themes = response.data; // Assuming this is an array
      const lesson = getLesson.data;

      // Fetch user details and comment count for each theme
      const themesWithDetails = await Promise.all(
        themes.map(async (theme) => {
          // Fetch user details
          const getUser = await Ufunc.getUserById({ id: theme.userId });

          // Fetch comments for the current theme and count them
          const getComment = await Cfunc.getCommentByThemeId({ themeId: theme._id.toString() });
          const commentCount = getComment.data ? getComment.data.length : 0;

          return {
            ...theme,
            user: getUser.data || null,
            commentCount // Include the comment count
          };
        })
      );

      // Render the view with themes, lessons, users, and comment counts
      res.render("themetchr", { theme: themesWithDetails, lesson });
    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/admin").get(async (req, res) => {
  try {
    // Fetch lessons and themes
    const getLesson = await Lfunc.getLesson();
    const response = await func.getTheme();

    if (response.status_code === "200") {
      const themes = response.data; // Assuming this is an array
      const lesson = getLesson.data;

      // Fetch user details and comment count for each theme
      const themesWithDetails = await Promise.all(
        themes.map(async (theme) => {
          // Fetch user details
          const getUser = await Ufunc.getUserById({ id: theme.userId });

          // Fetch comments for the current theme and count them
          const getComment = await Cfunc.getCommentByThemeId({ themeId: theme._id.toString() });
          const commentCount = getComment.data ? getComment.data.length : 0;

          return {
            ...theme,
            user: getUser.data || null,
            commentCount // Include the comment count
          };
        })
      );

      // Render the view with themes, lessons, users, and comment counts
      res.render("themeadmin", { theme: themesWithDetails, lesson });
    } else {
      res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/admin/checkedReport/:themeId").get(async (req, res) => {
  try {
    const { themeId } = req.params;
    await func.checkedThemeById({ id: themeId });
    res.redirect('/report/admin')
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/getTheme").get(async (req, res) => {
  try {
    let response = await func.getTheme();
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.route("/createTheme").post(async (req, res) => {
  try {
    let response = await func.createTheme(req.body);
    res.redirect("/theme");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.route("/getThemeById/:themeId").get(async (req, res) => {
  const { themeId } = req.params;
  try {
    let response = await func.getThemeById({ id: themeId });
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.route("/updateThemeById/:themeId").post(async (req, res) => {
  const { themeId } = req.params;
  try {
    const themeData = req.body;
    console.log(themeData)
    let response = await func.updateThemeById({ id: themeId, themeData });
    res.redirect("/theme");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.route("/delete/:id").get(async (req, res) => {
  try {
    const themeId = req.params.id;
    if (!themeId) {
      console.error("Invalid theme ID:", themeId);
      return res.status(400).json({ error: "Invalid theme ID" });
    }
    await Cfunc.softDeleteMany({ themeId: themeId });
    await func.softDelete({ id: themeId });
    res.redirect('/theme');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.route("/admin/delete/:id").get(async (req, res) => {
  try {
    const themeId = req.params.id;
    let notificationData;
    if (!themeId) {
      console.error("Invalid theme ID:", themeId);
      return res.status(400).json({ error: "Invalid theme ID" });
    }
    await Cfunc.softDeleteMany({ themeId: themeId });
    const deleteTheme = await func.softDelete({ id: themeId });

    const deletedData = deleteTheme.data;
    console.log(deleteTheme)

     notificationData = {
      themeId,
      reportType: "theme",
      userId: deletedData.userId,
      themeTitle: deletedData.title,
      createType: 'delete',
    };
    
    if (notificationData) {
      await Nfunc.createNotification(notificationData);
    } 
    res.redirect('/theme/admin');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/teacher/delete/:id").get(async (req, res) => {
  try {
    const themeId = req.params.id;
    if (!themeId) {
      console.error("Invalid theme ID:", themeId);
      return res.status(400).json({ error: "Invalid theme ID" });
    }
    await Cfunc.softDeleteMany({ themeId: themeId });
    await func.softDelete({ id: themeId });
    res.redirect('/theme/teacher');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

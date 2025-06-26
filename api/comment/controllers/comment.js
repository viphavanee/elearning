const express = require("express");
const router = express.Router();
const func = require("../function/comment");
const Tfunc = require("../../theme/function/theme");
const Ufunc = require("../../user/function/user");
const Lfunc = require("../../lesson/function/lesson");
const Nfunc = require("../../notification/function/notification");
const Rfunc = require("../../reply/function/reply")

router.route("/createComment").post(async (req, res) => {
  try {
    let response = await func.createComment(req.body);
    const themeId = req.body.themeId;
    res.redirect(`/comment/teacher/getCommentBythemeId/${themeId}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});



router.route("/getComment").get(async (req, res) => {
  try {
    let response = await func.getComment();
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getCommentById/:commentId").get(async (req, res) => {
  const { commentId } = req.params;
  try {
    let response = await func.getCommentById({ id: commentId });
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.route("/getCommentByThemeId/:themeId").get(async (req, res) => {
  const { themeId } = req.params;

  try {
    // Fetch theme, comments, and lessons
    const themeResponse = await Tfunc.getThemeById({ id: themeId });
    const commentResponse = await func.getCommentByThemeId({ themeId });
    const lessonResponse = await Lfunc.getLesson();

    if (commentResponse.status_code !== "200" || !themeResponse.data) {
      return res.render("themeDetailStd", { comment: null, theme: null, lesson: null });
    }

    const theme = themeResponse.data;
    const comments = commentResponse.data || [];
    const lessons = lessonResponse.data;

    // Fetch user details for the theme owner
    const themeUser = await Ufunc.getUserById({ id: theme.userId });
    const themeWithDetails = {
      ...theme,
      user: themeUser.data || null,
      commentCount: comments.length,
    };

    // Process comments and their replies
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const commentUser = await Ufunc.getUserById({ id: comment.userId });

        // Fetch replies for the current comment
        const repliesResponse = await Rfunc.getByCommentId({ commentId: comment._id });
        const replies = repliesResponse.data || [];

        // Enrich replies with user details
        const enrichedReplies = await Promise.all(
          replies.map(async (reply) => {
            const replyUser = await Ufunc.getUserById({ id: reply.userId });
            return {
              ...reply,
              user: replyUser.data || null,
            };
          })
        );

        return {
          ...comment,
          user: commentUser.data || null,
          reply: enrichedReplies,
        };
      })
    );
    // Render the view with enriched data
    res.render("themeDetailStd", {
      comment: enrichedComments,
      theme: themeWithDetails,
      lesson: lessons,
    });
  } catch (error) {
    //console.error("Error fetching theme details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



router.route("/teacher/getCommentByThemeId/:themeId").get(async (req, res) => {
  const { themeId } = req.params;

  try {
    // Fetch theme, comments, and lessons
    const themeResponse = await Tfunc.getThemeById({ id: themeId });
    const commentResponse = await func.getCommentByThemeId({ themeId });
    const lessonResponse = await Lfunc.getLesson();

    if (commentResponse.status_code !== "200" || !themeResponse.data) {
      return res.render("themeDetailStd", { comment: null, theme: null, lesson: null });
    }

    const theme = themeResponse.data;
    const comments = commentResponse.data || [];
    const lessons = lessonResponse.data;

    // Fetch user details for the theme owner
    const themeUser = await Ufunc.getUserById({ id: theme.userId });
    const themeWithDetails = {
      ...theme,
      user: themeUser.data || null,
      commentCount: comments.length,
    };

    // Process comments and their replies
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const commentUser = await Ufunc.getUserById({ id: comment.userId });

        // Fetch replies for the current comment
        const repliesResponse = await Rfunc.getByCommentId({ commentId: comment._id });
        const replies = repliesResponse.data || [];

        // Enrich replies with user details
        const enrichedReplies = await Promise.all(
          replies.map(async (reply) => {
            const replyUser = await Ufunc.getUserById({ id: reply.userId });
            return {
              ...reply,
              user: replyUser.data || null,
            };
          })
        );

        return {
          ...comment,
          user: commentUser.data || null,
          reply: enrichedReplies,
        };
      })
    );
    // Render the view with enriched data
    res.render("themeDetailtchr", {
      comment: enrichedComments,
      theme: themeWithDetails,
      lesson: lessons,
    });
  } catch (error) {
    //console.error("Error fetching theme details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.route("/admin/checkedReport/:commentId").get(async (req, res) => {
  try {
    const { commentId } = req.params;
    await func.checkedCommentById({ id: commentId });
    res.redirect('/report/admin')
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/admin/getCommentByThemeId/:themeId").get(async (req, res) => {
  const { themeId } = req.params;

  try {
    // Fetch theme, comments, and lessons
    const themeResponse = await Tfunc.getThemeById({ id: themeId });
    const commentResponse = await func.getCommentByThemeId({ themeId });
    const lessonResponse = await Lfunc.getLesson();

    if (commentResponse.status_code !== "200" || !themeResponse.data) {
      return res.render("themeDetailStd", { comment: null, theme: null, lesson: null });
    }

    const theme = themeResponse.data;
    const comments = commentResponse.data || [];
    const lessons = lessonResponse.data;

    // Fetch user details for the theme owner
    const themeUser = await Ufunc.getUserById({ id: theme.userId });
    const themeWithDetails = {
      ...theme,
      user: themeUser.data || null,
      commentCount: comments.length,
    };

    // Process comments and their replies
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const commentUser = await Ufunc.getUserById({ id: comment.userId });

        // Fetch replies for the current comment
        const repliesResponse = await Rfunc.getByCommentId({ commentId: comment._id });
        const replies = repliesResponse.data || [];

        // Enrich replies with user details
        const enrichedReplies = await Promise.all(
          replies.map(async (reply) => {
            const replyUser = await Ufunc.getUserById({ id: reply.userId });
            return {
              ...reply,
              user: replyUser.data || null,
            };
          })
        );

        return {
          ...comment,
          user: commentUser.data || null,
          reply: enrichedReplies,
        };
      })
    );
    // Render the view with enriched data
    res.render("themeDetailadmin", {
      comment: enrichedComments,
      theme: themeWithDetails,
      lesson: lessons,
    });
  } catch (error) {
    //console.error("Error fetching theme details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.route("/updateCommentById/:commentId").post(async (req, res) => {
  const { commentId } = req.params;
  try {
    const commentData = req.body;
    const themeId = commentData.themeId;
    let response = await func.updateCommentById({ id: commentId, commentData });
    res.redirect(`/comment/getCommentByThemeId/${themeId}`)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.route("/teacher/updateCommentById/:commentId").post(async (req, res) => {
  const { commentId } = req.params;
  try {
    const commentData = req.body;
    const themeId = commentData.themeId;
    let response = await func.updateCommentById({ id: commentId, commentData });
    res.redirect(`/comment/teacher/getCommentByThemeId/${themeId}`)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.route("/delete/:themeId/:id").get(async (req, res) => {
  try {
    const commentId = req.params.id;
    const themeId = req.params.themeId;
    if (!commentId) {
      console.error("Invalid comment ID:", commentId);
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    const softDeleteResult = await func.softDelete({ id: commentId });

    if (softDeleteResult.status_code === "200") {
      res.redirect(`/comment/getCommentBythemeId/${themeId}`);
    } else {
      res.status(404).json({ error: "comment not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/teacher/delete/:themeId/:id").get(async (req, res) => {
  try {
    const commentId = req.params.id;
    const themeId = req.params.themeId;
    if (!commentId) {
      console.error("Invalid comment ID:", commentId);
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    const softDeleteResult = await func.softDelete({ id: commentId });

    if (softDeleteResult.status_code === "200") {
      res.redirect(`/comment/teacher/getCommentBythemeId/${themeId}`);
    } else {
      res.status(404).json({ error: "comment not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.route("/admin/delete/:themeId/:id").get(async (req, res) => {
  try {
    const commentId = req.params.id;
    const themeId = req.params.themeId;

    let notificationData;

    if (!commentId) {
      console.error("Invalid comment ID:", commentId);
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    const softDeleteResult = await func.softDelete({ id: commentId });

    if (softDeleteResult.status_code === "200") {

      const deletedData = softDeleteResult.data;

      notificationData = {
        themeId,
        commentId,
        reportType: "comment",
        userId: deletedData.userId,
        createType: 'delete',
        themeTitle: deletedData.title,
      };

      if (notificationData) {
        await Nfunc.createNotification(notificationData);
      }
      res.redirect(`/comment/admin/getCommentBythemeId/${themeId}`);
    } else {
      res.status(404).json({ error: "comment not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// router.route("/countComment/:id/:themeId").get(async (req, res) => {
//   try {
//     const {id, themeId} = req.params;
//     let response = await func.getCommentByUserId({userId: id, themeId});
//     const user = await Ufunc.getUserById({id});
//     console.log(response.data)
//     res.status(200).json({count: response.data.length, user: user.data});
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error });
//   }
// });

module.exports = router;

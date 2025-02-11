const express = require("express");
const router = express.Router();
const func = require("../function/report");
const Ufunc = require("../../user/function/user");
const Tfunc = require("../../theme/function/theme");
const Cfunc = require("../../comment/function/comment");
const Nfunc = require("../../notification/function/notification");
const Rfunc = require("../../reply/function/reply")

router.route("/createReport").post(async (req, res) => {
  try {
    const { reportType, themeId, commentId, replyId, reason, other, userId } = req.body;
    let report, notificationData;
    if (reportType === 'theme') {
      report = await Tfunc.reportThemeById({ id: themeId });
      const themeTitle = truncateText(report.data.title, 30);
      notificationData = {
        themeId,
        reportType,
        userId: report.data.userId,
        reason,
        other,
        themeTitle,
        createType: "report"
      };
    } else if (reportType === 'comment') {
      report = await Cfunc.reportCommentById({ id: commentId });

      notificationData = {
        themeId,
        commentId,
        reportType,
        userId: report.data.userId,
        reason,
        other,
        createType: "report"
      };
    } else if (reportType === 'reply') {
      report = await Rfunc.reportReplyById({ id: replyId });

      notificationData = {
        themeId,
        commentId,
        replyId,
        reportType,
        userId: report.data.userId,
        reason,
        other,
        createType: "report"
      };
    }

    if (notificationData) {
      await Nfunc.createNotification(notificationData);
    }

    // Call the createReport function to save the report
    const reportData = {
      userId,
      themeId,
      commentId,
      replyId,
      reportType,
      reason,
      other
    };
    await func.createReport(reportData);

    res.status(200).json({ message: 'Content was reported' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Utility function to truncate text
function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}


router.route("/").get(async (req, res) => {
  try {
    let response = await func.getReport();  // Fetch reports from the function
    const reports = response.data;          // Assuming response.data is an array of reports

    // Map through reports to enrich each report with theme, user, and comment data
    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        const getTheme = await Tfunc.getThemeById({ id: report.themeId });
        const getUser = await Ufunc.getUserById({ id: report.userId });
        const getComment = await Cfunc.getCommentById({ id: report.commentId });

        // Return the enriched report object
        return {
          ...report,
          theme: getTheme,   // Add theme data to the report
          user: getUser,     // Add user data to the report
          comment: getComment // Add comment data to the report
        };
      })
    );

    // Render the template with the enriched reports
    res.render("reportView", { reports: enrichedReports }); // Change "reportView" to your actual template name
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

router.route("/admin").get(async (req, res) => {
  try {
    const reportedTheme = await Tfunc.getReportedTheme();
    const reportedComment = await Cfunc.getReportedComment();
    const reportedReply = await Rfunc.getReportedReply();


    // Assuming that reportedTheme.data and reportedComment.data are arrays
    const reportedThemes = reportedTheme.data;
    const reportedComments = reportedComment.data;
    const reportedReplys = reportedReply.data;


    // Fetch detailed reports for all reported themes
    const themeReportPromises = reportedThemes.map(async theme => {
      const { data } = await func.getThemeReport({ themeId: theme._id });
      return {
        ...theme,
        reportDetails: { data } // Only include the `data` field from reportDetails
      };
    });

    // Fetch detailed reports for all reported comments
    const commentReportPromises = reportedComments.map(async comment => {
      const { data } = await func.getCommentReport({ commentId: comment._id });
      return {
        ...comment,
        reportDetails: { data } // Only include the `data` field from reportDetails
      };
    });

    // Fetch detailed reports for all reported reply
    const replyReportPromises = reportedReplys.map(async reply => {
      const { data } = await func.getReplyReport({ replyId: reply._id });
      return {
        ...reply,
        reportDetails: { data } // Only include the `data` field from reportDetails
      };
    });

    // Wait for all promises to resolve
    const themeReports = await Promise.all(themeReportPromises);
    const commentReports = await Promise.all(commentReportPromises);
    const replyReports = await Promise.all(replyReportPromises);

    res.render("reportList", {
      theme: themeReports,
      comment: commentReports,
      reply: replyReports
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});


module.exports = router;
const express = require("express");
const router = express.Router();
const func = require("../function/reply");
const Cfunc = require("../../comment/function/comment");
const Nfunc = require("../../notification/function/notification");

router.route("/:commentId").get(async (req, res) => {
    try {
        const { commentId } = req.params;
        const reply = await func.getByCommentId({ commentId });
        const data = reply.data;
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

router.route("/").post(async (req, res) => {
    try {

        const reply = await func.create(req.body);
        const replyData = reply.data;
        const comment = await Cfunc.getCommentById({ id: replyData.commentId });
        const commentData = comment.data;
        const notificationData = {
            themeId: replyData.themeId,
            commentId: replyData.commentId,
            replyId: replyData._id.toString(),
            reportType: "reply",
            userId: commentData.userId,
            themeTitle: replyData.title,
            createType: 'reply',
        };
        if (notificationData) {
              await Nfunc.createNotification(notificationData);
            }
        
        res.redirect(`/comment/getCommentByThemeId/${req.body.themeId}`)

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error })
    }
})

router.route("/:id").post(async (req, res) => {
    try {
        const { newContent } = req.body;
        const { id } = req.params;
        await func.updated({ id, newContent });

        res.redirect(`/comment/getCommentByThemeId/${req.body.themeId}`)
    } catch (error) {
        res.status(500).json({ error: error })
    }
})
router.route("/admin/checkedReport/:reportId").get(async (req, res) => {
    try {
        const { reportId } = req.params;
        await func.checkedReplyById({ id: reportId });
        res.redirect('/report/admin')
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.route("/delete/:id").get(async (req, res) => {
    try {

        const { id } = req.params;
        const softDelete = await func.softDelete({ id });
        const deletedData = softDelete.data
        res.redirect(`/comment/getCommentBythemeId/${deletedData.themeId}`);
    } catch (error) {
        res.status(500).json({ error: error })
    }
})
router.route("/teacher/delete/:id").get(async (req, res) => {
    try {

        const { id } = req.params;
        const softDelete = await func.softDelete({ id });
        const deletedData = softDelete.data
        res.redirect(`/comment/teacher/getCommentBythemeId/${deletedData.themeId}`);
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

router.route("/admin/delete/:id").get(async (req, res) => {
    try {
        let notificationData;
        const { id } = req.params;

        const softDelete = await func.softDelete({ id });
        const deletedData = softDelete.data

        notificationData = {
            themeId: deletedData.themeId,
            commentId: deletedData.commentId,
            replyId: deletedData._id.toString(),
            reportType: "reply",
            userId: deletedData.userId,
            themeTitle: deletedData.title,
            createType: 'delete',
        };

        if (notificationData) {
            await Nfunc.createNotification(notificationData);
        }
        res.redirect(`/comment/admin/getCommentBythemeId/${themeId}`);
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

module.exports = router;
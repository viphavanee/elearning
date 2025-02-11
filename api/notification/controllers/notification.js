const express = require("express");
const router = express.Router();
const func = require("../function/notification");
const Ufunc = require("../../user/function/user");

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Call the function and await the result
    const result = await func.getNotificationByUserId({ userId });
    const unread = result.data.filter((item) => !item.isRead);
    const count = unread.length;
    // Send the response with the result data and count
    res.status(200).json({ notifications: result.data, count });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});
router.get("/check/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Call the function and await the result
    const result = await func.readAllNotify({ userId });
    const user = await Ufunc.getUserById({ id: userId });
    const userData = user.data;
    if(userData.role === 'teacher'){
      res.redirect(`/classroom/teacher/${userId}`)
    }else if(userData.role === 'student'){
      res.redirect(`/classroom/std/${userId}`)
    }
    // Send the response with the result data
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

module.exports = router;

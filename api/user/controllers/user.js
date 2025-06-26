const express = require("express");
const router = express.Router();
const func = require("../function/user");

router.route("/createUser").post(async (req, res) => {
  try {
    let response = await func.createUser(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.route("/").get(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;  // Limit per page
    const skip = (page - 1) * limit;

    // Get search query
    const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';

    // Fetch the users
    let response = await func.getUsers();

    // Filter users based on search query
    let filteredUsers = response.data;
    if (searchQuery) {
      filteredUsers = response.data.filter(user => 
        user.firstname.toLowerCase().includes(searchQuery) ||
        user.lastname.toLowerCase().includes(searchQuery)
      );
    }

    // Apply pagination after filtering
    const totalUsers = filteredUsers.length;
    const user = filteredUsers.slice(skip, skip + limit);
    const totalPages = Math.ceil(totalUsers / limit);

    // Render page
    res.render("userList", {
      user,  
      currentPage: page,
      totalPages: totalPages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.route("/getUserById/:id").get(async (req, res) => {
  const { id } = req.params;
  try {
    let response = await func.getUserById({ id });
    res.render("profile", { user: response.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.route("/getstdcount/:roomCode").get(async (req, res) => {
  const { roomCode } = req.params;
  try {
    let response = await func.getUserByRoomCode({ roomCode });
    const count = response.data.length;
    res.status(200).json(count);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});
router.route("/getUserData/:id").get(async (req, res) => {
  const { id } = req.params;
  try {
    let response = await func.getUserById({ id });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.route("/updateUserById/:id").post(async (req, res) => {
  try {
    const id = req.params.id;
    const userData = req.body;
    let response = await func.updateUserById(id, userData);
    res.redirect(`/user/getUserById/${req.body.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});
router.route("/updateUserById/:id/admin").put(async (req, res) => {
  try {
    const id = req.params.id;
    const userData = req.body;
    let response = await func.updateUserById(id, userData);
    res.status(200).json({message: "ok"})
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});




router.route("/delete/:id").get(async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      console.error("Invalid user ID:", userId);
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const softDeleteResult = await func.softDelete({ id: userId });

    if (softDeleteResult.status_code === "200") {
      res.redirect('/user');
    } else {
      res.status(404).json({ error: "user not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

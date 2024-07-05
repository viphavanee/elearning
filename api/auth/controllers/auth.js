const func = require("../function/auth");
const express = require("express");
const router = express.Router();

router.route("/login").get(async (req, res) => {
    res.render("login");
});
router.route("/adminLogin").get(async (req, res) => {
    res.render("adminLogin");
});

router.post('/login/userChecked', async (req, res) => {
    try {
        let response = await func.userChecked(req.body);

        if (response.status_code === '200') {
            req.session.loggedIn = true; // Assuming you are using session middleware for session management
            const { token, redirect } = response;

            res.status(200).json({ token, redirect });
            // If you want to redirect on successful login
        } else {
            res.status(500).json({ error: response.message });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.route("/register").get((req, res) => {
    res.render("register");
});

router.route("/register").post(async (req, res) => {
    try {
        const { firstname, lastname, email, school, password, role, birthDate } = req.body;
        let selectedRole;
        if (role === 'student' || role === 'teacher') {
            selectedRole = role;
        } else {
            selectedRole = null;
        }
        const result = await func.register({
            firstname,
            lastname,
            email,
            school,
            password,
            role: selectedRole,
            birthDate
        });

        if (result.status_code === '200') {
            res.redirect('/login');
        } else {
            res.status(500).json({ error: result.message });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.route("/login/adminChecked").post(async (req, res) => {
    try {
        let response = await func.adminChecked(req.body);
        if (response.status_code === '200') {
            req.session.loggedIn = true;
            const { token, redirect } = response;

            res.status(200).json({ token, redirect });
        } else {
            res.status(500).json({ error: response.message });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

router.post("/logout", (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                res.status(500).send("Error logging out");
            } else {
                res.redirect("/");
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
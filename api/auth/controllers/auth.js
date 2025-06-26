const func = require("../function/auth");
const UFunc = require("../../user/function/user")
const bcrypt = require('bcrypt');
const express = require("express");
const router = express.Router();
const { sendEmailMessage } = require('../../../middleware/NodeMailler');

function generateRandomPassword() {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    // Generate 7 random characters
    for (let i = 0; i < 7; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    // Append a random digit
    const randomDigit = Math.floor(Math.random() * 10);
    password += randomDigit.toString();
    return password;
}


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
            res.status(200).json({ message: "Registration successful" });
          } else {
            res.status(400).json({ error: result.message });
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Internal server error" });
        }
});

router.get("/check-email", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "กรุณาระบุอีเมล" });

    const result = await func.emailChecked(email);
    return res.status(result.status_code).json(result);
  } catch (error) {
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการตรวจสอบอีเมล" });
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
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.route("/profile/:id").get(async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UFunc.getUserById({ id });
        const userData = user.data;
        res.render("profile", { user: userData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.route("/forget").get(async (req, res) => {
    res.render("forget-password");
});

router.route("/forget").post(async (req, res) => {
    const { email } = req.body; // Ensure req.body contains the 'email' field
    try {
        const response = await UFunc.getUserByEmail({ email });

        if (response.status_code !== "200") {
            return res.status(401).json({ message: 'อีเมลไม่ถูกต้องหรือไม่พบอีเมลของคุณในระบบ' });
        }

        const newPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const emailSubject = 'Reset Password';

        // Generate HTML content for the email
        const emailMessage = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #4CAF50; text-align: center;">รหัสผ่านใหม่ของคุณ</h2>
                <p style="font-size: 16px;">สวัสดี,</p>
                <p>นี่คือรหัสผ่านใหม่ของคุณ:</p>
                <div style="text-align: center; margin: 20px 0;">
                    <span style="font-size: 18px; font-weight: bold; color: #ff5722;">${newPassword}</span>
                </div>
                <p>กรุณาเปลี่ยนรหัสผ่านทันทีหลังจากเข้าสู่ระบบเพื่อความปลอดภัยของคุณ</p>
                <p style="font-size: 14px; color: #777;">หากคุณไม่ได้ร้องขอการเปลี่ยนรหัสผ่าน โปรดติดต่อฝ่ายสนับสนุนทันที</p>
                <hr style="border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    ขอบคุณที่ใช้บริการของเรา<br>© 2024 STD<span style="font-size: 12px;">s</span> E-learning.
                </p>
            </div>
        `;

        await sendEmailMessage(email, emailSubject, emailMessage, true);

        await func.resetPassword({ email, hashedPassword });
        return res.status(200).json({ message: 'รหัสผ่านใหม่ถูกส่งแล้ว โปรดตรวจสอบอีเมลของคุณ' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'มีข้อผิดพลาดเกิดขึ้น', error: error.message });
    }
});

router.route("/change-password").get(async (req, res) => {
    res.render("changePassword");
});

router.route("/change-password/:userId").post(async (req, res) => {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const check = await func.passwordChecked({ id: userId, oldPassword });

        if (check.status_code === 404) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (check.status_code === 401) {
            return res.status(401).json({ error: 'รหัสผ่านเดิมไม่ถูกต้อง' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await func.changePassword({ id: userId, hashedPassword });

        res.status(200).json({ message: 'รหัสผ่านเปลี่ยนแปลงแล้ว คุณต้องเข้าสู่ระบบอีกครั้ง' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
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
let router = require('express').Router()
router.use("/auth", require("../api/auth/routes.js"))
router.use("/quiz", require("../api/quiz/routes.js"))
router.use("/user", require("../api/user/routes.js"))

module.exports = router
let router = require('express').Router()

router.use("/", require("../api/auth/routes.js"))
router.use("/quizAdmin", require("../api/quiz/routes.js"))
router.use("/user", require("../api/user/routes.js"))
router.use("/admin", require("../api/admin/routes.js"))
router.use("/teacher", require("../api/teacher/routes.js"))
router.use("/lesson", require("../api/lesson/routes.js"))
router.use("/classroom", require("../api/classroom/routes.js"))
router.use("/theme", require("../api/theme/routes.js"))
router.use("/question", require("../api/question/routes.js"))
router.use("/attempt", require("../api/attempt/routes.js"))
router.use("/attemptDetail", require("../api/attemptDetail/routes.js"))
router.use("/newsAdmin", require("../api/news/routes.js"))

module.exports = router
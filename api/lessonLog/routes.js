const express = require("express")
const router = express.Router()
router.use(require('./controllers/lessonLog'))

module.exports = router
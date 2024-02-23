const express = require("express")
const router = express.Router()
router.use(require('./controllers/quiz'))

module.exports = router
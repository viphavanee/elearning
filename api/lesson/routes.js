const express = require("express")
const router = express.Router()
router.use(require('./controllers/lesson'))

module.exports = router
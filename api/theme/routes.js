const express = require("express")
const router = express.Router()
router.use(require('./controllers/theme'))

module.exports = router
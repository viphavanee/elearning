const express = require("express")
const router = express.Router()
router.use(require('./controllers/progress'))

module.exports = router
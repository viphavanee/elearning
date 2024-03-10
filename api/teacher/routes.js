const express = require("express")
const router = express.Router()
router.use(require('./controllers/teacher'))

module.exports = router
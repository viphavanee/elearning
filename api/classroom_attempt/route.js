const express = require("express")
const router = express.Router()
router.use(require('./controller/classRoom_attempt'))

module.exports = router
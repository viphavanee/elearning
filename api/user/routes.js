const express = require("express")
const router = express.Router()
router.use(require('./controllers/user'))

module.exports = router
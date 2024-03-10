const express = require("express")
const router = express.Router()
router.use(require('./controllers/classroom'))

module.exports = router
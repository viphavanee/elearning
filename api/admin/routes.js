const express = require("express")
const router = express.Router()
router.use(require('./controllers/admin'))

module.exports = router
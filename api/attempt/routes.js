const express = require("express")
const router = express.Router()
router.use(require('./controllers/attempt'))

module.exports = router
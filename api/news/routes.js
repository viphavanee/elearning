const express = require("express")
const router = express.Router()
router.use(require('./controllers/news'))

module.exports = router
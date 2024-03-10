const express = require("express")
const router = express.Router()
router.use(require('./controllers/question'))

module.exports = router
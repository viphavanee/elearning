const express = require("express")
const router = express.Router()
router.use(require('./controllers/comment'))

module.exports = router
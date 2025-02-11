const express = require("express")
const router = express.Router()
router.use(require('./controllers/report'))

module.exports = router;
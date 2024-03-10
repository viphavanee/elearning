const express = require("express")
const app = express()
const bodyParser = require("body-parser")
global.moment = require('moment')
const morgan = require("morgan")
require("dotenv").config()
const port = parseInt(process.env.PORT)
const jwt = require("express-jwt")
const session = require('express-session');
const compression = require('compression')
const cors = require("cors")
const fs = require("fs")
const path = require('path');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
app.use(session({
    secret: "node secret",
    resave: false,
    saveUninitialized: false
}));
app.use("*", (req, res, next) => {
    loggedIn = req.session.userId
    next()
})
app.use(compression())
app.use(
    morgan(
        ":method :url [:date[clf]] :status :res[content-length] - :response-time ms"
    )
)
global.router = express.Router()
let servers = app.listen(port, function (err) {
    if (err) {
        console.log("somthing went wrong", err)
    } else {
        console.log("Server is listening on port " + port)
    }
})
servers.setTimeout(parseInt(process.env.TIMEOUT))
global.privateKeyPath = __dirname + "/middleware/PrivateKey.key"
const privateKey = fs.readFileSync(privateKeyPath, { encoding: "utf8" });
app.use(cors())
app.use("/public", express.static("public"))
app.use(
    bodyParser.urlencoded({
        limit: "20mb",
        extended: true
    })
)
app.use(bodyParser.json({
    limit: "20mb"
}))

app.get("/", function (req, res, next) {
    res.render('login');
})


app.use(require('./router'))
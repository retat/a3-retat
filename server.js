const express = require('express'),
    app = express(),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bodyParser = require('body-parser'),
    session = require('express-session')
//todo put into DB!
const appdata = []
const users = [{"username": "rene", "password": "password"}]
passport.serializeUser((user, done) => done(null, user.username))
passport.deserializeUser((username, done) => {
    const user = users.find(u => u.username === username)
    console.log('deserializing:', username)
    if (user !== undefined) {
        done(null, user)
    } else {
        done(null, false, {message: 'user not found; session not restored'})
    }
})
passport.use('local-login', new LocalStrategy(
    function (username, password, done) {
        getUserFromDB(username)
        if (username === users[0].username && password === users[0].password) {
            return done(null, users[0])
        } else {
            return done(null, false, {"message": "User not found."})
        }
    })
)
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(session({
    //todo put secret in db
    secret: "tHiSiSasEcRetStr",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next()
    res.redirect("/")
}

function getUserFromDB(username) {
    const url = "mongodb+srv://root:admin@cluster0-qdoiu.azure.mongodb.net/test?retryWrites=true&w=majority"
    const mongo = require('mongodb').MongoClient
    let user
    mongo.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err, client) => {
        if (err) {
            console.error(err)
            return
        }
        const db = client.db('AssignmentApp')
        const collection = db.collection('user')
        collection.find({}).toArray((err, items) => {
            console.log(items[0])
        })
    })
}

app.get("/home", isLoggedIn, function (req, res) {
    res.sendFile(__dirname + "/public/home.html")
})
app.post("/login",
    passport.authenticate("local-login", {failureRedirect: "/login"}),
    function (req, res) {
        res.redirect("/home")
    })
app.get("/logout", function (req, res) {
    req.logout()
    res.redirect("/")
})

app.post('/submit', isLoggedIn, function (request, response) {
    let parsedData = request.body
    appdata.push({'Note': parsedData.Note, 'Date': createDate(parsedData.Date), 'Days': daysRemaining(parsedData.Date)})
    response.writeHead(200, {"Content-Type": "application/json"})
    response.end(JSON.stringify(appdata))
})

app.post('/refresh', isLoggedIn, function (request, response) {
    response.writeHead(200, {"Content-Type": "application/json"})
    response.end(JSON.stringify(appdata))
})

app.post('/delete', isLoggedIn, function (request, response) {
    let parsedData = request.body
    let item = parsedData.Item
    console.log("trying to delete " + item)
    appdata.splice(item - 1, 1)
    response.writeHead(200, {"Content-Type": "application/json"})
    response.end(JSON.stringify(appdata))
})

function createDate(date) {
    let options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}
    let dateArray = date.split('-')
    return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).toLocaleDateString("en-US", options)
}

function daysRemaining(date) {
    let dateArray = date.split('-')
    const diffTime = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).getTime() - new Date().getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    console.log("Days: " + diffDays)
    return diffDays
}

// launch the app
app.listen(3000)
console.log("App running at localhost:3000")

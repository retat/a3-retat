const express = require('express'),
    app = express(),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bodyParser = require('body-parser'),
    session = require('express-session'),
    mongodb = require('mongodb'),
    mongo = require('mongodb').MongoClient,
    bcrypt = require('bcrypt'),
    url = "mongodb+srv://root:admin@cluster0-qdoiu.azure.mongodb.net/test?retryWrites=true&w=majority"

let currentUser = []

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

passport.serializeUser((user, done) => done(null, currentUser[0].username))
passport.deserializeUser((username, done) => {
    if (currentUser[0] !== undefined) {
        done(null, currentUser[0])
    } else {
        done(null, false, {message: 'user not found; session not restored'})
    }
})
passport.use('local-login', new LocalStrategy(
    function (username, password, done) {
        new Promise(function (resolve, reject) {
            mongo.connect(url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }, (err, client) => {
                if (err) {
                    reject(err)
                }
                const db = client.db('AssignmentApp')
                const collection = db.collection('user')
                collection.find({"username": username}).toArray((err, items) => {
                    resolve(items)
                })
            })
        }).then(function (result) {
            if (typeof result[0] == 'undefined') {
                return done(null, false, {"message": "Wrong username"})
            } else {
                currentUser = result
                bcrypt.compare(password, result[0].password, function (err, res) {
                    if (res) {
                        return done(null, result[0])
                    } else {
                        return done(null, false, {"message": "Password incorrect"})
                    }
                })
            }
        }, function (err) {
            return done(null, false, {"message": "User not found."})
        })
    })
)

app.get("/home", isLoggedIn, function (req, res) {
    res.sendFile(__dirname + "/public/home.html")
})

app.get("/register", function (req, res) {
    res.sendFile(__dirname + "/public/register.html")
})

app.post("/register", function (req, res) {
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        new Promise(function (resolve, reject) {
            mongo.connect(url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }, (err, client) => {
                if (err) {
                    reject(err)
                }
                const db = client.db('AssignmentApp')
                const collection = db.collection('user')
                collection.insertOne({
                    "username": req.body.username,
                    "password": hash
                }).then(r => res.redirect("/"))
            })
        })
    })
})

app.post("/login",
    passport.authenticate("local-login", {failureRedirect: "/"}),
    function (req, res) {
        res.redirect("/home")
    })
app.get("/logout", function (req, res) {
    req.logout()
    res.redirect("/")
})

app.post('/submit', isLoggedIn, function (request, response) {
    let parsedData = request.body
    new Promise(function (resolve, reject) {
        mongo.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, client) => {
            if (err) {
                reject(err)
            }
            const db = client.db('AssignmentApp')
            const collection = db.collection('data')
            collection.insertOne({
                "Note": parsedData.Note,
                "Date": createDate(parsedData.Date),
                "Days": daysRemaining(parsedData.Date),
                "UID": currentUser[0]._id
            }).then(r => collection.find({"UID": currentUser[0]._id}).toArray((err, items) => {
                resolve(items)
            }))
        })
    }).then(function (result) {
        response.send(JSON.stringify(result))
    })
})

app.post('/refresh', isLoggedIn, function (request, response) {
    new Promise(function (resolve, reject) {
        mongo.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, client) => {
            if (err) {
                reject(err)
            }
            const db = client.db('AssignmentApp')
            const collection = db.collection('data')
            collection.find({"UID": currentUser[0]._id}).toArray((err, items) => {
                resolve(items)
            })
        })
    }).then(function (result) {
        response.send(JSON.stringify(result))
    })
})

app.post('/update', isLoggedIn, function (request, response) {
    let parsedData = request.body
    new Promise(function (resolve, reject) {
        mongo.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, client) => {
            if (err) {
                reject(err)
            }
            const db = client.db('AssignmentApp')
            const collection = db.collection('data')
            collection.updateOne({
                _id: new mongodb.ObjectID(parsedData.Id)
            }, {
                $set: {
                    "Note": parsedData.Note,
                    "Date": createDate(parsedData.Date),
                    "Days": daysRemaining(parsedData.Date)
                }
            }).then(r => collection.find({"UID": currentUser[0]._id}).toArray((err, items) => {
                resolve(items)
            }))
        })
    }).then(function (result) {
        response.send(JSON.stringify(result))
    })
})

app.post('/delete', isLoggedIn, function (request, response) {
    let parsedData = request.body
    let item = parsedData.Item
    new Promise(function (resolve, reject) {
        mongo.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, client) => {
            if (err) {
                reject(err)
            }
            const db = client.db('AssignmentApp')
            const collection = db.collection('data')
            collection.removeOne({
                _id: new mongodb.ObjectID(item)
            }).then(r => collection.find({"UID": currentUser[0]._id}).toArray((err, items) => {
                resolve(items)
            }))
        })
    }).then(function (result) {
        response.send(JSON.stringify(result))
    })
})

app.post('/username', isLoggedIn, function (request, response) {
    response.send(JSON.stringify(currentUser[0].username))
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

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next()
    res.redirect("/")
}

// launch the app
app.listen(3000)
console.log("App running at localhost:3000")

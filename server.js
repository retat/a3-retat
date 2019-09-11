const express         = require('express'),
      app             = express(),
      passport        = require('passport'),
      LocalStrategy   = require('passport-local').Strategy,
      bodyParser      = require('body-parser'),
      session         = require('express-session'),
      mime = require( 'mime' ),
      fs   = require( 'fs' ),
      router = express.Router(),
      appdata     = []

const users = [{"id":111, "username":"rene", "password":"password"}];

// passport needs ability to serialize and unserialize users out of session
passport.serializeUser(function (user, done) {
    done(null, users[0].id);
});
passport.deserializeUser(function (id, done) {
    done(null, users[0]);
});

// passport local strategy for local-login, local refers to this app
passport.use('local-login', new LocalStrategy(
    function (username, password, done) {
        if (username === users[0].username && password === users[0].password) {
            return done(null, users[0]);
        } else {
            return done(null, false, {"message": "User not found."});
        }
    })
            );

app.use(express.static( 'public' ) )
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "tHiSiSasEcRetStr",
    resave: true,
    saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect("/login")
}
// api endpoints for login, content and logout
app.get("/login", function (req, res) {
    res.send("<p>Please login!</p><form method='post' action='/login'><input type='text' name='username'/><input type='password' name='password'/><button type='submit' value='submit'>Submit</buttom></form>");
});
app.post("/login", 
         passport.authenticate("local-login", { failureRedirect: "/login"}),
         function (req, res) {
    res.redirect("/");
});
app.get("/logout", function (req, res) {
    req.logout();
    res.send("logout success!");
});

app.post( '/submit', isLoggedIn, function( request, response ) {
    let parsedData = request.body
    appdata.push({ 'Note': parsedData.Note, 'Date': createDate(parsedData.Date), 'Days': daysRemaining(parsedData.Date)})
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify(appdata))
})

app.post( '/refresh', isLoggedIn, function( request, response ) {
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify(appdata))
})

app.post( '/delete', isLoggedIn, function( request, response ) {
    let parsedData = request.body
    let item = parsedData.Item
    console.log("trying to delete " + item)
    appdata.splice(item-1, 1)
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify(appdata))
})

function createDate(date){
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let dateArray = date.split('-')
    return new Date(dateArray[0], dateArray[1]-1, dateArray[2]).toLocaleDateString("en-US", options)
}

function daysRemaining(date){
    let dateArray = date.split('-')
    const diffTime = new Date(dateArray[0], dateArray[1]-1, dateArray[2]).getTime() - new Date().getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))+1
    console.log("Days: " + diffDays)
    return diffDays
}
const sendFile = function( response, filename ) {
    const type = mime.getType( filename )

    fs.readFile( filename, function( err, content ) {

        // if the error = null, then we've loaded the file successfully
        if( err === null ) {

            // status code: https://httpstatuses.com
            response.writeHeader( 200, { 'Content-Type': type })
            response.end( content )

        }else{

            // file not found, error code 404
            response.writeHeader( 404 )
            response.end( '404 Error: File Not Found' )

        }
    })
}

// launch the app
app.listen(3000);
console.log("App running at localhost:3000");
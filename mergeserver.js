const express    = require('express'),
      app        = express(),
      bodyparser = require( 'body-parser' ),
      appdata     = []

// automatically deliver all files in the public folder
// with the correct headers / MIME type.
app.use( express.static( 'public' ) )
app.use( bodyparser.json() )
// get json when appropriate

// even with our static file handler, we still
// need to explicitly handle the domain name alone...
app.get('/', function(request, response) {
    response.sendFile( __dirname + '/index.html' )
})

app.post( '/submit', function( request, response ) {
    let parsedData = request.body
    appdata.push({ 'Note': parsedData.Note, 'Date': createDate(parsedData.Date), 'Days': daysRemaining(parsedData.Date)})
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify(appdata))
})

app.post( '/refresh', function( request, response ) {
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify(appdata))
})

app.post( '/delete', function( request, response ) {
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

app.listen( 3000 )
//
//  Router/Filter for cp-web
//  2016-04-28 by Vincent Lao
//


var req_handler = require('./lib/req_handler.js');
var file_io = require('./lib/file_io.js');
var conf = require('./lib/config.js');

//======================================================
//======================================================
//    Settings
//======================================================
//======================================================

var SERVER_IP = '0.0.0.0';

// Temporary, change as necessary
//var HTTP_ACCESS_PORT = 4433;		
//var HTTPS_ACCESS_PORT = 4434;

//var SERVER_KEY_FILE = 'server.key';
//var SERVER_CERT_FILE = 'server.crt';

//======================================================
//======================================================
//    Initializations
//======================================================
//======================================================

var express = require("express");
var app = express();
/*
var https = require('https');
var https = require('http');
var fs = require('fs');
*/
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))


var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

app.use(allowCrossDomain);

//======================================================
//======================================================
//    APIs
//======================================================
//======================================================
	
app.get("/",function(req,res) {
	res.type('text/plain');
	res.send("Hello! CP Web Router here.");
});

app.post("/",function(req,res) {
	res.type('text/plain');
	res.send("Hello! CP Web Router here.");
});


//======================================================

app.get("/chain", function(req,res) {
	req_handler.call_peer_get(req, res, "/chain");
});


app.get("/chain/blocks/:Block", function(req,res) {
	req_handler.call_peer_get(req, res, "/chain/blocks/" + req.params.Block);
});


app.get("/transactions/:UUID", function(req,res) {
	req_handler.call_peer_get(req, res, "/transactions/" + req.params.UUID);
});

//======================================================

// Deprecated APIs
app.post("/devops/deploy", function(req,res) {
	req_handler.call_peer_post(req, res, "/devops/deploy");
});

app.post("/devops/invoke", function(req,res) {
	req_handler.call_peer_post(req, res, "/devops/invoke");
});

app.post("/devops/query", function(req,res) {
	req_handler.call_peer_post(req, res, "/devops/query");
});

//======================================================

app.post("/chaincode", function(req,res) {
	req_handler.call_peer_post(req, res, "/chaincode");
	// Do not return anything yet because the call is asynchronous, we send the response in the callback
});

//======================================================

app.post("/registrar", function(req,res) {
	req_handler.call_peer_post(req, res, "/registrar");
	// Do not return anything yet because the call is asynchronous, we send the response in the callback
});

app.delete("/registrar/:enrollmentID",function(req,res) {
	res.type('text/plain');
	res.send("Delete not supported yet. Cannot delete " + req.params.enrollmentID);
});

app.get("/registrar/:enrollmentID",function(req,res) {
	req_handler.call_peer_get(req, res, "/registrar/" + req.params.enrollmentID);
});

app.get("/registrar/:enrollmentID/ecert",function(req,res) {
	req_handler.call_peer_get(req, res, "/registrar/" + req.params.enrollmentID + "/ecert");
});

app.get("/registrar/:enrollmentID/tcert",function(req,res) {
	req_handler.call_peer_get(req, res, "/registrar/" + req.params.enrollmentID + "/tcert");
});


//======================================================

app.get("/network/peers",function(req,res) {
	//Network peers method
	req_handler.call_peer_get(req, res, "/network/peers");
});

//======================================================

app.post("/createwallet", function(req,res) {
	req_handler.call_peer_post(req, res, "/createwallet");
	// Do not return anything yet because the call is asynchronous, we send the response in the callback
});

//======================================================

// Helper APIs

app.get("/addUser/:User", function(req,res) {
	req_handler.call_registerUser(req, res, req.params.User);
});

app.get("/addUser/:User/:IP", function(req,res) {
	req_handler.call_registerUserIP(req, res, req.params.User, req.params.IP);
});


//======================================================
//======================================================
//   Deploy and listen
//======================================================
//======================================================

/*
var options = {
				key  : fs.readFileSync(SERVER_KEY_FILE),
				cert : fs.readFileSync(SERVER_CERT_FILE)
			};
http.createServer(app).listen(HTTP_ACCESS_PORT);
https.createServer(options, app).listen(HTTPS_ACCESS_PORT);\
*/


var server = app.listen(conf.HTTP_ACCESS_PORT, function () {
  var host = server.address().address
  var port = server.address().port

  // Create map file if it doesn't exists
  req_handler.prepare_file();
  
  console.log("App listening at http://%s:%s", host, port)
})



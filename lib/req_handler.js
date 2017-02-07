//
//
// Module for handling requests: POST, GET
// 2016-04-29 by Vincent Lao
//
//

var file_io = require('./file_io.js');
var logger = require('./logger.js');
var conf = require('./config.js');


//======================================================
//======================================================
//    Utility functions
//======================================================
//======================================================

module.exports = {
	
	prepare_file() {
		file_io.createFile();
	},	//	prepare_file

	
	send_json_req_post: function (targetURL, requestData, resobj) {
		logger.debug(">>> send_json_req_post");
		logger.debug(targetURL);
		logger.debug(requestData);
		
		var request = require('request');
		// Set the headers
		var reqheaders = {
							'Content-Type': 'application/json'
						};

		// Configure the request
		var options = {
			url: targetURL,
			method: 'POST',
			json:true,
			headers: reqheaders,
			proxy: null,					// To make it work in local network, proxy mess-up the destination
			body: JSON.parse(requestData)	// convert string to JSON format first
		};
		
		var callback = function (error, response, body) {
							if (!response) {
								resobj.status(444).send("No response");
								return
							}
								
							if (!error && response.statusCode == 200) {
								// Display and send the response body
								logger.log("Response: " + response)
								resobj.status(response.statusCode).send(response.body);
							}
							else {
								if (response) {
									logger.error("Request failed: " + response.statusCode);
									logger.error(response);
									
									resobj.status(response.statusCode).send(response.body);
								}
								else
									resobj.status(444).send("No response");
							}
						}
		 
		// Start the request
		var req_result = request(options, callback);
		
		logger.debug("<<< send_json_req_post");
		
		// No response yet, because our call is asynchronous
	},	// send_json_req_post
	
	
	send_json_req_get: function (targetURL, requestData, resobj) {
		logger.debug(">>> send_json_req_post");
		logger.debug(targetURL);
		logger.debug(requestData);
		
		
		var request = require('request');
		// Set the headers
		var reqheaders = {
							'Content-Type': 'application/json'
						};

		// Configure the request
		var options = {
			url: targetURL,
			method: 'GET',
			json:true,
			headers: reqheaders,
			proxy: null,					// To make it work in local network, proxy mess-up the destination
			body: JSON.parse(requestData)	// convert string to JSON format first
		};
		
		var callback = function (error, response, body) {
							if (!response) {
								resobj.status(444).send("No response");
								return
							}
							
							if (!error && response.statusCode == 200) {
								// Print out the response body
								logger.log("Response: " + response)
							}
							else {
								logger.error("Request failed: " + response.statusCode);
								logger.error(response);
							}
							
							resobj.status(response.statusCode).send(response.body);
						}
		 
		// Start the request
		var req_result = request(options, callback);
		
		logger.debug("<<< send_json_req_get");
		
	},	// send_json_req_post
	
	//
	// Add an entry in the map list if it doesn't exists
	//
	register_user: function (userID) {
		var dest_URL = "";
		
		logger.debug(">> Register user: " + userID);
		dest_URL = file_io.get_user_IP(userID)
		logger.debug("URL: " + dest_URL);
		return(dest_URL);
	},	// register_user
	
	//
	// Add user and IP
	//
	register_user_ip: function (userID, ipPort) {
		file_io.store_user_IP(userID, ipPort);
		logger.debug(">> Add user: " + userID + " IP:Port: " + ipPort );
	},	// register_User_IP


	//
	// Call destination page/API
	// 
	call_peer_post: function (request, responseobj, api_function) {
		logger.debug(">>> call peer post: " + api_function);
				
		if (request.method == 'POST') {
			var body = request.body;
			
			//logger.log(">>>>>>Body:>>>>> " + body);
			
			if (body==null)
				logger.error(">>>>>>>>>Body is empty");
							
			// Get enroll ID
			var requestData = JSON.stringify(body);
			
			//logger.log(">>>>>>>>>>Request data: " + requestData);
			
			var obj = JSON.parse(requestData);
			var enrollID = obj.enrollId;	// Read top-level enrollID
			var params = obj.params;
			var secureContext;
			var target_IP_port = "";
			if (enrollID != null) {
				target_IP_port = this.register_user(enrollID);
				logger.log("Get Destination from enrollID");
			}
			else {
				if (params != null) {
					secureContext = params.secureContext;
				
					if (secureContext != null) {
						target_IP_port = this.register_user(secureContext);
						logger.log("Get destination from secureContext: " + secureContext);
					}
					else {
						target_IP_port = conf.DEFAULT_URL;
						logger.log("No target defined, use default destination");
					}
				}
				else {
					target_IP_port = conf.DEFAULT_URL;
					logger.log("No target defined, use default destination");
				}
			}
			var target_url = target_IP_port + api_function;
			logger.log("Enroll ID: " + enrollID);
			logger.log("Destination " + target_url);
			this.send_json_req_post(target_url, requestData, responseobj);
		}	// request
		
		logger.debug("<<< call peer post");

	},	// call_peer_post


	//
	// Call GET request API
	//
	call_peer_get: function (request, responseobj, api_function) {
		logger.debug(">>> call peer get: " + api_function);
				
		if (request.method == 'GET') {
			var body = request.body;
			var requestData = JSON.stringify(body);
			var target_url = conf.DEFAULT_URL + api_function;
			
			
			this.send_json_req_get(target_url, requestData, responseobj);
		}

		logger.debug("<<< call peer get");
	},	//call_peer_get
	
	
	//
	// Add User-Peer pre-assignment
	//
	call_registerUser: function (request, responseobj, enrollID) {
		this.register_user(enrollID);
		responseobj.send("ID: " + enrollID + " added.");
	},	// call_addUser
	
	
	call_registerUserIP: function (request, responseobj, enrollID, destIP) {
		this.register_user_ip(enrollID, destIP);
		responseobj.send("ID: " + enrollID + " added.");
	}	// call_registerUserIP

};

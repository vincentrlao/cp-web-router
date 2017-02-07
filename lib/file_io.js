//
//
// Module for file I/O and user mapping
// 2016-04-29 by Vincent Lao
//
//

// file I/O

var fs = require('fs');
var logger = require('./logger.js');
var conf = require('./config.js');

var err;

module.exports =  {

	//
	// Create file if it does not exists
	//
	createFile: function() {
		fs.access(conf.STORAGE_FILE, fs.F_OK, function(err) {
			if (err) {
				// It isn't accessible
				logger.log(conf.STORAGE_FILE + " created.");
				fs.writeFile(conf.STORAGE_FILE, "");
			}
		});
	},	//createFile

	
	// 
	// Append line to data file
	//
	append_string_to_file: function (lineToAppend) {
		logger.debug(">> append_string_to_file");
		fs.appendFile(conf.STORAGE_FILE, lineToAppend + '\n', function (err) {
			if (err != null)
				logger.log("Cannot append to file error for: " + err + " - " + lineToAppend);
		});
	},	// append_string_to_file
	
	//
	// Replace a specified string in the data file
	//
	replace_string_in_file: function (old_string, new_string) {
		logger.debug(">> replace_string_in_file");
		fs.readFile(conf.STORAGE_FILE, 'utf8', function (err,data) {
				if (err) {
					logger.error(err);
				}
				var result = data.replace(old_string, new_string);

				fs.writeFile(conf.STORAGE_FILE, result, 'utf8', function (err) {
					if (err) 
						logger.error(err);
				});
			});
	},	// replace_string_in_file
	
	//
	// Append key-value pair if key does not exists or replace the value of existing key
	//
	append_replace_key_value_file: function (key, value) {
		var userExists = 0;
		var lineToReplace = "";
		var json_string = '{"' + key + '":"' + value + '"}';
		
		logger.debug(">> Replace " + key + " value if exists else append info");
		
		// get line first
		fs.readFileSync(conf.STORAGE_FILE).toString().split('\n').forEach(
			function (line) { 
				logger.log(line);
				//Try to find match
				if (line != "") {
					JSON.parse(line, function(k, v) {
						logger.log(k);
						if (k == key) {
							userExists = 1;
							logger.log("User " + key + " already exists, replace info");
							lineToReplace = line;
						}
					});
				}
			});
		
		if (userExists) {
			this.replace_string_in_file(lineToReplace, json_string);
		} 
		else {
			this.append_string_to_file(json_string);
		}
		
	},	// append_replace_key_value_file
	

	//
	// Check if user already exists in the map file
	//
	user_exists: function (userID) {
		logger.debug(">> " + userID + " exists? ");
		//check user exists in table
		
		var userExists = 0;
		
		fs.readFileSync(conf.STORAGE_FILE).toString().split('\n').forEach(
			function (line) { 
				logger.log(line);
				//Try to find match
				if (line != "") {
					JSON.parse(line, function(k, v) {
						logger.log(k);
						if (k == userID) {
							userExists = 1;
							logger.log("User " + userID + " already exists");
						}
					});
				}
			});
		return(userExists);
			
	},	// user_exists
	
	//
	// Get number of users (lines)
	//
	get_num_userID: function () {
		var count = 0;
		
		logger.debug(">> get_num_user_ID");
		
		fs.readFileSync(conf.STORAGE_FILE).toString().split('\n').forEach(
			function (line) { 
				if (line != "")
					count++;
			}
		);
		
		return(count);
		
	},	// get_num_userID
	
	// 
	// Get next available IP
	//
	get_next_available_IP: function() {
		var nextIP = "";

		var num_user = this.get_num_userID();
		nextIP = conf.PEER_LIST[num_user % conf.NUM_PEERS];
		
		logger.debug("Next available IP: " + nextIP);
		return (nextIP);
	},	// get_next_available_IP
	
	//
	// Get next available IP and assign to user.
	// Also creates an entry in mapping file.
	//
	assign_user_IP: function (userID) {
		var IP="";
		var next_IP="";
		//assign userID to IP, store to table then return IP
		logger.debug(">> assign_user_IP: Assign user to next IP in list (Get next available)");
		
		if ((userID == "")||(userID == null))
			return(IP);	// return ""
		
		if (conf.IGNORE_PEER_LIST) {
			next_IP = conf.DEFAULT_URL;
		}
		else {
			next_IP = this.get_next_available_IP();
		}
		logger.debug("Call append file");
		this.append_replace_key_value_file(userID, next_IP);
		IP = next_IP;

		return(IP);
	},	//assign_user_IP
	

	//
	// Get IP and port assigned to user.
	// If record for user does not exists, create a new entry and automatically assign a new IP:Port
	//
	get_user_IP: function (userID) {
		
		logger.debug(">> get_user_IP");
		
		var user_IP = "";
		
		if ((userID == null)||(userID == ""))	
			return(user_IP);	//return ""
		
		if (this.user_exists(userID) == 1) {
			// File exists, next get IP
			fs.readFileSync(conf.STORAGE_FILE).toString().split('\n').forEach(
				function (line) { 
					logger.log(line);
					//Try to find match
					if (line != "") {
						JSON.parse(line, function(k, v) {
							logger.log(k);
							if (k == userID) {
								user_IP = v;
								logger.log("User: " + userID + "  IP: " + user_IP);
							}
						});
					}
				});
			return(user_IP);
		}
		else {
			user_IP = this.assign_user_IP(userID);
			return(user_IP);
		}
					
	},	//get_user_IP
	
	
	store_user_IP: function (userID, ipPort) {
		var desturl = "http://" + ipPort;
		
		this.append_replace_key_value_file(userID, desturl);
	}	//store_user_IP

};


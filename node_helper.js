var NodeHelper = require("node_helper");
const https = require('https');

module.exports = NodeHelper.create({
	start: function() {
		
	},
	
	reload: function(refConfig) {
		var self=this;
		var i = 1;
		var ids ="[";
		for (var c in refConfig.sensors) {
			var sensor = refConfig.sensors[c];
			ids =  ids + '"'+sensor.idx+'"';
			if (i<refConfig.sensors.length) {
				ids = ids + ',';
			}
			i++;
		}
		var postData = '{"jsonrpc": "2.0", "id": "1000", "method": "cmd::execCmd", "params": {"apikey": "';
		postData = postData + refConfig.jeedomAPIKey+'", "id": ' + ids + ']}}';

		var options = {
		  hostname: refConfig.jeedomURL,
		  port: refConfig.jeedomPORT,
		  path: refConfig.jeedomAPIPath,
		  method: 'POST',
		  headers: {
		    'Content-Type': 'application/x-www-form-urlencoded',
		    'Content-Length': Buffer.byteLength(postData)
		 }
		};
		
		var req = https.request(options, (res) => {
		  res.setEncoding('utf8');
		  res.on('data', (chunk) => {
		    self.sendSocketNotification("RELOAD_DONE",JSON.parse(chunk));
		  });
		  res.on('end', () => {
			
		  });
		  req.on('error', (e) => {
		  console.log(`problem with request: ${e.message}`);
			});
		});

		// write data to request body
		req.write(postData);
		req.end();
		
	},

	socketNotificationReceived: function(notification, payload) {
	    if (notification === 'RELOAD') {
		for (var c in payload.sensors) {
				var sensor = payload.sensors[c];
			}
	      this.reload(payload);
	    }
	}
});







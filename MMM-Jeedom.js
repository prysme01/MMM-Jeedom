'use strict';

Module.register("MMM-Jeedom",{
	// Default module config.
	defaults: {
		puissance: "",
		tsalon: "",
		conso: "test",
		updateInterval: 5000,
		initialLoadDelay: 0,
		animationSpeed: 1000,
		result: {},
		sensors: [
			{
				idx: "1",
				symbolon: "fa fa-user",
				symboloff: "fa fa-user-o",
				hiddenon: false,
				hiddenoff: false,
				customTitle: "No sensor define in config",
			},
		],
		jeedomHTTPS: true
	},

	start: function() {
		
		Log.log('LOG' + this.name + ' is started!');
		// Set locale.
		moment.locale(config.language);
		this.title = "Loading...";
		this.loaded = false;
		var self = this;
		setInterval(function() { self.updateJeedom(); }, this.config.updateInterval);
		this.sensors = [];
		for (var c in this.config.sensors) {
			var sensor = this.config.sensors[c];
			var newSensor = {idx:sensor.idx, symbol:sensor.symbol, symbolon:sensor.symbolon, symboloff:sensor.symboloff, 
					hiddenon:sensor.hiddenon, hiddenoff:sensor.hiddenoff, 
					customTitle:sensor.customTitle, status:"", sname:"",boolean:sensor.boolean,unit:sensor.unit};
			this.sensors.push(newSensor);
		}
		Log.log(this.sensors);

		// first update on start
		self.updateJeedom();
	},
	getStyles: function() {
	    return ['font-awesome.css'];
	},
	
	// Override dom generator.
	getDom: function() {

		var wrapper = document.createElement("div");
		var data = this.result;
		if (!this.loaded) {
			wrapper.innerHTML = "Loading...";
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		var tableWrap = document.createElement("table");
		tableWrap.className = "small";

		for (var c in this.sensors) {
			var sensor = this.sensors[c];

			if((sensor.status=="On" && sensor.hiddenon)||(sensor.status=="Off" && sensor.hiddenoff)) continue;
			var sensorWrapper = document.createElement("tr");
			sensorWrapper.className = "normal";

			var symbolTD = document.createElement('td');
			symbolTD.className = "symbol align-left";
			var symbol = document.createElement('i');
			var symbolClass = sensor.symboloff;
			if(sensor.boolean && sensor.status==1) symbolClass = sensor.symbolon;
			if(typeof sensor.boolean== 'undefined') symbolClass = sensor.symbol;
			symbol.className = symbolClass;
			symbolTD.appendChild(symbol);
			sensorWrapper.appendChild(symbolTD);

			var titleTD = document.createElement('td');
			titleTD.className = "title bright align-left";
			titleTD.innerHTML = sensor.sname;
			if(typeof sensor.customTitle !== 'undefined') titleTD.innerHTML = sensor.customTitle;
			sensorWrapper.appendChild(titleTD);

			if (!sensor.boolean) {
				var statusTD = document.createElement('td');
				statusTD.className = "time light align-right";
				statusTD.innerHTML = sensor.status;
				if(typeof sensor.unit !== 'undefined') { statusTD.innerHTML = statusTD.innerHTML + " "+sensor.unit;}
				sensorWrapper.appendChild(statusTD);
			}

			tableWrap.appendChild(sensorWrapper);
		}
		wrapper.appendChild(tableWrap);
		return wrapper;

	},
	updateJeedom: function() {
		this.sendSocketNotification('RELOAD',this.config);
	},
	socketNotificationReceived: function(notification, payload) {
		if (notification === "RELOAD_DONE") {
			this.result = payload;
			for (var c in this.sensors) {
				var sensor = this.sensors[c];
				if(payload.result[sensor.idx] != null){
					sensor.status = payload.result[sensor.idx].value;
				}
			}
			this.loaded = true;
			this.updateDom(this.animationSpeed);
		} 
	}

});

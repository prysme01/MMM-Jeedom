'use strict';

//Ajout AgP - 11/07/2018	
var IntervalID = 0; //Pour pouvoir couper et relancer l'update régulier
//pour gerer le PIR et le module.hidden en meme temps
var UserPresence = true; // par défaut on est présent (pas de sensor PIR pour couper)
var ModuleHidden = false; // par défaut on affiche le module (pas de module carousel ou autre)
//Fin ajout AgP

Module.register("MMM-Jeedom",{
	// Default module config.
	defaults: {
		puissance: "",
		tsalon: "",
		conso: "test",
		updateInterval: 5000, //5s
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
				hideempty: false,
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
		//Ajout AgP : IntervalID ci-dessous. Le définir permet de le couper après.
		IntervalID = setInterval(function() { self.updateJeedom(); }, this.config.updateInterval);
		this.sensors = [];
		for (var c in this.config.sensors) {
			var sensor = this.config.sensors[c];
			var newSensor = {idx:sensor.idx, symbol:sensor.symbol, symbolon:sensor.symbolon, symboloff:sensor.symboloff, hideempty:sensor.hideempty,hiddenon:sensor.hiddenon, hiddenoff:sensor.hiddenoff, customTitle:sensor.customTitle, status:"", sname:"",boolean:sensor.boolean,unit:sensor.unit};
			this.sensors.push(newSensor);
		}
		Log.log(this.sensors);

		// first update on start
		self.updateJeedom();
	},
	
	//Modif AgP42 - 11/07/2018	

	suspend: function() { //fct core appelée quand le module est caché
		ModuleHidden = true; //Il aurait été plus propre d'utiliser this.hidden, mais comportement aléatoire...
		//Log.log("Fct suspend - ModuleHidden = " + ModuleHidden);
		this.GestionUpdateInterval(); //on appele la fonction qui gere tous les cas
	},
	
	resume: function() { //fct core appelée quand le module est affiché
		ModuleHidden = false;
		//Log.log("Fct resume - ModuleHidden = " + ModuleHidden);
		this.GestionUpdateInterval();	
	},

	notificationReceived: function(notification, payload) {
		if (notification === "USER_PRESENCE") { // notification envoyée par le module MMM-PIR-Sensor. Voir sa doc
			//Log.log("Fct notificationReceived USER_PRESENCE - payload = " + payload);
			UserPresence = payload;
			this.GestionUpdateInterval();
		}
	},

	GestionUpdateInterval: function() {
		if (UserPresence === true && ModuleHidden === false){ // on s'assure d'avoir un utilisateur présent devant l'écran (sensor PIR) et que le module soit bien affiché
			var self = this;
			//Log.log(this.name + " est revenu et user present ! On update");
	
			// update tout de suite
			self.updateJeedom();
			//et on remet l'intervalle d'update en route, si aucun deja actif (pour éviter les instances multiples)
			if (IntervalID === 0){
				IntervalID = setInterval(function() { self.updateJeedom(); }, this.config.updateInterval);
			}
		}else{ //sinon (UserPresence = false OU ModuleHidden = true)
			//Log.log("Personne regarde : on stop l'update !");
			clearInterval(IntervalID); // on arrete l'intervalle d'update en cours
			IntervalID=0; //on reset la variable
		}
	},

	//fin modif AgP

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
			if((sensor.status==0  && sensor.hideempty)) continue;
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
		//AgP		
		//console.log("Hello, update module Jeedom demandé!! IntervalID : " + IntervalID);
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "RELOAD_DONE") {
			this.result = payload;
			//Log.log(payload);
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
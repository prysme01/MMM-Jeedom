'use strict';

//pour gerer le PIR et le module.hidden en meme temps
var UserPresence = true; // par défaut on est présent (pas de sensor PIR pour couper)

Module.register("MMM-Jeedom",{
	// Default module config.
	defaults: {
		updateInterval: 30000, //30s
		initialLoadDelay: 0,
		animationSpeed: 1000,
		displayLastUpdate: false,
		displayLastUpdateFormat: 'dd - HH:mm:ss',
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
				customTitleOn: undefined,
				customTitleOff: undefined,
				statuson: undefined,
				statusoff: undefined,
				sameLine1: false,
				sameLine2: false,
			},
		],
		
			Virtual_API: "", // Code APi de vos virtual
			TempID: "", // ID pour la température
			HumID: "", // ID pour l'humidité
			
		
		jeedomHTTPS: true
	},

	start: function() {
		
		Log.log('LOG' + this.name + ' is started!');
		// Set locale.
		moment.locale(config.language);
		this.title = "Loading...";
		this.loaded = false;
		var self = this; 
		this.debug = false;
		this.ModuleJeedomHidden = false; // par défaut on affiche le module (si pas de module carousel ou autre pour le cacher)
		this.IntervalID = 0; // à déclarer pour chaque instance pour pouvoir couper la mise à jour pour chacune
		this.lastUpdate = 0;
		
		this.IntervalID = setInterval(function() { self.updateJeedom(); }, this.config.updateInterval);
		
		this.sensors = [];
		for (var c in this.config.sensors) {
			var sensor = this.config.sensors[c];
			var newSensor = {
				idx: sensor.idx, 
				symbol: sensor.symbol, 
				symbolon: sensor.symbolon, 
				symboloff: sensor.symboloff, 
				hideempty: sensor.hideempty,
				hiddenon: sensor.hiddenon, 
				hiddenoff: sensor.hiddenoff, 
				sameLine1: sensor.sameLine1, 
				sameLine2: sensor.sameLine2, 
				customTitle: sensor.customTitle, 
				customTitleOn: sensor.customTitleOn, 
				customTitleOff: sensor.customTitleOff, 
				status: "", 
				statuson: sensor.statuson, 
				statusoff: sensor.statusoff, 
				sname: "",
				boolean: sensor.boolean,
				unit: sensor.unit};
			this.sensors.push(newSensor);
		}
		Log.log(this.sensors);

		// first update on start
		self.updateJeedom(); 
	},
	
	//Modif AgP42 - 11/07/2018	

	suspend: function() { //fct core appelée quand le module est caché
		this.ModuleJeedomHidden = true; //Il aurait été plus propre d'utiliser this.hidden, mais comportement aléatoire...
		this.debugger("Fct suspend - ModuleHidden = " + this.ModuleJeedomHidden);
		this.GestionUpdateInterval(); //on appele la fonction qui gere tous les cas
	},
	
	resume: function() { //fct core appelée quand le module est affiché
		this.ModuleJeedomHidden = false;
		this.debugger("Fct resume - ModuleHidden = " + this.ModuleJeedomHidden);
		this.GestionUpdateInterval();	
	},

	debugger:function (message) {
		if(this.debug === true)
		{
			Log.log("[Jeedom] "+message);
		}
	},

	notificationReceived: function(notification, payload, sender) {
		this.debugger("Fct notif notif !!! " + notification);
		if (notification === "USER_PRESENCE") { // notification envoyée par le module MMM-PIR-Sensor. Voir sa doc
			this.debugger("Fct notificationReceived USER_PRESENCE - payload = " + payload);
			UserPresence = payload;
			this.GestionUpdateInterval();
		}
	},

	GestionUpdateInterval: function() {
		this.debugger("Call GestionUpdateInterval : " + UserPresence + " / "+this.ModuleJeedomHidden);
		if (UserPresence === true && this.ModuleJeedomHidden === false){ // on s'assure d'avoir un utilisateur présent devant l'écran (sensor PIR) et que le module soit bien affiché
			var self = this;
			this.debugger(this.name + " est revenu et user present ! On update");
	
			// update tout de suite
			self.updateJeedom();
			//et on remet l'intervalle d'update en route, si aucun deja actif (pour éviter les instances multiples)
			if (this.IntervalID === 0){
				this.IntervalID = setInterval(function() { self.updateJeedom(); }, this.config.updateInterval);
			}
		}else{ //sinon (UserPresence = false OU ModuleHidden = true)
			this.debugger("Personne regarde : on stop l'update ! ID : " + this.IntervalID);
			clearInterval(this.IntervalID); // on arrete l'intervalle d'update en cours
			this.IntervalID=0; //on reset la variable
		}
	},

	getStyles: function() {
	    return ['font-awesome.css'];
	},
	
	// Override dom generator.
	getDom: function() {
				
		var sameLineValueMemorisation = '';
		var sameLineUnitMemorisation = '';

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
			
			if((sensor.status==0  && sensor.hideempty)) continue; //si on voulait cacher les vide et qu'il est vide, on fait rien...
			if((sensor.status=="On" && sensor.hiddenon)||(sensor.status=="Off" && sensor.hiddenoff)) continue; //si on voulait cacher les On et qu'il est On, on fait rien...
			
			//si sameLine1 définie, on memorise pour écrire au prochain tour avec la variable suivante et on sort de la boucle sans rien afficher
			if(sensor.sameLine1){
			
				//on memorise les infos :
				sameLineValueMemorisation = sensor.status;			
				if(typeof sensor.unit !== 'undefined') {
					sameLineUnitMemorisation = sensor.unit;
				}
							
		//		Log.log ("on est en sameLine1 , value : "	+sameLineValueMemorisation
		//		+" , unit : " +  sameLineUnitMemorisation 
		//		/*+ " sameLinePosition : " + sameLinePosition*/); 
				
				continue;
			}
			
			var sensorWrapper = document.createElement("tr"); //on créé la liste principale, qu'on va remplir après
			sensorWrapper.className = "normal"; 

			//on commence par afficher le symbole, selon tous les cas possible : symbol; symbolon, symboloff, ...
			var symbolTD = document.createElement('td');
			symbolTD.className = "symbol align-left";
			var symbol = document.createElement('i');
			var symbolClass = sensor.symboloff;
			if(sensor.boolean && sensor.status==1) symbolClass = sensor.symbolon;
			if(typeof sensor.boolean== 'undefined') symbolClass = sensor.symbol;
			symbol.className = symbolClass;
			symbolTD.appendChild(symbol);
			sensorWrapper.appendChild(symbolTD); //et on ajoute le symbole au Wrapper

			//puis on s'occupe du titre
			var titleTD = document.createElement('td');
			titleTD.className = "title bright align-left";
			titleTD.innerHTML = sensor.sname;
			if(typeof sensor.customTitle !== 'undefined') titleTD.innerHTML = sensor.customTitle;
			if(sensor.boolean) {
				if(sensor.status==1 && typeof sensor.customTitleOn !== 'undefined') titleTD.innerHTML = sensor.customTitleOn;
				if(sensor.status==0 && typeof sensor.customTitleOff !== 'undefined') titleTD.innerHTML = sensor.customTitleOff;
			}
			sensorWrapper.appendChild(titleTD);

			//si c'est pas un boolean, on affiche la valeur (jeedom) et l'unité (config)
			var statusTD = document.createElement('td');
			statusTD.className = "time light align-right";
			//si c'est un "sameLine2", on affiche celui mémorisé précédemment avant de continuer
			if(sensor.sameLine2) {
				statusTD.innerHTML = statusTD.innerHTML + sameLineValueMemorisation + " " 
				+ sameLineUnitMemorisation + " - ";			
			}
			
			if (!sensor.boolean) {					
				statusTD.innerHTML = statusTD.innerHTML + sensor.status;
				if(typeof sensor.unit !== 'undefined') {
					statusTD.innerHTML = statusTD.innerHTML + " " + sensor.unit;
				}
				sensorWrapper.appendChild(statusTD);

			} else if (sensor.status==1 && typeof sensor.statuson !== 'undefined') {
				statusTD.innerHTML = statusTD.innerHTML + sensor.statuson;
				sensorWrapper.appendChild(statusTD);

			} else if (sensor.status==0 && typeof sensor.statusoff !== 'undefined') {
				statusTD.innerHTML = statusTD.innerHTML + sensor.statusoff;
				sensorWrapper.appendChild(statusTD);
			}

			tableWrap.appendChild(sensorWrapper); //on ajoute tout ca à notre table
		}
		wrapper.appendChild(tableWrap); //quand la table est finie (loop des sensors finie), on l'ajoute au wrapper
		
		//si on veut afficher la date du last update, on va l'ajouter à la fin
		if(this.config.displayLastUpdate){

			var updateinfo = document.createElement("div");
			updateinfo.className = "xsmall light align-left";
			updateinfo.innerHTML = "Update : " + moment.unix(this.lastUpdate).format(this.config.displayLastUpdateFormat);
			wrapper.appendChild(updateinfo);
		}
		
		return wrapper;

	},
	updateJeedom: function() {
		this.sendSocketNotification('RELOAD',this.config);
		this.debugger("Jeedom RELOAD "+ Date.now() / 1000);
		if(this.config.displayLastUpdate){
			this.lastUpdate = Date.now() / 1000 ; //memorise la date de la demande d'update pour chaque instance			
		    this.debugger("Update Jeedom demandée pour " + this.config.sensors[0].idx + " - à : " + moment.unix(this.lastUpdate).format('dd - HH:mm:ss'));
		}
	//	this.sendNotification("SHOW_ALERT",{type:"notification",message:"Update Jeedom demandée"});
	},

	socketNotificationReceived: function(notification, payload) {
		//console.log(`notification : ${notification} ; payload : ${payload}`)
		if (notification === "RELOAD_DONE") {
			this.result = payload;
			//Log.log(payload);
			
			for (var c in this.sensors) {
				var sensor = this.sensors[c];
				if(payload.result[sensor.idx] != null){
					sensor.status = payload.result[sensor.idx].value;
					
	/*			Log.log("Fct socketNotificationReceived - lastUpdate : "
				+ moment.unix(this.lastUpdate).format('dd - HH:mm:ss') 
				+ "pour le sensor : " + this.config.sensors[0].idx
				+ "resultat :" + sensor.status);*/
					
				}
			}
			this.loaded = true;
			this.updateDom(this.animationSpeed);
		}
	},
	notificationReceived: function(notification, payload, sender) {
		//console.log (`API : ${this.config.Virtual_API} , TempID : ${this.config.TempID}, HumID: ${this.config.HumID}`)
		if (notification === "INDOOR_TEMPERATURE") {	
			if (this.config.Virtual_API != '') {				
				this.debugger(`API : ${this.config.Virtual_API} `)
					if (this.config.TempID != ''){
					this.indoorTemperature = this.roundValue(payload);
					this.debugger(`la temperaure remonté est ${this.indoorTemperature}`);
					this.debugger(`l'adresse de jeedom est ${this.config.jeedomURL}`);
					this.updatejeedom(this.config.TempID,this.indoorTemperature);
					this.debugger(`${this.name} renvoie la temp ${this.indoorTemperature}`)
				}
			}
		}
		if (notification === "INDOOR_HUMIDITY") {
			if (this.config.Virtual_API != '') {
				if (this.config.HumdID != '') {
					this.debugger (` HumID: ${this.config.HumID}`)
					this.indoorHumidity = this.roundValue(payload);
					this.updatejeedom(this.config.HumID, this.indoorHumidity);
					this.debugger(`${this.name} renvoie l humidite :  ${this.indoorHumidity}`);
					}
			}
		 }
	},

	roundValue: function(temperature){
		const decimals = this.config.roundTemp ? 0 : 1;
		const roundValue = parseFloat(temperature).toFixed(decimals);
		return roundValue === "-0" ? 0 : roundValue;
	  },
  
	updatejeedom: function(ID,Values){
		var self = this;
		var url = '';
		 if (this.ID == '')  {
			  console.log('Pas d ID de valeur Jeedom')
			  } else {
				var jeedomprot = this.config.jeedomHTTPS ? "https" : "http";
				url = jeedomprot + "://" + this.config.jeedomURL + this.config.jeedomAPIPath +"?apikey=" + this.config.Virtual_API + "&type=virtual&type=virtual&id=" + ID + "&value=" + Values
				this.debugger(`ToJeedom >> ${url}`)
				var xmlHttp = new XMLHttpRequest();
				xmlHttp.open( "GET", url, false ); // false for synchronous request
				xmlHttp.send( null );
				this.debugger( `ToJeedom >> Status : ${xmlHttp.status}-${xmlHttp.statusText} Reponse : ${xmlHttp.responseText}` );       
				}
			},
});

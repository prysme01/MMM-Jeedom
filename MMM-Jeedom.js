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
				sameLine1: false,
				sameLine2: false,
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
		
		var ModuleJeedomHidden = false; // par défaut on affiche le module (si pas de module carousel ou autre pour le cacher)
		var IntervalID = 0; // à déclarer pour chaque instance pour pouvoir couper la mise à jour pour chacune
		var lastUpdate = 0;
		
		this.IntervalID = setInterval(function() { self.updateJeedom(); }, this.config.updateInterval);
		
		this.sensors = [];
		for (var c in this.config.sensors) {
			var sensor = this.config.sensors[c];
			var newSensor = {idx:sensor.idx, symbol:sensor.symbol, symbolon:sensor.symbolon, symboloff:sensor.symboloff, hideempty:sensor.hideempty,hiddenon:sensor.hiddenon, hiddenoff:sensor.hiddenoff, sameLine1:sensor.sameLine1, sameLine2:sensor.sameLine2, customTitle:sensor.customTitle, status:"", sname:"",boolean:sensor.boolean,unit:sensor.unit};
			this.sensors.push(newSensor);
		}
		Log.log(this.sensors);

		// first update on start
		//self.updateJeedom(); //premier update appelé par resume à l'affichage de la page, donc on peut virer celui la
	},
	
	//Modif AgP42 - 11/07/2018	

	suspend: function() { //fct core appelée quand le module est caché
		this.ModuleJeedomHidden = true; //Il aurait été plus propre d'utiliser this.hidden, mais comportement aléatoire...
	//	Log.log("Fct suspend - ModuleHidden = " + this.ModuleJeedomHidden);
		this.GestionUpdateInterval(); //on appele la fonction qui gere tous les cas
	},
	
	resume: function() { //fct core appelée quand le module est affiché
		this.ModuleJeedomHidden = false;
	//	Log.log("Fct resume - ModuleHidden = " + this.ModuleJeedomHidden);
		this.GestionUpdateInterval();	
	},

	notificationReceived: function(notification, payload) {
		if (notification === "USER_PRESENCE") { // notification envoyée par le module MMM-PIR-Sensor. Voir sa doc
		//	Log.log("Fct notificationReceived USER_PRESENCE - payload = " + payload);
			UserPresence = payload;
			this.GestionUpdateInterval();
		}
	},

	GestionUpdateInterval: function() {
		if (UserPresence === true && this.ModuleJeedomHidden === false){ // on s'assure d'avoir un utilisateur présent devant l'écran (sensor PIR) et que le module soit bien affiché
			var self = this;
		//	Log.log(this.name + " est revenu et user present ! On update");
	
			// update tout de suite
			self.updateJeedom();
			//et on remet l'intervalle d'update en route, si aucun deja actif (pour éviter les instances multiples)
			if (this.IntervalID === 0){
				this.IntervalID = setInterval(function() { self.updateJeedom(); }, this.config.updateInterval);
			}
		}else{ //sinon (UserPresence = false OU ModuleHidden = true)
		//	Log.log("Personne regarde : on stop l'update ! ID : " + this.IntervalID);
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
			sensorWrapper.appendChild(titleTD);

			//si c'est pas un boolean, on affiche la valeur (jeedom) et l'unité (config)
			if (!sensor.boolean) {
				var statusTD = document.createElement('td');
				statusTD.className = "time light align-right";
				
				//si c'est un "sameLine2", on affiche celui mémorisé précédemment avant de continuer
				if(sensor.sameLine2) {
					statusTD.innerHTML = statusTD.innerHTML + sameLineValueMemorisation + " " 
					+ sameLineUnitMemorisation + " - ";
					
				}			
					
				statusTD.innerHTML = statusTD.innerHTML + sensor.status;
				if(typeof sensor.unit !== 'undefined') {
					statusTD.innerHTML = statusTD.innerHTML + " " + sensor.unit;
				}
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
		
		if(this.config.displayLastUpdate){
			this.lastUpdate = Date.now() / 1000 ; //memorise la date de la demande d'update pour chaque instance			
		//	Log.log("Update Jeedom demandée pour " + this.config.sensors[0].idx + " - à : " + moment.unix(this.lastUpdate).format('dd - HH:mm:ss'));
		}
	//	this.sendNotification("SHOW_ALERT",{type:"notification",message:"Update Jeedom demandée"});
	},

	socketNotificationReceived: function(notification, payload) {
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
	}

});

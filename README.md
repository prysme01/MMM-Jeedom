# Magic Mirror 2 - JEEDOM Module

This module displays any JEEDOM command value. The information will be updated depending on the polling time.

If a PIR-sensor using MMM-PIR-Sensor module is used, this information will not be updated during screen off. 

The infos will also not be updated when no instances of the MMM-Jeedom module are displayed on the screen (for example hidden by using MMM-Remote-Control or any carousel like MMM-Pages). This will allow to reduce the number of request to Jeedom API. 
As soon as one MMM-Jeedom module will be again displayed on the screen, all the instances will request an update of the datas. 

![alt text](https://raw.githubusercontent.com/prysme01/MMM-Jeedom/master/screenshots/MMM-Jeedom.png "Image of MMM-Jeedom")

![alt text](https://github.com/AgP42/MMM-Jeedom/blob/master/screenshots/MMM-Jeedom_1.png "Image of MMM-Jeedom_1")

![alt text](https://github.com/AgP42/MMM-Jeedom/blob/master/screenshots/MMM-Jeedom_2.png "Image of MMM-Jeedom_2")

## Module installation

Git clone this repo into ~/MagicMirror/modules directory :
```
cd ~/MagicMirror/modules
git clone https://github.com/prysme01/MMM-Jeedom.git
```
and add the configuration section in your Magic Mirror config file : 

## Module configuration
(1st example of the screenshot) :
````javascript
modules: [
		{
			module: 'MMM-Jeedom',
			header: 'Jeedom Maison',
			position: "top_left",
			config: {
				updateInterval: 3000,
			      	jeedomAPIKey: "", 
				jeedomURL: "192.168.0.1 or hostname",
				jeedomPORT: 443,
				jeedomHTTPS: true,
				jeedomAPIPath: "/core/api/jeeApi.php",
				sensors: [
				{
					idx: "127", 
					symbol: "fa fa-bolt",
					customTitle: "Consommation Maison",
					unit : "Watt",
      				},
				{
					idx: "695",
					symbol: "fa fa-thermometer-full",
					customTitle: "Temperature Rez de Chaussee",
					unit : "C°",
				},
				{
					idx: "773",
					symbolon: "fa fa-user",
					symboloff: "fa fa-user-o",
					customTitle: "Adrien",
					boolean : true,
				},
				{
					idx: "6031",
					symbol: "fa fa-music",
					customTitle: "Musique",
					hideempty:false,

				},
			]
			}
		},
]
````
Example how to use 2 infos on the same line : 
(2nd example of the screenshot)
````
	sensors: [
				{//first info (value and unit only)
					idx: "1987", 
					sameLine1: true,
					unit : "°C",
      				},	
				{//second info (title, symbol, value and unit)
					idx: "1988", 
					customTitle: "Météo",
					symbol: "fa fa-sun-o",
					sameLine2: true,
					unit : "%",
      				},
      				{ //this one display only 1 info on its line
					idx: "1996", 
					symbol: "fa fa-cloud",
					customTitle: "Condition :",
      				},
				{
					idx: "1495", 
					//customTitle: "Grenier",
					sameLine1: true,
					unit : "°C",
      				},	
				{
					idx: "1496", 
					customTitle: "Grenier",
					symbol: "fa fa-thermometer-half",
					sameLine2: true,
					unit : "%",
      				},

				{
					idx: "1499", 
					//customTitle: "Cuisine",
					sameLine1: true,
					unit : "°C",
      				},
				{
					idx: "1500", 
					symbol: "fa fa-thermometer-half",
					customTitle: "Cuisine",
					sameLine2: true,
					unit : "%",
      				},
			]
````
Or (3rd example of the screenshot) :
````
[

				{//first line : display the status of the heater occording to a boolean value
					idx: "228", 
					symbolon: "fa fa-fire vert", //colors has to be defined on custom.css file
					symboloff: "fa fa-power-off rouge",
					boolean : true,
					customTitle: "Cuisine",

      				},
				{// second line : display both thermostat mode
					//thermostat
					idx: "980", 
					sameLine1: true,
      				},
      				{// and the thermostat target value
					//valeur de consigne
					idx: "966", 
					sameLine2: true,
					unit : "°C",
      				},
				{
					idx: "544", 
					symbolon: "fa fa-fire vert",
					symboloff: "fa fa-power-off rouge",
					boolean : true,
					customTitle: "Salle Meca",

      				},
				{
					//thermostat
					idx: "1262", 
					sameLine1: true,
      				},
      				{
					//valeur de consigne
					idx: "1248", 
					sameLine2: true,
					unit : "°C",
      				},
		]
````
* HTTPS and HTTP is supported
* you can define all the sensors you want
* you can add several time the module in your Magic Mirror config and define a different updateInterval
* symbol is based on [Fontawesome](http://fontawesome.io/icons/)
* if you define the sensor as a "boolean:true" then you can :
	- add symbolon and symboloff depending on the sensor value (0 or 1)
	- add customTitleOn and customTitleOff depending on the sensor value (0 or 1)

## Configuration Options

The following properties can be configured:

<table width="100%">
	<!-- why, markdown... -->
	<thead>
		<tr>
			<th>Option</th>
			<th width="100%">Description</th>
		</tr>
	<thead>
	<tbody>
		<tr>
			<td><code>updateInterval</code></td>
			<td>Update interval in ms<br>
				<br><b>Possible values:</b> <code>int</code>
				<br><b>Default value:</b> <code>5000</code>
				<br><b>Note:</b> This value is in ms
			</td>
		</tr>
		<tr>
			<td><code>jeedomAPIKey</code></td>
			<td>"Jeedom / paramétres / configuration / API . Activate the "Accès API JSONRPC" and take the API key globale of Jeedom<br>
			</td>
		</tr>
		<tr>
			<td><code>jeedomURL</code></td>
			<td>local or externe URL<br>
				<br><b>Possible values:</b> <code>192.168.1.18</code>
			</td>
		</tr>
		<tr>
			<td><code>jeedomPORT</code></td>
			<td>443 or 80<br>
				<br><b>Possible values:</b> <code>443 or 80</code>
				<br><b>Default value:</b> <code>443</code>
			</td>
		</tr>
		<tr>
			<td><code>jeedomHTTPS</code></td>
			<td>HTTPS or HTTP<br>
				<br><b>Possible values:</b> <code>boolean</code>
				<br><b>Default value:</b> <code>true</code>
			</td>
		</tr>
		<tr>
			<td><code>animationSpeed</code></td>
			<td>Speed to animate the display during an update, in ms<br>
				<br><b>Default value:</b> <code>1000</code>
			</td>
		</tr>
		<tr>
			<td><code>displayLastUpdate</code></td>
			<td>If true this will display the last update time at the end of the task list. See screenshot above<br>
				<br><b>Possible values:</b> <code>boolean</code>
				<br><b>Default value:</b> <code>false</code>
			</td>
		</tr>
		<tr>
			<td><code>displayLastUpdateFormat</code></td>
			<td>Format to use for the time display if displayLastUpdate:true <br>
				<br><b>Possible values:</b> See [Moment.js formats](http://momentjs.com/docs/#/parsing/string-format/)
				<br><b>Default value:</b> <code>'dd - HH:mm:ss'</code>
			</td>
		</tr>
		<tr>
			<td><code>sensors</code></td>
			<td>The list of sensor to be displayed, with extra config parameters : 		
				<ul style="list-style-type:disc">
					<li>idx: "1", : Jeedom ID of the equipement to display. Can be found in "Resumé domotique"</li>
					<li>symbol: "fa fa-tint", : symbol to display if no other condition</li>
					<li>symbolon: "fa fa-user", : symbol to display when equipement is ON if "boolean : true,"</li>
					<li>symboloff: "fa fa-user-o", : symbol to display when equipement is OFF if "boolean : true,"</li>
					<li>boolean : true, : if true, only the symbolon or symboloff is displayed</li>
					<li>hiddenon: false, : info to hide if value is On</li>
					<li>hiddenoff: false, : info to hide if value is Off</li>
					<li>hideempty: false, : info to hide if value is Empty</li>
					<li>customTitle: "No sensor define in config", : Title of this sensor</li>
					<li>customTitleOn: undefined, : Title to display when equipement is ON if "boolean : true,". If customTitleOn is not set, customTitle is displayed</li>
					<li>customTitleOff: undefined, : Title to display when equipement is OFF if "boolean : true,". If customTitleOff is not set, customTitle is displayed</li></li>
					<li>unit : "%", : unit to display after the value of the sensor</li>
					<li>sameLine1: false, : if true, it will be display on the same line than the "sameLine2: true". Only the value and the unit can be defined in that case. See example above</li>
					<li>sameLine2: false, : if true, it will be display on the same line than the "sameLine1: true". The title and symbol define here will be used for both infos. See example above</li>
				</ul>
			</td>
		</tr>
	</tbody>
</table>


## License

This project is licensed under the GPL License

## Acknowledgments

Thank you very much to [Mathias Arvidsson](https://github.com/M-Arvidsson/MMM-domoticz) for his code and inspiration for MMM-Domoticz

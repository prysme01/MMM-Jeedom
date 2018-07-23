# Magic Mirror 2 - JEEDOM Module

This module displays any JEEDOM command value. The information will be updated depending on the polling time.


![alt text](https://raw.githubusercontent.com/prysme01/MMM-Jeedom/master/screenshots/MMM-Jeedom.png "Image of MMM-Jeedom")

## Module installation

Just git clone this repository to your Magic Mirror Modules directory
and add the configuration section in your Magic Mirror config file

## Module configuration
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
* HTTPS and HTTP is supported
* you can define all the sensors you want
* you can add several time the module in your Magic Mirror config and define a different updateInterval
* symbol is based on [Fontawesome](http://fontawesome.io/icons/)
* if you define the sensor as a "boolean:true" then you can add symbolon and symboloff depending on the sensor value (0 or 1)

## License

This project is licensed under the GPL License

## Acknowledgments

Thank you very much to [Mathias Arvidsson](https://github.com/M-Arvidsson/MMM-domoticz) for his code and inspiration for MMM-Domoticz

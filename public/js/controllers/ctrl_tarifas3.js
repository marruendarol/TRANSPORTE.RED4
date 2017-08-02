/**********************************************************
*	SIGNUP CONTROLLER
todo


	- Parametros en Ida Retorno
	- Tiempos poner horas promedio 

	Costos Fijos detalle en mas 

	- Poner porcentaje de llenado del camión 

	- Detalle de Costos fijos y variables
	- Poner detalle de totales

	- Costos Extras 
		- Rastreo etc...
		w

***********************************************************/

var socket; 
var userRoom = "test";



$(document).ready(function() {
	socket = io('/transporte');
    mainC.initApp();
    ctrl_home.initSocket();
});

var ctrl_home = {
	lan : spanish,
	waiting : false,
	errors : [],
	toogle:false,
	selOrigen : 0,
	selDestino : 0,
	init : function(){
		ctrl_login.initSocket();
	},
 /*---------------------------------------------------------------------------------
 *	Socket Controller
 *--------------------------------------------------------------------------------*/
    initSocket : function(){

    	console.log("iniciando socket")

    	socket.on('connect', function () { 
    		//console.log("connecting remote")
    		socket.emit('create',userRoom);  

    		socket.on('joined', function(response){
    			//console.log("4- Socket join")
    			createGrowl("Group info","Conectado a transporte.red",false,'bg_ok','conn');
    			ctrl_home.render()
    			// INIT LOCAL DATABASE
        		
      		});

	        socket.on('reconnect_error', function(err) {  //Fired upon a reconnection attempt error.Parameters:
	        	//console.log(err)
	        	createGrowl("App info","No se pudo reconectar al servidor.",false,'bg_error','errorreconexion');
	        });

	         socket.on('error', function(err) {  // Fired upon a connection error
	        	createGrowl("App info","Error de conección. intentando reconectar...",false,'bg_error',"errorconexion");
	        });

	        socket.on('reconnect', function(err) {  //Fired upon a reconnection 
	        	createGrowl("App info","Reconectado a servidor...",false,'bg_ok','reconectado');
	            
	        });
    	});
    },
    getRoute: function(){

    	console.log("getting route ")
    	

    	socket.on('mappirRoute', function(res) {  
    		console.log(res)
    			ctrl_home.mainR.set('ready',true)
    			ctrl_home.mainR.set('calculo.infoRuta',res.results[0])
    			ctrl_home.mainR.set('txtBt',"Calcular")
    			ctrl_home.mainR.set('btDis','');

	        	//gGeo.addRoute(res.results[0].grafo)
	        	ctrl_home.drawRoute();
	        	gGeo.addPins([ctrl_home.selOrigen,ctrl_home.selDestino])

	        	ctrl_home.operations(); 
	    });




    	ctrl_home.mainR.set('txtBt', 'Calculando  <div class="sk-circle">'+
        '<div class="sk-circle1 sk-child"></div> '+
        '<div class="sk-circle2 sk-child"></div>'+
        '<div class="sk-circle3 sk-child"></div>'+
        '<div class="sk-circle4 sk-child"></div>'+
        '<div class="sk-circle5 sk-child"></div>'+
        '<div class="sk-circle6 sk-child"></div>'+
        '<div class="sk-circle7 sk-child"></div>'+
        '<div class="sk-circle8 sk-child"></div>'+
        '<div class="sk-circle9 sk-child"></div>'+
        '<div class="sk-circle10 sk-child"></div>'+
        '<div class="sk-circle11 sk-child"></div>'+
        '<div class="sk-circle12 sk-child"></div>'+
      '</div>')
    	ctrl_home.mainR.set('btDis','btDis');


    	var routeParams = {room:userRoom,
    						origen:ctrl_home.selOrigen,
    						destino:ctrl_home.selDestino,
    						tipoVel : tipoVel[ctrl_home.mainR.get('tipoVel_sel')].categoria,
    						subTipoVel : tipoVel[ctrl_home.mainR.get('tipoVel_sel')].dataVal,
    						ejesExcedentes : ctrl_home.mainR.get('tipoEje_sel'),
    						precioGas : ctrl_home.gasolinas.costos[ctrl_home.mainR.get('gasolina_sel')].costo,
    						tipoGas : ctrl_home.gasolinas.costos[ctrl_home.mainR.get('gasolina_sel')].tipoC,
    						rendimiento : tipoVel[ctrl_home.mainR.get('tipoVel_sel')].rendimiento,
    						
    	}

    	console.log(routeParams,"Route params")
    	socket.emit('getmappir',routeParams);  
    },
    getGasolinas : function(){
    	socket.on('gasolinas', function(res) { 
    		ctrl_home.gasolinas = res; 
    		ctrl_home.mainR.set('gasolinas',res);
    			
	    });


	    socket.emit('getGasolinas',{room:userRoom});  
    },
    drawRoute: function(){


    	gGeo.directionsService = new google.maps.DirectionsService();
    	gGeo.directionsDisplay = new google.maps.DirectionsRenderer({polylineOptions: {
      		strokeWeight: 2,
            strokeOpacity: 1,
            strokeColor:  '#1668af'}
    });

		gGeo.directionsDisplay.setPanel(document.getElementById('directions-panel'));

		gGeo.directionsDisplay.setMap(gGeo.map);
		gGeo.directionsDisplay.setOptions( { suppressMarkers: true } );

		 gGeo.directionsService.route({
		    origin: new google.maps.LatLng(ctrl_home.selOrigen.lat,ctrl_home.selOrigen.lng),
		    destination: new google.maps.LatLng(ctrl_home.selDestino.lat,ctrl_home.selDestino.lng),
		    travelMode: google.maps.TravelMode.DRIVING,
		    provideRouteAlternatives:true,
		    avoidTolls : false,
		  }, function(response, status) {
		  	console.log(response)

		  	var casetasArr = {};

		  	var overviewPath = response.routes[0].overview_path,
                overviewPathGeo = [];
            for (var i = 0; i < overviewPath.length; i++) {
                overviewPathGeo.push(
                [overviewPath[i].lng(), overviewPath[i].lat()]);
            }


            console.log(overviewPathGeo)
		    if (status === google.maps.DirectionsStatus.OK) {
		      gGeo.directionsDisplay.setDirections(response);
		    } else {
		      window.alert('Directions request failed due to ' + status);
		    }
		  });
    	
    },
	render:function(){

		tipoVel = [
			{nombre:"Auto Chico",categoria:1,dataVal:1,rendimiento:16.00},
			{nombre:"Auto Mediano",categoria:1,dataVal:2,rendimiento:14.00},
			{nombre:"Auto Grande",categoria:1,dataVal:3,rendimiento:12.00},

			{nombre:"Moto",categoria:2,dataVal:4,rendimiento:25.00},

			{nombre:"Autobus 2 Ejes",categoria:3,dataVal:4,rendimiento:6.00},
			{nombre:"Autobus 3 Ejes",categoria:3,dataVal:5,rendimiento:6.00},
			{nombre:"Autobus 4 Ejes",categoria:3,dataVal:6,rendimiento:6.00},

			{nombre:"Camión 2 Ejes",categoria:4,dataVal:8,rendimiento:6.00},
			{nombre:"Camión 3 Ejes",categoria:4,dataVal:9,rendimiento:7.00},
			{nombre:"Camión 4 Ejes",categoria:4,dataVal:10,rendimiento:7.00},
			{nombre:"Camión 5 Ejes",categoria:4,dataVal:11,rendimiento:12.00},
			{nombre:"Camión 6 Ejes",categoria:4,dataVal:12,rendimiento:6.00},
			{nombre:"Camión 7 Ejes",categoria:4,dataVal:13,rendimiento:5.00},
			{nombre:"Camión 8 Ejes",categoria:4,dataVal:14,rendimiento:4.00},
			{nombre:"Camión 9 Ejes",categoria:4,dataVal:15,rendimiento:4.00},	
		]

		var tipoCamion = [
			{nombre : "Rabón",dataVal:0},
			{nombre : "Torton",dataVal:1},
			{nombre : "Caja Cerrada 53 Pies",dataVal:2},
			{nombre : "Caja Cerrada 48 Pies",dataVal:3},
			{nombre : "Full / Doble Semiremolque",dataVal:4},
			{nombre : "Caja Refrigerada",dataVal:5},
			{nombre : "Plataforma",dataVal:6},
			{nombre : "Autotanque / PIPA",dataVal:7},
			{nombre : "Autotanque para asfalto",dataVal:8},
			{nombre : "Jaula a granel",dataVal:9},
			{nombre : "Jaula Ganadera",dataVal:10},
			{nombre : "Jaula enlonada",dataVal:11},
			{nombre : "Cama Baja",dataVal:12},
			{nombre : "Tolva",dataVal:13},
			{nombre : "Madrina",dataVal:14},
		]


		var ejesExcendentes = [
			{nombre: "Sin", dataVal:0},
			{nombre: "1", dataVal:1},
			{nombre: "2", dataVal:2},
			{nombre: "3", dataVal:3},
			{nombre: "4", dataVal:4}]


		tarifas = [
			{min:0,max:50,tarifa:550},
			{min:51,max:100,tarifa:900},
			{min:101,max:200,tarifa:950},
			{min:201,max:300,tarifa:1450},
			{min:301,max:400,tarifa:1600},
			{min:500,max:700,tarifa:1800},
			{min:701,max:900,tarifa:2000},
			{min:901,max:1500,tarifa:3000},
			{min:1500,max:2000,tarifa:4000},
			{min:2001,max:3000,tarifa:4500},
			{min:3001,max:5000,tarifa:5500},
			{min:5001,max:50000,tarifa:7500},
		]

		// Parámetros Cálculo

		ctrl_home.calculo = {
			infoRuta : {
				descripcion : "",
				distanciaTotal : 0,
				tiempoTotal : 0,
				gasConsumida : 0,
				gasTotal : 0,
				casetasNo : 0,
				casetasTotal : 0,
				rendimiento : 0,
				costoltgas : 0,
			},
			infoRutaTotal : {
				distanciaTotal : 0,
				tiempoTotal : 0,
				gasConsumida : 0,
				gasTotal : 0,
				casetasNo : 0,
				casetasTotal : 0,
			},
			infoVehiculo : {
				tipoVel_txt : "Auto Chico",
				ejesExe_txt : "Sin ",
				tipoCam_txt : "Rabón",
				rutaTipo : true,
				viajeTipo : 0,		
			},
			variables : {
				mantenimiento : 0,
				administrativos : 0,
				chofer : 0,
				viaticos : 0,
				impuestos : 0,
				total: 0.00,
				gananciaIda : 0,
				gananciaRegreso : 0
			},
			extras : {
				manejos : 0,
				carga  : 0,
				tiempoCarga : 0,
				tiempoEspera : 120, 
			},
			parametros : {
				perc_ganancia : 50,
				perc_regreso : 30,
				facCostos : 100,
			}
		}

		ctrl_home.data = {
				ready : true,
				txtBt : "Calcular",
				lan	: ctrl_home.lan,
				strOrigen : "",
				strDestino : "",
				calculo : ctrl_home.calculo,
				tipoVel: tipoVel,
				tipoCamion : tipoCamion,
				ejesExcendentes : ejesExcendentes,
				tipoEje_sel : 0,
				tipoVel_sel : 0,
				tipoCam_sel : 0,
			}
		
		// 4558

		// 1170


		//1480 KM
		//1170

		// 466 Minutos



		ctrl_home.mainR = template.render('#homeT','#content', ctrl_home.data );

		var selector = document.getElementById("fijos");

		/*$('.currency').inputmask( { alias: 'numeric',
		 groupSeparator:"," ,
		 //numericInput: true,
		 autoGroup :true,
		 digits :0,
		 prefix : '$',
		 placeholder : "0.00",
		 autoUnmask : true,
		  });*/

		ctrl_home.getGasolinas() 

		ctrl_home.mainR.on('ref',function(e){
			console.log(e)
			ctrl_home.operations();
		})
		
		// Sliders
		var startSlider = document.getElementById('slide1');

		var slider = noUiSlider.create(startSlider, {
			start: [ctrl_home.calculo.parametros.perc_ganancia],
			range: {
				'min': [ 0 ],
				'max': [ 200 ]
			},
			step : 1,

			//tooltips: true,
		});
		slider.on('update', function(e){
		ctrl_home.mainR.set('calculo.parametros.perc_ganancia',Math.round(e[0]))
		ctrl_home.operations();
			});

		
		var startSlider3 = document.getElementById('slide3');
		var slider3 = noUiSlider.create(startSlider3, {
				start: [ctrl_home.calculo.parametros.perc_regreso],
				range: {
					'min': [ 0 ],
					'max': [ 200 ]
				},
				//tooltips: true,
			});
		slider3.on('update', function(e){
				ctrl_home.mainR.set('calculo.parametros.perc_regreso',Math.round(e[0]))
				ctrl_home.operations();
					});


		var startSliderCosto = document.getElementById('slideCosto');
		var startSliderCosto = noUiSlider.create(startSliderCosto, {
				start: [ctrl_home.calculo.parametros.facCostos],
				range: {
					'min': [ 0 ],
					'max': [ 200 ]
				},
				//tooltips: true,
			});
		startSliderCosto.on('update', function(e){
				ctrl_home.mainR.set('calculo.parametros.facCostos',e[0])
				ctrl_home.operations();
					});
		

		$('.currency').change(function(){
			ctrl_home.operations()
		})
	

		//----------------------------------


		ctrl_home.mainR.on('selOrigen',function(event){
			console.log("origen")
			$('#iDestino').focus();
		});


		ctrl_home.mainR.on('selDestino',function(event){
			console.log('destino')
		})		

		ctrl_home.mainR.on('bRoute',function(){
			ctrl_home.getRoute();
		})


		gGeo.init();

		 
		this.operations(); 

	},
	getTarifa: function(km){
			var item = {}
			for (var i = 0; i < tarifas.length; i++) {
				if(km>tarifas[i].min && km<tarifas[i].max){
					item = tarifas[i];
				}
			}
			return item;
	},

	operations : function(){

		var facTipo = 1;

		ctrl_home.mainR.updateModel();

		var percGanancia = ctrl_home.calculo.parametros.percGanancia;

		// Viaje 
		var distanciaTotal = parseFloat(ctrl_home.mainR.get('calculo.infoRuta.distanciaTotal'));
		var tiempoTotal = parseFloat(ctrl_home.mainR.get('calculo.infoRuta.tiempoTotal'));
		var casetasNo = parseFloat(ctrl_home.mainR.get('calculo.infoRuta.casetasNo'));
		var casetasTotal = parseFloat(ctrl_home.mainR.get('calculo.infoRuta.casetasTotal'));
		var gasConsumida = parseFloat(ctrl_home.mainR.get('calculo.infoRuta.gasConsumida'));
		var gasTotal = parseFloat(ctrl_home.mainR.get('calculo.infoRuta.gasTotal'));
		

		var viajeTipo = ctrl_home.mainR.get('calculo.infoVehiculo.viajeTipo')
		if(viajeTipo==0){
			var perc_regreso = 1 ;
		}	
		if(viajeTipo==1){
			var perc_regreso = (ctrl_home.mainR.get('calculo.infoVehiculo.perc_regreso')   / 100) ;
		}	
		if(viajeTipo==2){
			facTipo = 2;
			var perc_regreso =  1 + (ctrl_home.mainR.get('calculo.infoVehiculo.perc_regreso')  / 100) ;
		}	


		// Set Datos de Viaje 

		ctrl_home.mainR.set('calculo.infoRutaTotal.distanciaTotal',distanciaTotal*facTipo)
		ctrl_home.mainR.set('calculo.infoRutaTotal.tiempoTotal',tiempoTotal*facTipo)
		ctrl_home.mainR.set('calculo.infoRutaTotal.casetasNo',casetasNo*facTipo)
		ctrl_home.mainR.set('calculo.infoRutaTotal.casetasTotal',casetasTotal*facTipo)
		ctrl_home.mainR.set('calculo.infoRutaTotal.gasConsumida',gasConsumida*facTipo)
		ctrl_home.mainR.set('calculo.infoRutaTotal.gasTotal',gasTotal*facTipo)


		var variablesTotal ;

		// Totales de Viaje con factor
		var casetasTotalFac = parseFloat(ctrl_home.mainR.get('calculo.infoRutaTotal.casetasTotal'));
		var gasolinaTotalFac = parseFloat(ctrl_home.mainR.get('calculo.infoRutaTotal.gasTotal'));

		var totalRuta = parseFloat(gasolinaTotalFac + casetasTotalFac);

		// Calculo de Factores

		var kmTot = distanciaTotal/1000;
		var tarifa = ((ctrl_home.getTarifa(kmTot).tarifa) * (ctrl_home.mainR.get('calculo.parametros.facCostos')/100) ) 
		
		var totalCostos = tarifa * facTipo;

		ctrl_home.mainR.set('calculo.variables.total',totalCostos);

		if(facTipo==2){
			var totalConj = (totalRuta + totalCostos) /2 ;	
		}else{
			var totalConj = (totalRuta + totalCostos) ;
		}

		
		// Porcentajes de Utilidad	
		// IDA
		var percGananciaIda = parseFloat(ctrl_home.mainR.get('calculo.parametros.perc_ganancia'));
		var gananciaIda = totalConj * (percGananciaIda/100) || 0;
		ctrl_home.mainR.set('calculo.variables.gananciaIda',gananciaIda)

		// REGRESO
		var gananciaRegreso = 0;
		if(facTipo==2){
			var percGananciaRegreso = parseFloat(ctrl_home.mainR.get('calculo.parametros.perc_regreso'));
				var gananciaRegreso = totalConj * (percGananciaRegreso/100) || 0;
		}

		var utilidadTotal = gananciaIda + gananciaRegreso;
		ctrl_home.mainR.set('calculo.variables.utilidadTotal',utilidadTotal)
		
		ctrl_home.mainR.set('calculo.variables.gananciaRegreso',gananciaRegreso)

		// Gastos Totales
		var gastosTotales = totalRuta + totalCostos;
		ctrl_home.mainR.set('calculo.variables.gastos', gastosTotales)

		var subTotal =  totalRuta +  totalCostos + gananciaIda  + gananciaRegreso;
		ctrl_home.mainR.set('calculo.variables.subtotal_general', subTotal)

		// Impuestos
		var impuestos =subTotal * .16;
		ctrl_home.mainR.set('calculo.variables.impuestos',impuestos)

		var totalConImp = subTotal + impuestos
		// Total
		ctrl_home.mainR.animate('calculo.variables.total_general', totalConImp,{duration:200}  )

		ctrl_home.mainR.updateModel();
	}
}




var gGeo = {
	//Vars
	defaultLat: 20.530691,
	defaultLng: -100.810774,	
	zoom : 12,
	defaultPin : "D76627",
	direccion : "",
	dirParts : {},
	startGeo : {},
	finalGeo : {},
	geoTimer : {},
	inputBox1 : {},
	inputBox2 : {},
	line : [],
	lat :"", 
	lng :"",
	map  : {},
	userLocation : {},
	userMarker: {},
	marker : [],
	bounds : {},
	directionsService  : {},
	directionsDisplay  : {},	

	init : function(lat,lng){
		gGeo.bounds = new google.maps.LatLngBounds();
		gGeo.initMap();
	},

	initMap: function(){

		var latLng = new google.maps.LatLng(gGeo.defaultLat, gGeo.defaultLng)

		var mapOptions = {
			center : latLng,
			zoom : 16,
			mapTypeId : google.maps.MapTypeId.ROADMAP
		}

		 gGeo.map = new google.maps.Map(document.getElementById('ubica'),mapOptions)

		/* var markerImage = new google.maps.MarkerImage('/img/8B1D1B.png',
                new google.maps.Size(51, 43),
                new google.maps.Point(5, 0),
                new google.maps.Point(0, 0));

		gGeo.userMarker = new google.maps.Marker({
	      position: latLng,
	      map: gGeo.map,
	      title: 'tu ubicación',
	       draggable:true,
	    //  icon: markerImage
	  }); 

		google.maps.event.addListener(gGeo.userMarker,'dragend', function(event) {
			var loc = gGeo.userMarker.getPosition()
			gGeo.lat = loc.lat()
			gGeo.lng = loc.lng()
		    gGeo.setLocation(loc.lat(),loc.lng())
		    // Reverse Geo coding
		    gGeo.codeLatLng(gGeo.lat,gGeo.lng)
		  });

		  */ 

		//marker.setMap(gGeo.map);
		//gGeo.bounds.extend(gGeo.userMarker.position);

		gGeo.initAuto();
		gGeo.geoInit();

	},
	initAuto : function(){

		options = {
      language: 'es-MX',
      types: ['(cities)'],
      componentRestrictions: { country: "mx" }
    }

    	console.log("buscando seachbox")

		gGeo.inputBox1 = $('#iOrigen');
		var input = (document.getElementById('iOrigen'));
		var searchBox =  new google.maps.places.Autocomplete(input,options);

		google.maps.event.addListener(searchBox, 'place_changed', function () {
            var place = searchBox.getPlace()
            console.log(place)
            ctrl_home.selOrigen =  {
            	tipo : "origen",
            	nombre : place.formatted_address,
            	place_id : place.place_id,
            	lat : place.geometry.location.lat(),
            	lng : place.geometry.location.lng(),
            }

                console.log(ctrl_home.selOrigen,"PLACES")
        });

        selectFirstOnEnter(document.getElementById('iOrigen'));



		//-----------------------------------------------------

		gGeo.inputBox2 = $('#iDestino');
		var input = (document.getElementById('iDestino'));
		var searchBox2 =  new google.maps.places.Autocomplete(input,options);

		google.maps.event.addListener(searchBox2, 'place_changed', function () {
            var place = searchBox2.getPlace()
            ctrl_home.selDestino =  {
            	tipo : "destino",
            	nombre : place.formatted_address,
            	place_id : place.place_id,
            	lat : place.geometry.location.lat(),
            	lng : place.geometry.location.lng(),
            }
        });

         selectFirstOnEnter(document.getElementById('iDestino'));

        //-----------------------------------------------------


	},
	geoInit : function(){

		//gGeo.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

		// Zoom after Bounds
		google.maps.event.addListener(gGeo.map, 'bounds_changed', function(event) {
			  if (gGeo.map.getZoom() > 18) {
			    gGeo.map.setZoom(18);
			  }
			});

	    
	},
	setLocation : function(lat,lng){
		// location change

		if(ctrl_web.viewOn=="mapa"){
    		ctrl_web.getLoc(ctrl_web.mapaRet);
    	}else {
    		ctrl_web.getLoc(ctrl_web.licListRet);
    	}
	    gGeo.setMapCookies();

		gGeo.map.panTo(new google.maps.LatLng( lat, lng) )
		gGeo.userMarker.setPosition( new google.maps.LatLng( lat, lng ) );
		$('#lat').val(lat)
		$('#lng').val(lng)

		ctrl_web.getLoc(ctrl_web.locationChange);

	},
	setMapCookies : function(){
		console.log("setting map cookies")
		var d = new Date();
   		d.setTime(d.getTime() + (1*24*60*60*1000));
    	document.cookie="lat="+ gGeo.lat +";expires="+d.toUTCString();
    	document.cookie="lng="+ gGeo.lng +";expires="+d.toUTCString();
    	document.cookie="direccion="+ gGeo.direccion +";expires="+d.toUTCString();
	},
	fitBounds: function(){
		var bounds = new L.LatLngBounds(gGeo.userMarker);
		gGeo.map.fitBounds(bounds);
	},
	clearPins : function(){
		 for(i=0;i<gGeo.marker.length;i++) {
		 	gGeo.marker[i].setMap(null)
		 	}
		    gGeo.marker = [];

		    // Clear Polylines
		    for (i=0; i<gGeo.line.length; i++) 
			{                           
			  gGeo.line[i].setMap(null); //or line[i].setVisible(false);
			}
	},

	addRoute : function(route){

		gGeo.clearPins();

		for (var i = 0; i < route.length; i++) {
			for (var a = 0; a < route[i][11].length; a++) {		 
				if(route[i][11][a+1]!=undefined){
				var line = new google.maps.Polyline({
				    path: [
				        new google.maps.LatLng(route[i][11][a][1],route[i][11][a][0]), 
				        new google.maps.LatLng(route[i][11][a+1][1],route[i][11][a+1][0])
				    ],
				    strokeColor: "#FF0000",
				    strokeOpacity: 1.0,
				    strokeWeight: 1,
				    map: gGeo.map
				});
				gGeo.line.push(line);
				}
			}
			
		}
			
				
	},
	addPins : function(data){

		for (var r = 0; r < data.length; r++) {
			//var logoURL = data[r].BUSSINESS.LOGOTIPO;
			// COLOR			
			var latLng = new google.maps.LatLng(data[r].lat,data[r].lng)

			console.log(data[r])

			var htmlMarker = gGeo.renderMarker(data[r])


			var Marker  = new RichMarker({
			      position: latLng,
			      map: gGeo.map,
			      content: htmlMarker,
			      shadow: 'none'
			      //icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
			  });
			
        	gGeo.marker.push(Marker); 
		}

		var allMarkers = gGeo.marker.slice()
		//allMarkers.push(gGeo.userMarker)
		gGeo.map.fitBounds(allMarkers.reduce(function(bounds, marker) {
		    return bounds.extend(marker.getPosition());
		}, new google.maps.LatLngBounds()));


	},	
	renderMarker : function(data){
		var html = '';

		//data.subStr = data.match.trunc(15);

		var dat = {
			data : data
		}

		//html = template.render('#customPin','#preRenderPin',dat).toHTML()

		switch(data.tipo){
			case "origen" :  html = template.render('#origenPin','#preRenderPin',dat).toHTML() ; break;
			case "destino" :  html = template.render('#destinoPin','#preRenderPin',dat).toHTML() ; break;
			case "caseta" :  html = template.render('#origenPin','#preRenderPin',dat).toHTML() ; break;
			
		}


		return html
	},
	myLocation : function(callback){
			if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(function(position) {
	      gGeo.lat =  position.coords.latitude
	      gGeo.lng =  position.coords.longitude
	      gGeo.setLocation(gGeo.lat,gGeo.lng)
	      gGeo.codeLatLng(gGeo.lat,gGeo.lng)
	    }, function() {
	      handleLocationError(true, infoWindow, map.getCenter());
	    });
	  } else {
	    // Browser doesn't support Geolocation
	    handleLocationError(false, infoWindow, map.getCenter());
	  }


	},
	geocodeAddress : function(geocoder, resultsMap,fullAdd) {
		  var address = fullAdd
		  geocoder.geocode({'address': address}, function(results, status) {
		    if (status === google.maps.GeocoderStatus.OK) {
		      resultsMap.setCenter(results[0].geometry.location);
		      var marker = new google.maps.Marker({
		        map: resultsMap,
		        position: results[0].geometry.location

		      });
		      		$('#lat').val(results[0].geometry.location.lat())
					$('#lng').val(results[0].geometry.location.lng())
		    } else {
		      alert('Geocode was not successful for the following reason: ' + status);
		    }
		  });
	},
	codeLatLng : function(lat,lng){  // Get geo text 
        gGeo.startGeo = new Date().getTime();
        var timeOn = (Math.abs(gGeo.finalGeo - gGeo.startGeo))
        if(!timeOn || timeOn>2000){
            gGeo.initLatLng(lat, lng);    
        } else {
            //gGeo.userLocation.bindPopup('<div id="loaderGeo"><img src="../images/gif-load.gif" style="text-align:center;width:20px;height:20px;"></div>').openPopup();
            clearTimeout(gGeo.geoTimer);
            gGeo.geoTimer=setTimeout(function(){ gGeo.initLatLng(lat, lng)},2000);
        }
    },
    initLatLng : function(lat, lng) {
        var geocoder;
        geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(lat, lng);
        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                var parts = results[0].address_components
                   gGeo.dirParts = {
                   		numero 	: parts[0].long_name,
                   		calle	: parts[1].long_name,
                   		colonia : parts[2].long_name,
                   		ciudad  : parts[3].long_name,
                   		estado 	: parts[4].long_name,
                   		pais 	: parts[5].long_name,
                   		cp 		: parts[6].long_name,
                   }
                 gGeo.inputBox.val(results[0].formatted_address);
                 gGeo.setMapCookies();
                 gGeo.finalGeo = new Date().getTime();
                 // if(profileImage){
                //  gGeo.userLocation.bindPopup('<img id="fotito2" class=\"fb-photo img-polaroid\" src=\"https://' + profileImage  + '\">').openPopup();
                 //   }
                } else {
                   console.log('No results found');
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    }
}


var selectFirstOnEnter = function(input){      // store the original event binding function
    var _addEventListener = (input.addEventListener) ? input.addEventListener : input.attachEvent;
    function addEventListenerWrapper(type, listener) { // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected, and then trigger the original listener.
    if (type == "keydown") { 
      var orig_listener = listener;
      listener = function (event) {
      var suggestion_selected = $(".pac-item-selected").length > 0;
      console.log(event.which)
        if ((event.which == 13 || event.which==9) && !suggestion_selected) { var simulated_downarrow = $.Event("keydown", {keyCode:40, which:40}); orig_listener.apply(input, [simulated_downarrow]); }
        orig_listener.apply(input, [event]);
      };
    }
    _addEventListener.apply(input, [type, listener]); // add the modified listener
  }
  if (input.addEventListener) { input.addEventListener = addEventListenerWrapper; } else if (input.attachEvent) { input.attachEvent = addEventListenerWrapper; }
}


function haversineDistance(coords1, coords2, isMiles) {
  function toRad(x) {
    return x * Math.PI / 180;
  }

  var lon1 = coords1[0];
  var lat1 = coords1[1];

  var lon2 = coords2[0];
  var lat2 = coords2[1];

  var R = 6371; // km

  var x1 = lat2 - lat1;
  var dLat = toRad(x1);
  var x2 = lon2 - lon1;
  var dLon = toRad(x2)
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  //if(isMiles) d /= 1.60934;

  return d;
}
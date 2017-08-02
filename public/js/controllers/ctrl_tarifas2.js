/**********************************************************
*	SIGNUP CONTROLLER
todo

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
		ctrl_home.render();
		ctrl_login.initSocket();
	},
 /*---------------------------------------------------------------------------------
 *	Socket Controller
 *--------------------------------------------------------------------------------*/
    initSocket : function(){

    	console.log("iniciando socket")

    	socket.on('connect', function () { 
    		console.log("connecting remote")
    		socket.emit('create',userRoom);  

    		socket.on('joined', function(response){
    			console.log("4- Socket join")
    			createGrowl("Group info","Conectado a transporte.red",false,'bg_ok','conn');
    			ctrl_home.render()
    			// INIT LOCAL DATABASE
        		
      		});

	        socket.on('reconnect_error', function(err) {  //Fired upon a reconnection attempt error.Parameters:
	        	console.log(err)
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
    getPlace : function(valor){

    	var url = 'http://gaia.inegi.org.mx/sakbe/wservice';
    	var data = {
					"key" : "T34JkNDI-g8JV-3IX6-IvRH-kNt5wu97qPIT",
					"type" : 'json',
					"buscar" : valor,
					"make" : 'SD',
				}

    	$.getJSON( url, data,function( json ) {  
    		console.log(json)
    	});
 
    },


    getRoute: function(){


    	gGeo.directionsService = new google.maps.DirectionsService();
    	gGeo.directionsDisplay = new google.maps.DirectionsRenderer();
		gGeo.directionsDisplay.setPanel(document.getElementById('directions-panel'));

		gGeo.directionsDisplay.setMap(gGeo.map);

		 gGeo.directionsService.route({
		    origin: $('#iOrigen').val(),
		    destination: $('#iDestino').val(),
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


                var latP = overviewPath[i].lat();
                var lngP = overviewPath[i].lng();

                for (var a = 0; a < casetas.length; a++) {
                	var latC = casetas[a].coordenada_latitud_en_grados;
                	var lngC = casetas[a].coordenada_longitud_en_grados;
                	var dist = haversineDistance([latP,lngP],[latC,lngC])

                	if(dist<1){
                		console.log()
                		if(!casetasArr[casetas[a].caseta]){
                			casetasArr[casetas[a].caseta] = casetas[a]
                		}
                		
                	}
                	

                }
            }


            console.log(casetasArr,"CASETAS")




            console.log(overviewPathGeo)
		    if (status === google.maps.DirectionsStatus.OK) {
		      gGeo.directionsDisplay.setDirections(response);
		    } else {
		      window.alert('Directions request failed due to ' + status);
		    }
		  });
    	
    },
	render:function(){

		ctrl_home.mainR = template.render('#homeT','#content',	{lan	: ctrl_home.lan,
															toogle:ctrl_home.toogle,
														 	data:{strOrigen:"",strDestino:""}
														}
									);


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

		 

	},
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

		var latLng = new google.maps.LatLng(gGeo.lat, gGeo.lng)

		var mapOptions = {
			center : latLng,
			zoom : 16,
			mapTypeId : google.maps.MapTypeId.ROADMAP
		}

		 gGeo.map = new google.maps.Map(document.getElementById('ubica'),mapOptions)

		 var markerImage = new google.maps.MarkerImage('/img/8B1D1B.png',
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

		//marker.setMap(gGeo.map);
		gGeo.bounds.extend(gGeo.userMarker.position);

		gGeo.initAuto();
		gGeo.geoInit();

	},
	initAuto : function(){

		options = {
      language: 'es-MX',
      types: ['(cities)'],
      componentRestrictions: { country: "mx" }
    }


		gGeo.inputBox1 = $('#iOrigen');
		var input = (document.getElementById('iOrigen'));
		var searchBox =  new google.maps.places.Autocomplete(input,options);

		gGeo.inputBox2 = $('#iDestino');
		var input = (document.getElementById('iDestino'));
		var searchBox =  new google.maps.places.Autocomplete(input,options);
	},
	geoInit : function(){

		//gGeo.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

		

		// Zoom after Bounds
		google.maps.event.addListener(gGeo.map, 'bounds_changed', function(event) {
			  if (gGeo.map.getZoom() > 18) {
			    gGeo.map.setZoom(18);
			  }
			});

	    google.maps.event.addListener(gGeo.inputBox1, 'places_changed', function () {
	
            var places = searchBox.getPlaces();
                if (places.length== 0) {
                    return;
                }
                
                console.log(places,"PLACES")

                if(places[0].geometry.location.lat()!=undefined){
	                	gGeo.lat = places[0].geometry.location.lat();
	                	gGeo.lng = places[0].geometry.location.lng();
	                	gGeo.direccion = input.value;
	                	gGeo.setLocation(places[0].geometry.location.lat(),places[0].geometry.location.lng());

	                var address = '';
	                if (places[0].address_components) {
	                    address = [
	                        (places[0].address_components[0] && places[0].address_components[0].short_name || ''),
	                        (places[0].address_components[1] && places[0].address_components[1].short_name || ''),
	                        (places[0].address_components[2] && places[0].address_components[2].short_name || '')
	                    ].join(' ');
	                }
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
	},
	addPins : function(data){

		gGeo.clearPins();
		for (var r = 0; r < data.length; r++) {
			//var logoURL = data[r].BUSSINESS.LOGOTIPO;
			// COLOR			
			var latLng = new google.maps.LatLng(data[r].loc[0],data[r].loc[1])


			var htmlMarker = ctrl_web.renderMarker(data[r])


			var Marker  = new RichMarker({
			      position: latLng,
			      map: gGeo.map,
			      content: htmlMarker,
			      shadow: 'none',
			      //icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
			  });
			
        	gGeo.marker.push(Marker); 
		}

		var allMarkers = gGeo.marker.slice()
		allMarkers.push(gGeo.userMarker)
		gGeo.map.fitBounds(allMarkers.reduce(function(bounds, marker) {
		    return bounds.extend(marker.getPosition());
		}, new google.maps.LatLngBounds()));


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

var byProperty = function(prop) {
	    return function(a,b) {
	        if (typeof a[prop] == "number") {
	            return (a[prop] - b[prop]);
	        } else {
	            return ((a[prop] < b[prop]) ? -1 : ((a[prop] > b[prop]) ? 1 : 0));
	        }
	    };
	};


/*
OTRO API INEGI

  getPlaceP : function(valor){

    var url = 'http://gaiamapas.inegi.org.mx/mdmSearchEngine/busq-ruteodestinos/shard?json.wrf=?';
    	var data = {
					q:valor,
					wt:'json',
					indent:true,
					facet:true,
					'facet.field':'tipo'
				}

    	$.getJSON( url, data,function( json ) {  
    		ctrl_home.orRs = json.response.docs;
    		ctrl_home.renderOrigenRes(json.response.docs)
    	});

    
    },
    getPlaceD : function(valor){

    var url = 'http://gaiamapas.inegi.org.mx/mdmSearchEngine/busq-ruteodestinos/shard?json.wrf=?';
    	var data = {
					q:valor,
					wt:'json',
					indent:true,
					facet:true,
					'facet.field':'tipo'
				}

    	$.getJSON( url, data,function( json ) {  
    		ctrl_home.deRs = json.response.docs;
    		ctrl_home.renderDestinoRes(json.response.docs)
    	});

    
    },

    */




   var casetas = [
{
autopista: "Acatzingo - Cd. Mendoza",
caseta: "Esperanza",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.870777",
coordenada_longitud_en_grados: "-97.385869",
iave: "SI",
longitud_en_km: "92.950",
operador: "CAPUFE",
tramo_de_cobro: "  Acatzingo - Cd. Mendoza",
ubicaci_n_de_caseta_en_km: "  217+500"
},
{
autopista: "Acatzingo - Cd. Mendoza",
caseta: "Esperanza",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.870777",
coordenada_longitud_en_grados: "-97.385869",
iave: "SI",
longitud_en_km: "47.375",
operador: "CAPUFE",
tramo_de_cobro: "  Acatzingo - Esperanza",
ubicaci_n_de_caseta_en_km: "  217+501"
},
{
autopista: "Acatzingo - Cd. Mendoza",
caseta: "Esperanza",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.870777",
coordenada_longitud_en_grados: "-97.385869",
iave: "SI",
longitud_en_km: "45.575",
operador: "CAPUFE",
tramo_de_cobro: "Esperanza - Cd. Mendoza",
ubicaci_n_de_caseta_en_km: "  217+502"
},
{
autopista: "Amozoc - Perote y Libramiento de Perote",
caseta: "Amozoc II",
concesionario: "GRUPO AUTOPISTAS NACIONALES S. A. DE C. V.",
coordenada_latitud_en_grados: "19.063585",
coordenada_longitud_en_grados: "-98.069075",
iave: "NO",
longitud_en_km: "25.700",
operador: "GRUPO AUTOPISTAS NACIONALES S. A. DE C. V.",
tramo_de_cobro: "  Amozoc - Ent. Ixtenco",
ubicaci_n_de_caseta_en_km: "  1+000"
},
{
autopista: "Amozoc - Perote y Libramiento de Perote",
caseta: "Cantona",
concesionario: "GRUPO AUTOPISTAS NACIONALES S. A. DE C. V.",
coordenada_latitud_en_grados: "19.507568",
coordenada_longitud_en_grados: "-97.497774",
iave: "NO",
longitud_en_km: "55.500",
operador: "GRUPO AUTOPISTAS NACIONALES S. A. DE C. V.",
tramo_de_cobro: "  Ent. Oriental - Ent. Perote II",
ubicaci_n_de_caseta_en_km: "  1+000"
},
{
autopista: "Amozoc - Perote y Libramiento de Perote",
caseta: "Cantona A1",
concesionario: "GRUPO AUTOPISTAS NACIONALES S. A. DE C. V.",
coordenada_latitud_en_grados: "19.506554",
coordenada_longitud_en_grados: "-97.495453",
iave: "NO",
longitud_en_km: "18.800",
operador: "GRUPO AUTOPISTAS NACIONALES S. A. DE C. V.",
tramo_de_cobro: "  Ent. Oriental - Ent. Cantona",
ubicaci_n_de_caseta_en_km: "  1+000"
},
{
autopista: "Amozoc - Perote y Libramiento de Perote",
caseta: "Cantona A2",
concesionario: "GRUPO AUTOPISTAS NACIONALES S. A. DE C. V.",
coordenada_latitud_en_grados: "19.508966",
coordenada_longitud_en_grados: "-97.497172",
iave: "NO",
longitud_en_km: "36.700",
operador: "GRUPO AUTOPISTAS NACIONALES S. A. DE C. V.",
tramo_de_cobro: "  Ent. Cantona - Ent. Perote II",
ubicaci_n_de_caseta_en_km: "  1+000"
},
{
autopista: "Amozoc - Perote y Libramiento de Perote",
caseta: "Cuapiaxtla",
concesionario: "GRUPO AUTOPISTAS NACIONALES S. A. DE C. V.",
coordenada_latitud_en_grados: "19.310368",
coordenada_longitud_en_grados: "-97.797562",
iave: "NO",
longitud_en_km: "35.800",
operador: "GRUPO AUTOPISTAS NACIONALES S. A. DE C. V.",
tramo_de_cobro: "  Ent. Ixtenco - Ent. Oriental",
ubicaci_n_de_caseta_en_km: "  1+000"
},
{
autopista: "Amozoc - Perote y Libramiento de Perote",
caseta: "Cuapiaxtla A1",
concesionario: "GRUPO AUTOPISTAS NACIONALES S. A. DE C. V.",
coordenada_latitud_en_grados: "19.304147",
coordenada_longitud_en_grados: "-97.805436",
iave: "NO",
longitud_en_km: "14.000",
operador: "GRUPO AUTOPISTAS NACIONALES S. A. DE C. V.",
tramo_de_cobro: "  Ent. Ixtenco - Ent. Cuapiaxtla",
ubicaci_n_de_caseta_en_km: "  1+000"
},
{
autopista: "Amozoc - Perote y Libramiento de Perote",
caseta: "Cuapiaxtla A2",
concesionario: "GRUPO AUTOPISTAS NACIONALES S. A. DE C. V.",
coordenada_latitud_en_grados: "19.304378",
coordenada_longitud_en_grados: "-97.805668",
iave: "NO",
longitud_en_km: "21.800",
operador: "GRUPO AUTOPISTAS NACIONALES S. A. DE C. V.",
tramo_de_cobro: "  Ent. Cuapiaxtla - Ent. Oriental",
ubicaci_n_de_caseta_en_km: "  1+000"
},
{
autopista: "Amozoc - Perote y Libramiento de Perote",
caseta: "Perote",
concesionario: "GRUPO AUTOPISTAS NACIONALES S. A. DE C. V.",
coordenada_latitud_en_grados: "19.55172",
coordenada_longitud_en_grados: "-97.289536",
iave: "NO",
longitud_en_km: "18.000",
operador: "GRUPO AUTOPISTAS NACIONALES S. A. DE C. V.",
tramo_de_cobro: "  Libramiento de Perote",
ubicaci_n_de_caseta_en_km: " 3+000"
},
{
autopista: "Armería - Manzanillo",
caseta: "Cuyutlán",
concesionario: "PROMOTORA DE AUTOPISTAS DEL PACÍFICO S. A. DE C. V.",
coordenada_latitud_en_grados: "18.927786",
coordenada_longitud_en_grados: "-104.081504",
iave: "NO",
longitud_en_km: "47.000",
operador: "OPERVITE S. A. DE C. V.",
tramo_de_cobro: "  Armería - Manzanillo",
ubicaci_n_de_caseta_en_km: "  61+350"
},
{
autopista: "Arriaga - Ocozocoautla",
caseta: "Arriaga",
concesionario: "CONCESIONARIA DE AUTOPISTAS DEL SURESTE",
coordenada_latitud_en_grados: "16.245558",
coordenada_longitud_en_grados: "-93.880876",
iave: "NO",
longitud_en_km: "20",
operador: "CONCESIONARIA DE AUTOPISTAS DEL SURESTE S. A. DE C. V.",
tramo_de_cobro: " Arriaga - Tierra y Libertad",
ubicaci_n_de_caseta_en_km: " 1+000"
},
{
autopista: "Arriaga - Ocozocoautla",
caseta: "Jiquipilas",
concesionario: "CONCESIONARIA DE AUTOPISTAS DEL SURESTE",
coordenada_latitud_en_grados: "16.620564",
coordenada_longitud_en_grados: "-93.60209",
iave: "NO",
longitud_en_km: "9.101",
operador: "CONCESIONARIA DE AUTOPISTAS DEL SURESTE S. A. DE C. V.",
tramo_de_cobro: "  Jiquipilas - Montes Azules",
ubicaci_n_de_caseta_en_km: "  62+500"
},
{
autopista: "Arriaga - Ocozocoautla",
caseta: "Ocozocuautla",
concesionario: "CONCESIONARIA DE AUTOPISTAS DEL SURESTE",
coordenada_latitud_en_grados: "16.738493",
coordenada_longitud_en_grados: "-93.400414",
iave: "NO",
longitud_en_km: "22.301",
operador: "CONCESIONARIA DE AUTOPISTAS DEL SURESTE S. A. DE C. V.",
tramo_de_cobro: "  Montes Azules - Ocozocoautla",
ubicaci_n_de_caseta_en_km: "  91+000"
},
{
autopista: "Arriaga - Ocozocoautla",
caseta: "Tierra y Libertad",
concesionario: "CONCESIONARIA DE AUTOPISTAS DEL SURESTE",
coordenada_latitud_en_grados: "16.368058",
coordenada_longitud_en_grados: "-93.867043",
iave: "NO",
longitud_en_km: "41.598",
operador: "CONCESIONARIA DE AUTOPISTAS DEL SURESTE S. A. DE C. V.",
tramo_de_cobro: "  Tierra y Libertad - Jiquipilas",
ubicaci_n_de_caseta_en_km: "  21+000"
},
{
autopista: "Atlacomulco - Maravatío",
caseta: "  Contepec",
concesionario: "BANOBRAS S.N.C.",
coordenada_latitud_en_grados: "19.876127",
coordenada_longitud_en_grados: "-100.177072",
iave: "NO",
longitud_en_km: "32.175",
operador: "CAPUFE",
tramo_de_cobro: "  Venta de Bravo - Maravatío",
ubicaci_n_de_caseta_en_km: "  133+100"
},
{
autopista: "Atlacomulco - Maravatío",
caseta: "  Contepec A1",
concesionario: "BANOBRAS S.N.C.",
coordenada_latitud_en_grados: "19.877644",
coordenada_longitud_en_grados: "-100.176358",
iave: "NO",
longitud_en_km: "32.175",
operador: "CAPUFE",
tramo_de_cobro: "  Venta de Bravo - Maravatío",
ubicaci_n_de_caseta_en_km: "  133+100"
},
{
autopista: "Atlacomulco - Maravatío",
caseta: "  Contepec A2",
concesionario: "BANOBRAS S.N.C.",
coordenada_latitud_en_grados: "19.875531",
coordenada_longitud_en_grados: "-100.176711",
iave: "NO",
longitud_en_km: "32.175",
operador: "CAPUFE",
tramo_de_cobro: "  Maravatío - Venta de Bravo",
ubicaci_n_de_caseta_en_km: "  133+100"
},
{
autopista: "Atlacomulco - Maravatío",
caseta: "  San Juanico",
concesionario: "BANOBRAS S.N.C.",
coordenada_latitud_en_grados: "19.830719",
coordenada_longitud_en_grados: "-99.905209",
iave: "NO",
longitud_en_km: "32.175",
operador: "CAPUFE",
tramo_de_cobro: "  Atlacomulco - Venta de Bravo",
ubicaci_n_de_caseta_en_km: "  103+200"
},
{
autopista: "Cadereyta - Reynosa",
caseta: "  Dr. Coss",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "25.813509",
coordenada_longitud_en_grados: "-99.169588",
iave: "NO",
longitud_en_km: "85.015",
operador: "CAPUFE",
tramo_de_cobro: "  Cadereyta - General Bravo",
ubicaci_n_de_caseta_en_km: "  119+700"
},
{
autopista: "Cadereyta - Reynosa",
caseta: "  General Bravo",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "25.813509",
coordenada_longitud_en_grados: "-99.169588",
iave: "NO",
longitud_en_km: "132.015",
operador: "CAPUFE",
tramo_de_cobro: "  Cadereyta - Reynosa",
ubicaci_n_de_caseta_en_km: "  120+000"
},
{
autopista: "Cadereyta - Reynosa",
caseta: "  General Bravo",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "25.813509",
coordenada_longitud_en_grados: "-99.169588",
iave: "NO",
longitud_en_km: "47.000",
operador: "CAPUFE",
tramo_de_cobro: "  General Bravo - La Sierrita",
ubicaci_n_de_caseta_en_km: "  120+000"
},
{
autopista: "Cadereyta - Reynosa",
caseta: "  Los Herreras",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "25.757295",
coordenada_longitud_en_grados: "-99.373856",
iave: "NO",
longitud_en_km: "63.815",
operador: "CAPUFE",
tramo_de_cobro: "  Cadereyta - Los Herreras",
ubicaci_n_de_caseta_en_km: "  98+900"
},
{
autopista: "Cadereyta - Reynosa",
caseta: "  Los Herreras",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "25.759393",
coordenada_longitud_en_grados: "-99.37416",
iave: "NO",
longitud_en_km: "21.200",
operador: "CAPUFE",
tramo_de_cobro: "  Los Herreras - General Bravo",
ubicaci_n_de_caseta_en_km: "  98+900"
},
{
autopista: "Cadereyta - Reynosa",
caseta: "  Los Ramones",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "25.656016",
coordenada_longitud_en_grados: "-99.631035",
iave: "NO",
longitud_en_km: "35.275",
operador: "CAPUFE",
tramo_de_cobro: "  Cadereyta - Los Ramones",
ubicaci_n_de_caseta_en_km: "  69+720"
},
{
autopista: "Cadereyta - Reynosa",
caseta: "  Los Ramones",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "25.662886",
coordenada_longitud_en_grados: "-99.628599",
iave: "NO",
longitud_en_km: "49.740",
operador: "CAPUFE",
tramo_de_cobro: "  Los Ramones - General Bravo",
ubicaci_n_de_caseta_en_km: "  69+720"
},
{
autopista: "Camargo - Delicias",
caseta: "  Altavista",
concesionario: "GOBIERNO DEL ESTADO DE CHIHUAHUA",
coordenada_latitud_en_grados: "27.730842",
coordenada_longitud_en_grados: "-105.197882",
iave: "NO",
longitud_en_km: "35.000",
operador: "GOBIERNO DEL ESTADO DE CHIHUAHUA",
tramo_de_cobro: "  Camargo - Conchos",
ubicaci_n_de_caseta_en_km: "  73+100"
},
{
autopista: "Camargo - Delicias",
caseta: "  Saucillo",
concesionario: "GOBIERNO DEL ESTADO DE CHIHUAHUA",
coordenada_latitud_en_grados: "28.04638",
coordenada_longitud_en_grados: "-105.329342",
iave: "NO",
longitud_en_km: "30.000",
operador: "GOBIERNO DEL ESTADO DE CHIHUAHUA",
tramo_de_cobro: "  Conchos - Delicias",
ubicaci_n_de_caseta_en_km: "  116+300"
},
{
autopista: "Cardel - Veracruz",
caseta: "  La Antigua",
concesionario: "GOBIERNO DEL ESTADO DE VERACRUZ",
coordenada_latitud_en_grados: "19.320385",
coordenada_longitud_en_grados: "-96.310715",
iave: "NO",
longitud_en_km: "29.880",
operador: "GOBIERNO DEL ESTADO DE VERACRUZ",
tramo_de_cobro: "  Cardel - Veracruz"
},
{
autopista: "Cardel - Veracruz",
caseta: "  San Julián",
concesionario: "GOBIERNO DEL ESTADO DE VERACRUZ",
coordenada_latitud_en_grados: "19.239276",
coordenada_longitud_en_grados: "-96.257899",
iave: "NO",
longitud_en_km: "7.910",
operador: "GOBIERNO DEL ESTADO DE VERACRUZ",
tramo_de_cobro: "  San Julián - Veracruz",
ubicaci_n_de_caseta_en_km: "  233+093"
},
{
autopista: "Cd. Cuauhtémoc - Osiris",
caseta: "  Zacatecas",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "22.710779",
coordenada_longitud_en_grados: "-102.448879",
iave: "NO",
longitud_en_km: "42.310",
operador: "CAPUFE",
tramo_de_cobro: "  Cd. Cuauhtemoc - Osiris",
ubicaci_n_de_caseta_en_km: "  31+000"
},
{
autopista: "Cd. Mendoza - Córdoba",
caseta: "  Fortín",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.907151",
coordenada_longitud_en_grados: "-96.999524",
iave: "SI",
longitud_en_km: "30.675",
operador: "CAPUFE",
tramo_de_cobro: "  Cd. Mendoza - Córdoba",
ubicaci_n_de_caseta_en_km: "  286+250"
},
{
autopista: "Cd. Mendoza - Córdoba",
caseta: "  Fortín Aux.",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.906565",
coordenada_longitud_en_grados: "-97.001589",
iave: "SI",
longitud_en_km: "23.175",
operador: "CAPUFE",
tramo_de_cobro: "  Cd. Mendoza - Fortín"
},
{
autopista: "Chamapa - Lechería",
caseta: " San Mateo A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.487334",
coordenada_longitud_en_grados: "-99.309881",
iave: "SI",
longitud_en_km: "23.176",
operador: "CAPUFE",
tramo_de_cobro: "  Cd. Mendoza - Fortín",
ubicaci_n_de_caseta_en_km: "  286+250"
},
{
autopista: "Chamapa - Lechería",
caseta: " San Mateo A2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.486228",
coordenada_longitud_en_grados: "-99.311503",
iave: "SI",
longitud_en_km: "23.177",
operador: "CAPUFE",
tramo_de_cobro: "  Cd. Mendoza - Fortín",
ubicaci_n_de_caseta_en_km: "  286+251"
},
{
autopista: "Chamapa - Lechería",
caseta: " San Mateo A3",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.487093",
coordenada_longitud_en_grados: "-99.310115",
iave: "SI",
longitud_en_km: "23.178",
operador: "CAPUFE",
tramo_de_cobro: "  Cd. Mendoza - Fortín",
ubicaci_n_de_caseta_en_km: "  286+252"
},
{
autopista: "Chamapa - Lechería",
caseta: " San Mateo A4",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.48819",
coordenada_longitud_en_grados: "-99.311068",
iave: "SI",
longitud_en_km: "23.179",
operador: "CAPUFE",
tramo_de_cobro: "  Cd. Mendoza - Fortín",
ubicaci_n_de_caseta_en_km: "  286+253"
},
{
autopista: "Chamapa - Lechería",
caseta: "  Lomas Verdes",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.519198",
coordenada_longitud_en_grados: "-99.286355",
iave: "SI",
longitud_en_km: "23.180",
operador: "CAPUFE",
tramo_de_cobro: "  Cd. Mendoza - Fortín",
ubicaci_n_de_caseta_en_km: "  286+254"
},
{
autopista: "Chamapa - Lechería",
caseta: " Madín A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.544632",
coordenada_longitud_en_grados: "-99.277049",
iave: "SI",
longitud_en_km: "23.181",
operador: "CAPUFE",
tramo_de_cobro: "  Cd. Mendoza - Fortín",
ubicaci_n_de_caseta_en_km: "  286+255"
},
{
autopista: "Chamapa - Lechería",
caseta: " Madín A2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.545601",
coordenada_longitud_en_grados: "-99.277405",
iave: "SI",
longitud_en_km: "23.182",
operador: "CAPUFE",
tramo_de_cobro: "  Cd. Mendoza - Fortín",
ubicaci_n_de_caseta_en_km: "  286+256"
},
{
autopista: "Chamapa - Lechería",
caseta: " Madín A3",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.548062",
coordenada_longitud_en_grados: "-99.276966",
iave: "SI",
longitud_en_km: "23.183",
operador: "CAPUFE",
tramo_de_cobro: "  Cd. Mendoza - Fortín",
ubicaci_n_de_caseta_en_km: "  286+257"
},
{
autopista: "Chamapa - Lechería",
caseta: " Madín A4",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.548788",
coordenada_longitud_en_grados: "-99.277298",
iave: "SI",
longitud_en_km: "23.184",
operador: "CAPUFE",
tramo_de_cobro: "  Cd. Mendoza - Fortín",
ubicaci_n_de_caseta_en_km: "  286+258"
},
{
autopista: "Chamapa - Lechería",
caseta: "  Atizapán",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.582535",
coordenada_longitud_en_grados: "-99.271137",
iave: "SI",
longitud_en_km: "23.185",
operador: "CAPUFE",
tramo_de_cobro: "  Cd. Mendoza - Fortín",
ubicaci_n_de_caseta_en_km: "  286+259"
},
{
autopista: "Chamapa - Lechería",
caseta: "  Lago de Guadalupe A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.608832",
coordenada_longitud_en_grados: "-99.237113",
iave: "SI",
longitud_en_km: "23.186",
operador: "CAPUFE",
tramo_de_cobro: "  Cd. Mendoza - Fortín",
ubicaci_n_de_caseta_en_km: "  286+260"
},
{
autopista: "Chamapa - Lechería",
caseta: "  Lago de Guadalupe A2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.60996",
coordenada_longitud_en_grados: "-99.236474",
iave: "SI",
longitud_en_km: "23.187",
operador: "CAPUFE",
tramo_de_cobro: "  Cd. Mendoza - Fortín",
ubicaci_n_de_caseta_en_km: "  286+261"
},
{
autopista: "Champotón - Campeche",
caseta: "  Seybaplaya",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.636259",
coordenada_longitud_en_grados: "-90.671564",
iave: "SI",
longitud_en_km: "39.500",
operador: "CAPUFE",
tramo_de_cobro: "  Champotón - Campeche",
ubicaci_n_de_caseta_en_km: "  32+000"
},
{
autopista: "Champotón - Campeche",
caseta: "  Seybaplaya",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.636259",
coordenada_longitud_en_grados: "-90.671564",
iave: "SI",
longitud_en_km: "24.500",
operador: "CAPUFE",
tramo_de_cobro: "  Seybaplaya - Campeche",
ubicaci_n_de_caseta_en_km: "  32+000"
},
{
autopista: "Champotón - Campeche",
caseta: "  Seybaplaya",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.636259",
coordenada_longitud_en_grados: "-90.671564",
iave: "SI",
longitud_en_km: "15.000",
operador: "CAPUFE",
tramo_de_cobro: "  Villa Madero - Seybaplaya",
ubicaci_n_de_caseta_en_km: "  32+000"
},
{
autopista: "Chapalilla - Compostela",
caseta: "  Compostela",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "21.229472",
coordenada_longitud_en_grados: "-104.887417",
iave: "SI",
longitud_en_km: "35.500",
operador: "CAPUFE",
tramo_de_cobro: "  Chapalilla - Compostela",
ubicaci_n_de_caseta_en_km: "  31+600"
},
{
autopista: "Córdoba - Veracruz",
caseta: "  Cuitláhuac",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.839454",
coordenada_longitud_en_grados: "-96.746941",
iave: "SI",
longitud_en_km: "45.000",
operador: "CAPUFE",
tramo_de_cobro: "  Córdoba - La Tinaja",
ubicaci_n_de_caseta_en_km: "  14+140"
},
{
autopista: "Córdoba - Veracruz",
caseta: "  Cuitláhuac A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.839314",
coordenada_longitud_en_grados: "-96.746978",
iave: "SI",
longitud_en_km: "14.140",
operador: "CAPUFE",
tramo_de_cobro: "  Córdoba - Cuitláhuac",
ubicaci_n_de_caseta_en_km: "  14+140"
},
{
autopista: "Córdoba - Veracruz",
caseta: "  Cuitláhuac A1-2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.839604",
coordenada_longitud_en_grados: "-96.746905",
iave: "SI",
longitud_en_km: "14.140",
operador: "CAPUFE",
tramo_de_cobro: "  Cuitláhuac - Córdoba",
ubicaci_n_de_caseta_en_km: "  14+140"
},
{
autopista: "Córdoba - Veracruz",
caseta: "  Cuitláhuac A2-1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.837511",
coordenada_longitud_en_grados: "-96.737458",
iave: "NO",
longitud_en_km: "30.860",
operador: "CAPUFE",
tramo_de_cobro: "  Cuitláhuac - La Tinaja",
ubicaci_n_de_caseta_en_km: "  14+600"
},
{
autopista: "Córdoba - Veracruz",
caseta: "  Cuitláhuac A2-2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.83865",
coordenada_longitud_en_grados: "-96.739512",
iave: "NO",
longitud_en_km: "30.860",
operador: "CAPUFE",
tramo_de_cobro: "  La Tinaja - Cuitláhuac",
ubicaci_n_de_caseta_en_km: "  14+600"
},
{
autopista: "Córdoba - Veracruz",
caseta: "  Paso del Toro",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.081747",
coordenada_longitud_en_grados: "-96.198438",
iave: "SI",
longitud_en_km: "44.900",
operador: "CAPUFE",
tramo_de_cobro: "  La Tinaja - Paso del Toro",
ubicaci_n_de_caseta_en_km: "  89+900"
},
{
autopista: "Córdoba - Veracruz",
caseta: "  Paso del Toro",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.081747",
coordenada_longitud_en_grados: "-96.198438",
iave: "SI",
longitud_en_km: "53.000",
operador: "CAPUFE",
tramo_de_cobro: "  La Tinaja - Veracruz",
ubicaci_n_de_caseta_en_km: "  89+900"
},
{
autopista: "Córdoba - Veracruz",
caseta: "  Paso del Toro",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.081747",
coordenada_longitud_en_grados: "-96.198438",
iave: "SI",
longitud_en_km: "8.100",
operador: "CAPUFE",
tramo_de_cobro: "  Paso del Toro - Veracruz",
ubicaci_n_de_caseta_en_km: "  89+900"
},
{
autopista: "Cuacnopalan - Oaxaca",
caseta: "  Huitzo",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "17.275026",
coordenada_longitud_en_grados: "-96.915277",
iave: "SI",
longitud_en_km: "64.500",
operador: "CAPUFE",
tramo_de_cobro: "  Nochixtlán-Oaxaca",
ubicaci_n_de_caseta_en_km: "  217+010"
},
{
autopista: "Cuacnopalan - Oaxaca",
caseta: "  Huitzo",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "17.275026",
coordenada_longitud_en_grados: "-96.915277",
iave: "SI",
longitud_en_km: "38.510",
operador: "CAPUFE",
tramo_de_cobro: "  Nochixtlán - Huitzo",
ubicaci_n_de_caseta_en_km: "  217+010"
},
{
autopista: "Cuacnopalan - Oaxaca",
caseta: "  Huitzo A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "17.278761",
coordenada_longitud_en_grados: "-96.914652",
iave: "NO",
longitud_en_km: "25.990",
operador: "CAPUFE",
tramo_de_cobro: "  Huitzo - Oaxaca",
ubicaci_n_de_caseta_en_km: "  217+010"
},
{
autopista: "Cuacnopalan - Oaxaca",
caseta: "  Miahuatlán",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.264673",
coordenada_longitud_en_grados: "-97.315627",
iave: "SI",
longitud_en_km: "30.367",
operador: "CAPUFE",
tramo_de_cobro: "  Tehuacán - Miahuatlán",
ubicaci_n_de_caseta_en_km: "  71+415"
},
{
autopista: "Cuacnopalan - Oaxaca",
caseta: "  Coixtlahuaca A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "17.726023",
coordenada_longitud_en_grados: "-97.353773",
iave: "NO",
longitud_en_km: "107.085",
operador: "CAPUFE",
tramo_de_cobro: "  Miahuatlán - Nochixtlán",
ubicaci_n_de_caseta_en_km: "  141+300"
},
{
autopista: "Cuacnopalan - Oaxaca",
caseta: "  Coixtlahuaca",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "17.725859",
coordenada_longitud_en_grados: "-97.352916",
iave: "SI",
longitud_en_km: "69.885",
operador: "CAPUFE",
tramo_de_cobro: "  Miahuatlán - Coixtlahuaca",
ubicaci_n_de_caseta_en_km: "  141+300"
},
{
autopista: "Cuacnopalan - Oaxaca",
caseta: "  Tehuacán",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.487127",
coordenada_longitud_en_grados: "-97.456212",
iave: "SI",
longitud_en_km: "41.048",
operador: "CAPUFE",
tramo_de_cobro: "  Cuacnopalan - Tehuacán",
ubicaci_n_de_caseta_en_km: "  41+048"
},
{
autopista: "Cuernavaca - Acapulco",
caseta: "  Aeropuerto A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.802293",
coordenada_longitud_en_grados: "-99.221241",
iave: "NO",
longitud_en_km: "9.800",
operador: "CAPUFE",
tramo_de_cobro: "  Cuernavaca - Aeropuerto",
ubicaci_n_de_caseta_en_km: "  104+800"
},
{
autopista: "Cuernavaca - Acapulco",
caseta: "  Aeropuerto A2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.802741",
coordenada_longitud_en_grados: "-99.219852",
iave: "NO",
longitud_en_km: "9.800",
operador: "CAPUFE",
tramo_de_cobro: "  Cuernavaca - Aeropuerto",
ubicaci_n_de_caseta_en_km: "  104+800"
},
{
autopista: "Cuernavaca - Acapulco",
caseta: "  Alpuyeca",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.69853",
coordenada_longitud_en_grados: "-99.278053",
iave: "SI",
longitud_en_km: "28.939",
operador: "CAPUFE",
tramo_de_cobro: "  Cuernavaca - Puente de Ixtla",
ubicaci_n_de_caseta_en_km: "  114+800"
},
{
autopista: "Cuernavaca - Acapulco",
caseta: "  Alpuyeca A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.723779",
coordenada_longitud_en_grados: "-99.260215",
iave: "NO",
longitud_en_km: "8.939",
operador: "CAPUFE",
tramo_de_cobro: "  Cuernavaca - Alpuyeca",
ubicaci_n_de_caseta_en_km: "  115+000"
},
{
autopista: "Cuernavaca - Acapulco",
caseta: "  Alpuyeca A2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.722419",
coordenada_longitud_en_grados: "-99.259948",
iave: "NO",
longitud_en_km: "20.000",
operador: "CAPUFE",
tramo_de_cobro: "  Alpuyeca - Cuernavaca",
ubicaci_n_de_caseta_en_km: "  115+000"
},
{
autopista: "Cuernavaca - Acapulco",
caseta: "  D.I.E.Z.",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.8375",
coordenada_longitud_en_grados: "-99.21537",
iave: "NO",
longitud_en_km: "7.000",
operador: "CAPUFE",
tramo_de_cobro: "  Cuernavaca - Central de Abastos",
ubicaci_n_de_caseta_en_km: "  102+000"
},
{
autopista: "Cuernavaca - Acapulco",
caseta: "  La Venta",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "16.928256",
coordenada_longitud_en_grados: "-99.801892",
iave: "SI",
longitud_en_km: "55.907",
operador: "CAPUFE",
tramo_de_cobro: "  Tierra Colorada - Acapulco",
ubicaci_n_de_caseta_en_km: "  364+900"
},
{
autopista: "Cuernavaca - Acapulco",
caseta: "  Palo Blanco",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "17.423967",
coordenada_longitud_en_grados: "-99.466861",
iave: "SI",
longitud_en_km: "34.713",
operador: "CAPUFE",
tramo_de_cobro: "  Chilpancingo - Tierra Colorada",
ubicaci_n_de_caseta_en_km: "  288+850"
},
{
autopista: "Cuernavaca - Acapulco",
caseta: "  Paso Morelos",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.231465",
coordenada_longitud_en_grados: "-99.215466",
iave: "SI",
longitud_en_km: "88.960",
operador: "CAPUFE",
tramo_de_cobro: "  Paso Morelos - Chilpancingo",
ubicaci_n_de_caseta_en_km: "  178+200"
},
{
autopista: "Cuernavaca - Acapulco",
caseta: "  Paso Morelos",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.231465",
coordenada_longitud_en_grados: "-99.215466",
iave: "SI",
longitud_en_km: "143.021",
operador: "CAPUFE",
tramo_de_cobro: "  Puente de Ixtla - Chilpancingo",
ubicaci_n_de_caseta_en_km: "  178+200"
},
{
autopista: "Cuernavaca - Acapulco",
caseta: "  Paso Morelos",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.231465",
coordenada_longitud_en_grados: "-99.215466",
iave: "SI",
longitud_en_km: "54.061",
operador: "CAPUFE",
tramo_de_cobro: "  Puente de Ixtla - Paso Morelos",
ubicaci_n_de_caseta_en_km: "  178+200"
},
{
autopista: "Cuernavaca - Acapulco",
caseta: "  Xochitepec",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.774978",
coordenada_longitud_en_grados: "-99.225314",
iave: "NO",
longitud_en_km: "13.072",
operador: "CAPUFE",
tramo_de_cobro: "  Cuernavaca - Xochitepec",
ubicaci_n_de_caseta_en_km: "  107+900"
},
{
autopista: "Cuernavaca - Acapulco",
caseta: "  Xochitepec",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.774978",
coordenada_longitud_en_grados: "-99.225314",
iave: "NO",
longitud_en_km: "6.928",
operador: "CAPUFE",
tramo_de_cobro: "  Xochitepec - Alpuyeca",
ubicaci_n_de_caseta_en_km: "  107+900"
},
{
autopista: "Durango - Mazatlán",
caseta: "  Garavitos",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "24.004477",
coordenada_longitud_en_grados: "-104.736419",
iave: "NO",
longitud_en_km: "44.900",
operador: "CAPUFE",
tramo_de_cobro: "  Libramiento de Durango - Entronque Otinapa",
ubicaci_n_de_caseta_en_km: "  22+100"
},
{
autopista: "Durango - Mazatlán",
caseta: "  Llano Grande",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "23.868815",
coordenada_longitud_en_grados: "-105.203958",
iave: "NO",
longitud_en_km: "59.100",
operador: "CAPUFE",
tramo_de_cobro: "  Entronque Otinapa - Piloncillo",
ubicaci_n_de_caseta_en_km: "  44+900"
},
{
autopista: "Durango - Mazatlán",
caseta: "  Mesillas",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "23.259302",
coordenada_longitud_en_grados: "-106.049587",
iave: "NO",
longitud_en_km: "58.300",
operador: "CAPUFE",
tramo_de_cobro: "  Santa Lucía - Villa Unión",
ubicaci_n_de_caseta_en_km: "  78+400"
},
{
autopista: "Durango - Yerbanís",
caseta: "  Durango",
concesionario: "AUTOPISTAS DE CUOTA S. A. DE C. V.",
coordenada_latitud_en_grados: "24.131735",
coordenada_longitud_en_grados: "-104.534058",
iave: "SI",
longitud_en_km: "49.000",
operador: "AUTOPISTAS DE CUOTA S. A. DE C. V.",
tramo_de_cobro: "  Durango - Guadalupe Victoria",
ubicaci_n_de_caseta_en_km: "  15+900"
},
{
autopista: "Durango - Yerbanís",
caseta: "  Yerbanís",
concesionario: "AUTOPISTAS DE CUOTA S. A. DE C. V.",
coordenada_latitud_en_grados: "24.730769",
coordenada_longitud_en_grados: "-103.861923",
iave: "SI",
longitud_en_km: "56.200",
operador: "AUTOPISTAS DE CUOTA S. A. DE C. V.",
tramo_de_cobro: "  Guadalupe Victoria - Yerbanís",
ubicaci_n_de_caseta_en_km: "  112+724"
},
{
autopista: "Ecatepec - Pirámides",
caseta: "  Ecatepec",
concesionario: "CONCESIONARIA ECATEPEC-PIRÁMIDES S. A. DE C. V.",
coordenada_latitud_en_grados: "19.611707",
coordenada_longitud_en_grados: "-99.025732",
iave: "NO",
longitud_en_km: "22.210",
operador: "OPERVITE S. A. DE C. V.",
tramo_de_cobro: "  Ecatepec - Pirámides",
ubicaci_n_de_caseta_en_km: "  1+187"
},
{
autopista: "Ecatepec - Pirámides",
caseta: "  Tepexpan",
concesionario: "CONCESIONARIA ECATEPEC-PIRÁMIDES S. A. DE C. V.",
iave: "NO",
longitud_en_km: "12.480",
operador: "OPERVITE S. A. DE C. V.",
tramo_de_cobro: "  Tepexpan - San Martín de las Pirámides",
ubicaci_n_de_caseta_en_km: "  9+725"
},
{
autopista: "El Centinela - La Rumorosa",
caseta: "  La Rumorosa",
concesionario: "GOBIERNO DEL ESTADO DE BAJA CALIFORNIA",
coordenada_latitud_en_grados: "32.562633",
coordenada_longitud_en_grados: "-116.047931",
iave: "NO",
longitud_en_km: "47.297",
operador: "GOBIERNO DEL ESTADO DE BAJA CALIFORNIA",
tramo_de_cobro: "  El Centinela - La Rumorosa",
ubicaci_n_de_caseta_en_km: "  47+000"
},
{
autopista: "El Centinela - La Rumorosa",
caseta: "  La Rumorosa 2",
concesionario: "GOBIERNO DEL ESTADO DE BAJA CALIFORNIA",
coordenada_latitud_en_grados: "32.555877",
coordenada_longitud_en_grados: "-116.036431",
iave: "NO",
longitud_en_km: "47.297",
operador: "GOBIERNO DEL ESTADO DE BAJA CALIFORNIA",
tramo_de_cobro: " La Rumorosa - El Centinela",
ubicaci_n_de_caseta_en_km: " 47+000"
},
{
autopista: "El Sueco - Villa Ahumada",
caseta: "  Villa Ahumada",
concesionario: "GOBIERNO DEL ESTADO DE CHIHUAHUA",
coordenada_latitud_en_grados: "30.437079",
coordenada_longitud_en_grados: "-106.52185",
iave: "NO",
longitud_en_km: "86.700",
operador: "GOBIERNO DEL ESTADO DE CHIHUAHUA",
tramo_de_cobro: "  El Sueco - Villa Ahumada",
ubicaci_n_de_caseta_en_km: "  219+000"
},
{
autopista: "Ensenada - Tijuana",
caseta: "  Ensenada",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "31.903121",
coordenada_longitud_en_grados: "-116.732727",
iave: "NO",
longitud_en_km: "33.766",
operador: "CAPUFE",
tramo_de_cobro: "  Ensenada - La Misión",
ubicaci_n_de_caseta_en_km: "  88+599"
},
{
autopista: "Ensenada - Tijuana",
caseta: "  Playas de Tijuana",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "32.514036",
coordenada_longitud_en_grados: "-117.109538",
iave: "NO",
longitud_en_km: "25.927",
operador: "CAPUFE",
tramo_de_cobro: "  Rosarito - Tijuana",
ubicaci_n_de_caseta_en_km: "  9+700"
},
{
autopista: "Ensenada - Tijuana",
caseta: "  Rosarito",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "32.32425",
coordenada_longitud_en_grados: "-117.049016",
iave: "NO",
longitud_en_km: "29.847",
operador: "CAPUFE",
tramo_de_cobro: "  La Misión - Rosarito",
ubicaci_n_de_caseta_en_km: "  35+427"
},
{
autopista: "Ent. Agua Dulce - Cárdenas",
caseta: "  Sánchez Magallanes",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.030565",
coordenada_longitud_en_grados: "-93.812954",
iave: "SI",
longitud_en_km: "53.300",
operador: "CAPUFE",
tramo_de_cobro: "  Ent. Agua Dulce - Cárdenas",
ubicaci_n_de_caseta_en_km: "  28+500"
},
{
autopista: "Ent. Agua Dulce - Cárdenas",
caseta: "  Sánchez Magallanes",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.029932",
coordenada_longitud_en_grados: "-93.813072",
iave: "NO",
longitud_en_km: "22.800",
operador: "CAPUFE",
tramo_de_cobro: "  Ent. Agua Dulce - Ent. Magallanes",
ubicaci_n_de_caseta_en_km: "  28+500"
},
{
autopista: "Ent. Agua Dulce - Cárdenas",
caseta: "  Sánchez Magallanes",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.031623",
coordenada_longitud_en_grados: "-93.813693",
iave: "NO",
longitud_en_km: "30.500",
operador: "CAPUFE",
tramo_de_cobro: "  Ent. Magallanes - Cárdenas",
ubicaci_n_de_caseta_en_km: "  28+500"
},
{
autopista: "Ent. Tulancingo - Venta Grande",
caseta: "  Asunción",
concesionario: "FIDEICOMISO AUTOPISTAS Y PUENTES DEL GOLFO CENTRO",
coordenada_latitud_en_grados: "20.147427",
coordenada_longitud_en_grados: "-98.285747",
iave: "NO",
longitud_en_km: "41.200",
operador: "CAPUFE",
tramo_de_cobro: "  Ent. Tulancingo - Venta Grande",
ubicaci_n_de_caseta_en_km: "  22+700"
},
{
autopista: "Ent. Tulancingo - Venta Grande",
caseta: "  Asunción A1",
concesionario: "FIDEICOMISO AUTOPISTAS Y PUENTES DEL GOLFO CENTRO",
coordenada_latitud_en_grados: "20.146458",
coordenada_longitud_en_grados: "-98.286939",
iave: "NO",
longitud_en_km: "22.700",
operador: "CAPUFE",
tramo_de_cobro: "  Ent. Asunción - Tejocotal",
ubicaci_n_de_caseta_en_km: "  22+700"
},
{
autopista: "Ent. Tulancingo - Venta Grande",
caseta: "  Asunción A2",
concesionario: "FIDEICOMISO AUTOPISTAS Y PUENTES DEL GOLFO CENTRO",
coordenada_latitud_en_grados: "20.150099",
coordenada_longitud_en_grados: "-98.286642",
iave: "NO",
longitud_en_km: "18.500",
operador: "CAPUFE",
tramo_de_cobro: "  Libramiento de Tulancingo",
ubicaci_n_de_caseta_en_km: "  22+700"
},
{
autopista: "Estación Don - Nogales",
caseta: "  Esperanza",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "27.603722",
coordenada_longitud_en_grados: "-109.93909",
iave: "NO",
longitud_en_km: "107.700",
operador: "CAPUFE",
tramo_de_cobro: "  Cd. Obregón - Guaymas",
ubicaci_n_de_caseta_en_km: "  10+700"
},
{
autopista: "Estación Don - Nogales",
caseta: "  Fundición",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "27.320373",
coordenada_longitud_en_grados: "-109.719802",
iave: "NO",
longitud_en_km: "63.800",
operador: "CAPUFE",
tramo_de_cobro: "  Navojoa - Cd. Obregón",
ubicaci_n_de_caseta_en_km: "  197+500"
},
{
autopista: "Estación Don - Nogales",
caseta: "  Guaymas",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "28.036494",
coordenada_longitud_en_grados: "-110.924164",
iave: "NO",
longitud_en_km: "21.500",
operador: "CAPUFE",
tramo_de_cobro: "  Libramiento de Guaymas",
ubicaci_n_de_caseta_en_km: "  3+200"
},
{
autopista: "Estación Don - Nogales",
caseta: "  Hermosillo",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "29.220733",
coordenada_longitud_en_grados: "-110.930184",
iave: "NO",
longitud_en_km: "169.900",
operador: "CAPUFE",
tramo_de_cobro: "  Hermosillo - Magdalena de Kino",
ubicaci_n_de_caseta_en_km: "  15+200"
},
{
autopista: "Estación Don - Nogales",
caseta: "  La Jaula",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "26.849818",
coordenada_longitud_en_grados: "-109.373311",
iave: "NO",
longitud_en_km: "85.200",
operador: "CAPUFE",
tramo_de_cobro: "  Estación Don - Navojoa",
ubicaci_n_de_caseta_en_km: "  129+900"
},
{
autopista: "Estación Don - Nogales",
caseta: "  Magdalena",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "30.629274",
coordenada_longitud_en_grados: "-110.948775",
iave: "NO",
longitud_en_km: "11.900",
operador: "CAPUFE",
tramo_de_cobro: "  Libramiento de Magdalena de Kino",
ubicaci_n_de_caseta_en_km: "  184+400"
},
{
autopista: "Gómez Palacio - Corralitos",
caseta: "  Bermejillo",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "25.923655",
coordenada_longitud_en_grados: "-103.622077",
iave: "SI",
longitud_en_km: "39.000",
operador: "CAPUFE",
tramo_de_cobro: "  Gómez Palacio - Estación Banderas",
ubicaci_n_de_caseta_en_km: "  44+210"
},
{
autopista: "Gómez Palacio - Corralitos",
caseta: "  Ceballos",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "26.586694",
coordenada_longitud_en_grados: "-104.057726",
iave: "SI",
longitud_en_km: "112.300",
operador: "CAPUFE",
tramo_de_cobro: "  Estación Banderas - Corralitos",
ubicaci_n_de_caseta_en_km: "  130+560"
},
{
autopista: "Guadalajara - Colima",
caseta: "  Acatlán",
concesionario: "BANOBRAS S.N.C.",
coordenada_latitud_en_grados: "20.415926",
coordenada_longitud_en_grados: "-103.55704",
iave: "NO",
longitud_en_km: "73.000",
operador: "CAPUFE",
tramo_de_cobro: "  Acatlán - Ciudad Guzmán",
ubicaci_n_de_caseta_en_km: "  1+650"
},
{
autopista: "Guadalajara - Colima",
caseta: "  San Marcos",
concesionario: "BANOBRAS S.N.C.",
coordenada_latitud_en_grados: "19.433636",
coordenada_longitud_en_grados: "-103.49487",
iave: "NO",
longitud_en_km: "73.000",
operador: "CAPUFE",
tramo_de_cobro: "  Cd. Guzmán - El Trapiche",
ubicaci_n_de_caseta_en_km: "  122+500"
},
{
autopista: "Guadalajara - Tepic",
caseta: "  Arenal",
concesionario: "CONCESIONARIA AUTOPISTA GUADALAJARA - TEPIC S.A. DE C.V.",
coordenada_latitud_en_grados: "20.778748",
coordenada_longitud_en_grados: "-103.662386",
iave: "SI",
longitud_en_km: "46.000",
operador: "CONCESIONARIA AUTOPISTA GUADALAJARA - TEPIC S.A. DE C.V.",
tramo_de_cobro: "  Ent. Ameca - Magdalena",
ubicaci_n_de_caseta_en_km: "  10+960"
},
{
autopista: "Guadalajara - Tepic",
caseta: "  Plan de Barrancas",
concesionario: "CONCESIONARIA AUTOPISTA GUADALAJARA - TEPIC S.A. DE C.V.",
coordenada_latitud_en_grados: "21.005379",
coordenada_longitud_en_grados: "-104.144084",
iave: "SI",
longitud_en_km: "51.454",
operador: "CONCESIONARIA AUTOPISTA GUADALAJARA - TEPIC S.A. DE C.V.",
tramo_de_cobro: "  Magdalena - Ixtlán del Río",
ubicaci_n_de_caseta_en_km: "  69+337"
},
{
autopista: "Guadalajara - Tepic",
caseta: "  Santa María del Oro",
concesionario: "CONCESIONARIA AUTOPISTA GUADALAJARA - TEPIC S.A. DE C.V.",
coordenada_latitud_en_grados: "21.328268",
coordenada_longitud_en_grados: "-104.664406",
iave: "SI",
longitud_en_km: "77.600",
operador: "CONCESIONARIA AUTOPISTA GUADALAJARA - TEPIC S.A. DE C.V.",
tramo_de_cobro: "  Ixtlán del Río - Tepic",
ubicaci_n_de_caseta_en_km: "  145+146"
},
{
autopista: "Guadalajara - Tepic",
caseta: "  Santa María A1",
concesionario: "CONCESIONARIA AUTOPISTA GUADALAJARA - TEPIC S.A. DE C.V.",
coordenada_latitud_en_grados: "21.327973",
coordenada_longitud_en_grados: "-104.663151",
iave: "NO",
longitud_en_km: "47.692",
operador: "CONCESIONARIA AUTOPISTA GUADALAJARA - TEPIC S.A. DE C.V.",
tramo_de_cobro: "  Ixtlán del Río - Santa María del Oro",
ubicaci_n_de_caseta_en_km: "  145+146"
},
{
autopista: "Guadalajara - Tepic",
caseta: "  Santa María A2",
concesionario: "CONCESIONARIA AUTOPISTA GUADALAJARA - TEPIC S.A. DE C.V.",
coordenada_latitud_en_grados: "21.327052",
coordenada_longitud_en_grados: "-104.664677",
iave: "NO",
longitud_en_km: "21.690",
operador: "CONCESIONARIA AUTOPISTA GUADALAJARA - TEPIC S.A. DE C.V.",
tramo_de_cobro: "  Santa María del Oro - Tepic",
ubicaci_n_de_caseta_en_km: "  145+146"
},
{
autopista: "Guadalajara - Tepic",
caseta: "  Tequepexpan A1",
concesionario: "CONCESIONARIA AUTOPISTA GUADALAJARA - TEPIC S.A. DE C.V.",
coordenada_latitud_en_grados: "21.213906",
coordenada_longitud_en_grados: "-104.592673",
iave: "NO",
longitud_en_km: "32.910",
operador: "CONCESIONARIA AUTOPISTA GUADALAJARA - TEPIC S.A. DE C.V.",
tramo_de_cobro: "  Ixtlán del Río - Tequepexpan",
ubicaci_n_de_caseta_en_km: "  131+910"
},
{
autopista: "Guadalajara - Tepic",
caseta: " Tequepexpan A2",
concesionario: "CONCESIONARIA AUTOPISTA GUADALAJARA - TEPIC S.A. DE C.V.",
coordenada_latitud_en_grados: "21.213664",
coordenada_longitud_en_grados: "-104.594174",
iave: "NO",
longitud_en_km: "32.911",
operador: "CONCESIONARIA AUTOPISTA GUADALAJARA - TEPIC S.A. DE C.V.",
tramo_de_cobro: " Tequepexpan - Ixtlán del Río",
ubicaci_n_de_caseta_en_km: "  131+910"
},
{
autopista: "Guadalajara - Tepic",
caseta: "  Tequila",
concesionario: "CONCESIONARIA AUTOPISTA GUADALAJARA - TEPIC S.A. DE C.V.",
coordenada_latitud_en_grados: "20.854129",
coordenada_longitud_en_grados: "-103.861211",
iave: "NO",
longitud_en_km: "12.260",
operador: "CONCESIONARIA AUTOPISTA GUADALAJARA - TEPIC S.A. DE C.V.",
tramo_de_cobro: "  Tequila - Magdalena",
ubicaci_n_de_caseta_en_km: "  32+700"
},
{
autopista: "Guadalajara - Zapotlanejo",
caseta: "  La Joya",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "20.604788",
coordenada_longitud_en_grados: "-103.138943",
iave: "SI",
longitud_en_km: "26.000",
operador: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Guadalajara - Zapotlanejo",
ubicaci_n_de_caseta_en_km: "  19+000"
},
{
autopista: "Gutiérrez Zamora - Tihuatlán",
caseta: "  Cazones1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "20.469874",
coordenada_longitud_en_grados: "-97.254669",
iave: "NO",
longitud_en_km: "26.104",
operador: "CAPUFE",
tramo_de_cobro: "  Totomoxtle - Ent. Poza Rica",
ubicaci_n_de_caseta_en_km: "  181+500"
},
{
autopista: "Gutiérrez Zamora - Tihuatlán",
caseta: "  Cazones2",
concesionario: "BANOBRAS FONADIN",
iave: "NO",
longitud_en_km: "9.372",
operador: "CAPUFE",
tramo_de_cobro: "  Ent. Poza Rica - Tihuatlán II",
ubicaci_n_de_caseta_en_km: "  "
},
{
autopista: "Gutiérrez Zamora - Tihuatlán",
caseta: "  Totomoxtle 1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "20.461964",
coordenada_longitud_en_grados: "-97.245995",
iave: "NO",
longitud_en_km: "37.289",
operador: "CAPUFE",
tramo_de_cobro: "  Gutiérrez Zamora - Tihuatlán",
ubicaci_n_de_caseta_en_km: " 0+200"
},
{
autopista: "Gutiérrez Zamora - Tihuatlán",
caseta: "  Totomoxtle 2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "20.460995",
coordenada_longitud_en_grados: "-97.247746",
iave: "NO",
longitud_en_km: "37.289",
operador: "CAPUFE",
tramo_de_cobro: "  Tihuatlán - Gutiérrez Zamora",
ubicaci_n_de_caseta_en_km: " 0+200"
},
{
autopista: "Jiménez - Camargo",
caseta: "  Jiménez",
concesionario: "GOBIERNO DEL ESTADO DE CHIHUAHUA",
coordenada_latitud_en_grados: "27.244991",
coordenada_longitud_en_grados: "-104.933224",
iave: "NO",
longitud_en_km: "70.000",
operador: "GOBIERNO DEL ESTADO DE CHIHUAHUA",
tramo_de_cobro: "  Jiménez - Camargo",
ubicaci_n_de_caseta_en_km: "  11+000"
},
{
autopista: "La Pera - Cuautla",
caseta: "  Oacalco",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.931121",
coordenada_longitud_en_grados: "-99.02562",
iave: "SI",
longitud_en_km: "17.082",
operador: "CAPUFE",
tramo_de_cobro: "  Tepoztlán - Cuautla",
ubicaci_n_de_caseta_en_km: "  21+200"
},
{
autopista: "La Pera - Cuautla",
caseta: "  Tepoztlán",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.98681",
coordenada_longitud_en_grados: "-99.112444",
iave: "SI",
longitud_en_km: "17.083",
operador: "CAPUFE",
tramo_de_cobro: "  La Pera - Tepoztlán",
ubicaci_n_de_caseta_en_km: "  7+960"
},
{
autopista: "La Tinaja - Cosoleacaque",
caseta: "  Acayucan",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "17.910035",
coordenada_longitud_en_grados: "-94.937359",
iave: "SI",
longitud_en_km: "69.850",
operador: "CAPUFE",
tramo_de_cobro: "  Isla - Acayucan",
ubicaci_n_de_caseta_en_km: "  188+000"
},
{
autopista: "La Tinaja - Cosoleacaque",
caseta: "  Acayucan",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "17.910035",
coordenada_longitud_en_grados: "-94.937359",
iave: "SI",
longitud_en_km: "109.500",
operador: "CAPUFE",
tramo_de_cobro: "  Isla - Cosoleacaque",
ubicaci_n_de_caseta_en_km: "  188+000"
},
{
autopista: "La Tinaja - Cosoleacaque",
caseta: "  Acayucan",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "17.910035",
coordenada_longitud_en_grados: "-94.937359",
iave: "SI",
longitud_en_km: "40.000",
operador: "CAPUFE",
tramo_de_cobro: "  Acayucan - Cosoleacaque",
ubicaci_n_de_caseta_en_km: "  188+000"
},
{
autopista: "La Tinaja - Cosoleacaque",
caseta: "  Cosamaloapan",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.334975",
coordenada_longitud_en_grados: "-95.822252",
iave: "SI",
longitud_en_km: "83.360",
operador: "CAPUFE",
tramo_de_cobro: "  La Tinaja - Cosamaloapan",
ubicaci_n_de_caseta_en_km: "  83+360"
},
{
autopista: "La Tinaja - Cosoleacaque",
caseta: "  Cosamaloapan",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.334975",
coordenada_longitud_en_grados: "-95.822252",
iave: "SI",
longitud_en_km: "118.150",
operador: "CAPUFE",
tramo_de_cobro: "  La Tinaja - Isla",
ubicaci_n_de_caseta_en_km: "  83+360"
},
{
autopista: "La Tinaja - Cosoleacaque",
caseta: "  Cosamaloapan",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.334975",
coordenada_longitud_en_grados: "-95.822252",
iave: "SI",
longitud_en_km: "34.790",
operador: "CAPUFE",
tramo_de_cobro: "  Cosamaloapan - Isla",
ubicaci_n_de_caseta_en_km: "  83+360"
},
{
autopista: "Las Choapas - Ocozocuautla",
caseta: "  Las Choapas",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "17.944819",
coordenada_longitud_en_grados: "-94.172372",
iave: "NO",
longitud_en_km: "63.200",
operador: "CAPUFE",
tramo_de_cobro: "  Ent. Las Choapas - Ent. Nuevo Sacrificio",
ubicaci_n_de_caseta_en_km: "  17+000"
},
{
autopista: "Las Choapas - Ocozocuautla",
caseta: "  Las Choapas A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "17.942707",
coordenada_longitud_en_grados: "-94.17224",
iave: "NO",
longitud_en_km: "17.000",
operador: "CAPUFE",
tramo_de_cobro: "  Ent. Las Choapas - Ent. Las Choapas II",
ubicaci_n_de_caseta_en_km: "  17+000"
},
{
autopista: "Las Choapas - Ocozocuautla",
caseta: "  Las Choapas A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "17.942707",
coordenada_longitud_en_grados: "-94.17224",
iave: "NO",
longitud_en_km: "46.200",
operador: "CAPUFE",
tramo_de_cobro: "  Ent. Las Choapas II - Ent. Nuevo Sacrificio",
ubicaci_n_de_caseta_en_km: "  17+000"
},
{
autopista: "Las Choapas - Ocozocuautla",
caseta: "  Malpasito",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "17.349101",
coordenada_longitud_en_grados: "-93.586441",
iave: "SI",
longitud_en_km: "70.800",
operador: "CAPUFE",
tramo_de_cobro: "  Ent. Nuevo Sacrificio - Ent. Raudales",
ubicaci_n_de_caseta_en_km: "  118+930"
},
{
autopista: "Las Choapas - Ocozocuautla",
caseta: "  Malpasito A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "17.348467",
coordenada_longitud_en_grados: "-93.586933",
iave: "NO",
longitud_en_km: "49.600",
operador: "CAPUFE",
tramo_de_cobro: "  Ent. Nuevo Sacrificio - Ent. Malpasito",
ubicaci_n_de_caseta_en_km: "  118+930"
},
{
autopista: "Las Choapas - Ocozocuautla",
caseta: "  Malpasito A2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "17.349152",
coordenada_longitud_en_grados: "-93.585518",
iave: "NO",
longitud_en_km: "21.200",
operador: "CAPUFE",
tramo_de_cobro: "  Ent. Malpasito - Ent. Raudales",
ubicaci_n_de_caseta_en_km: "  118+930"
},
{
autopista: "Las Choapas - Ocozocuautla",
caseta: "  Ocuilapa",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "16.863172",
coordenada_longitud_en_grados: "-93.40687",
iave: "SI",
longitud_en_km: "64.000",
operador: "CAPUFE",
tramo_de_cobro: "  Ent. Raudales - Ocozocuautla",
ubicaci_n_de_caseta_en_km: "  183+500"
},
{
autopista: "León - Aguascalientes",
caseta: "  Cuerámaro A1",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "21.06969",
coordenada_longitud_en_grados: "-101.679198",
iave: "NO",
longitud_en_km: "12.000",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Ent. León - Ent. Central de Abastos",
ubicaci_n_de_caseta_en_km: "  12+000"
},
{
autopista: "León - Aguascalientes",
caseta: "  Cuerámaro A2",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "21.069085",
coordenada_longitud_en_grados: "-101.67977",
iave: "NO",
longitud_en_km: "12.000",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Ent. Central de Abastos - Ent. León",
ubicaci_n_de_caseta_en_km: "  12+000"
},
{
autopista: "León - Aguascalientes",
caseta: "  Encarnación",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "21.489618",
coordenada_longitud_en_grados: "-102.243204",
iave: "SI",
longitud_en_km: "43.800",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Ent. Lagos de Moreno - Aguascalientes",
ubicaci_n_de_caseta_en_km: "  88+740"
},
{
autopista: "León - Aguascalientes",
caseta: "  Encarnación",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "21.489618",
coordenada_longitud_en_grados: "-102.243204",
iave: "SI",
longitud_en_km: "15.110",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Encarnación de Díaz - Aguascalientes",
ubicaci_n_de_caseta_en_km: "  88+740"
},
{
autopista: "León - Aguascalientes",
caseta: "  León",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "21.102736",
coordenada_longitud_en_grados: "-101.784601",
iave: "SI",
longitud_en_km: "60.050",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Ent. León - Lagos de Moreno",
ubicaci_n_de_caseta_en_km: "  23+500"
},
{
autopista: "León - Aguascalientes",
caseta: "  San Francisco A1",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "21.082341",
coordenada_longitud_en_grados: "-101.745577",
iave: "NO",
longitud_en_km: "19.000",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Ent. León - San Francisco del Rincón",
ubicaci_n_de_caseta_en_km: "  19+000"
},
{
autopista: "León - Aguascalientes",
caseta: "  San Francisco A2",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "21.081411",
coordenada_longitud_en_grados: "-101.745975",
iave: "NO",
longitud_en_km: "19.000",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  San Francisco del Rincón - Ent. León",
ubicaci_n_de_caseta_en_km: "  19+000"
},
{
autopista: "Libramiento de Culiacán",
caseta: "  San Pedro",
coordenada_latitud_en_grados: "24.748965",
coordenada_longitud_en_grados: "-107.568618",
iave: "NO",
longitud_en_km: "22.000",
tramo_de_cobro: "  Libramiento de Culiacán",
ubicaci_n_de_caseta_en_km: "  10+000"
},
{
autopista: "Libramiento de Fresnillo",
caseta: "  Morfín Chávez",
concesionario: "GOBIERNO DEL ESTADO DE ZACATECAS GRUPO PROFREZAC S.A. DE C.V.",
coordenada_latitud_en_grados: "23.177959",
coordenada_longitud_en_grados: "-102.828733",
iave: "NO",
longitud_en_km: "20.050",
operador: "GOBIERNO DEL ESTADO DE ZACATECAS GRUPO PROFREZAC S.A. DE C.V.",
tramo_de_cobro: "  Libramiento de Fresnillo",
ubicaci_n_de_caseta_en_km: "  57+060"
},
{
autopista: "Libramiento de Fresnillo",
caseta: "  Morfín Chávez",
concesionario: "GOBIERNO DEL ESTADO DE ZACATECAS GRUPO PROFREZAC S.A. DE C.V.",
coordenada_latitud_en_grados: "23.177959",
coordenada_longitud_en_grados: "-102.828733",
iave: "NO",
longitud_en_km: "7.020",
operador: "GOBIERNO DEL ESTADO DE ZACATECAS GRUPO PROFREZAC S.A. DE C.V.",
tramo_de_cobro: "  Ent. La Providencia - Morfín Chávez",
ubicaci_n_de_caseta_en_km: "  57+060"
},
{
autopista: "Libramiento de Fresnillo",
caseta: "  Morfín Chávez",
concesionario: "GOBIERNO DEL ESTADO DE ZACATECAS GRUPO PROFREZAC S.A. DE C.V.",
coordenada_latitud_en_grados: "23.177959",
coordenada_longitud_en_grados: "-102.828733",
iave: "NO",
longitud_en_km: "13.030",
operador: "GOBIERNO DEL ESTADO DE ZACATECAS GRUPO PROFREZAC S.A. DE C.V.",
tramo_de_cobro: "  Morfín Chávez - Ent. San Isidro",
ubicaci_n_de_caseta_en_km: "  57+060"
},
{
autopista: "Libramiento de Irapuato",
caseta: "  Arandas",
concesionario: "INFRAESTRUCTURA CONCESIONADA DE IRAPUATO S. A. DE C. V.",
coordenada_latitud_en_grados: "20.737502",
coordenada_longitud_en_grados: "-101.379985",
iave: "NO",
longitud_en_km: "19.570",
operador: "INFRAESTRUCTURA CONCESIONARIA DE IRAPAUATO",
tramo_de_cobro: "  Entronque ITESI - San Cristobal",
ubicaci_n_de_caseta_en_km: "  5+810"
},
{
autopista: "Querétaro - Irapuato",
caseta: "  Querétaro",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "20.57217",
coordenada_longitud_en_grados: "-100.472837",
iave: "SI",
longitud_en_km: "44.500",
operador: "CAPUFE",
tramo_de_cobro: "  Querétaro - Celaya",
ubicaci_n_de_caseta_en_km: "  1+000"
},
{
autopista: "Libramiento de Irapuato",
caseta: "  Arandas A1",
concesionario: "INFRAESTRUCTURA CONCESIONADA DE IRAPUATO S. A. DE C. V.",
coordenada_latitud_en_grados: "20.735284",
coordenada_longitud_en_grados: "-101.383209",
iave: "NO",
longitud_en_km: "5.810",
operador: "INFRAESTRUCTURA CONCESIONARIA DE IRAPAUATO",
tramo_de_cobro: "  Entronque ITESI - Arandas",
ubicaci_n_de_caseta_en_km: "  5+810"
},
{
autopista: "México - Puebla",
caseta: "  San Marcos",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.296387",
coordenada_longitud_en_grados: "-98.870735",
iave: "SI",
longitud_en_km: "74.555",
operador: "CAPUFE",
tramo_de_cobro: "  México - San Martín Texmelucan",
ubicaci_n_de_caseta_en_km: "  33+300"
},
{
autopista: "Libramiento de Irapuato",
caseta: "  Arandas A2",
concesionario: "INFRAESTRUCTURA CONCESIONADA DE IRAPUATO S. A. DE C. V.",
coordenada_latitud_en_grados: "20.733461",
coordenada_longitud_en_grados: "-101.381244",
iave: "NO",
longitud_en_km: "13.760",
operador: "INFRAESTRUCTURA CONCESIONARIA DE IRAPAUATO",
tramo_de_cobro: "  Arandas - San Cristobal",
ubicaci_n_de_caseta_en_km: "  5+810"
},
{
autopista: "Libramiento de Irapuato",
caseta: "  San Cristobal",
concesionario: "INFRAESTRUCTURA CONCESIONADA DE IRAPUATO S. A. DE C. V.",
coordenada_latitud_en_grados: "20.601075",
coordenada_longitud_en_grados: "-101.438521",
iave: "NO",
longitud_en_km: "9.630",
operador: "INFRAESTRUCTURA CONCESIONARIA DE IRAPAUATO",
tramo_de_cobro: "  San Cristobal - Entronque Carretera 90",
ubicaci_n_de_caseta_en_km: "  20+000"
},
{
autopista: "Libramiento de la Piedad",
caseta: " La Calera",
concesionario: "LIBRAMIENTO ICA LA PIEDAD S.A. DE C.V.",
coordenada_latitud_en_grados: "20.397139",
coordenada_longitud_en_grados: "-101.998746",
iave: "NO",
longitud_en_km: "21.388",
operador: "LIBRAMIENTO ICA LA PIEDAD S.A. DE C.V.",
tramo_de_cobro: "  Laguna Larga - Patti II",
ubicaci_n_de_caseta_en_km: "  5+564"
},
{
autopista: "Libramiento de la Piedad",
caseta: "  La Calera Aux.",
concesionario: "LIBRAMIENTO ICA LA PIEDAD S.A. DE C.V.",
coordenada_latitud_en_grados: "20.395404",
coordenada_longitud_en_grados: "-101.998207",
iave: "NO",
longitud_en_km: "5.300",
operador: "LIBRAMIENTO ICA LA PIEDAD S.A. DE C.V.",
tramo_de_cobro: "  Laguna Larga - Calera",
ubicaci_n_de_caseta_en_km: "  5+564"
},
{
autopista: "Libramiento de la Piedad",
caseta: "  La Calera Aux.",
concesionario: "LIBRAMIENTO ICA LA PIEDAD S.A. DE C.V.",
coordenada_latitud_en_grados: "20.395404",
coordenada_longitud_en_grados: "-101.998207",
iave: "NO",
longitud_en_km: "16.080",
operador: "LIBRAMIENTO ICA LA PIEDAD S.A. DE C.V.",
tramo_de_cobro: "  Calera - Patti II",
ubicaci_n_de_caseta_en_km: "  5+564"
},
{
autopista: "Libramiento de Matehuala",
caseta: "  Matehuala",
concesionario: "DESARROLLADORA DE CONCESIONES OMEGA S. A. DE C. V.",
coordenada_latitud_en_grados: "23.664163",
coordenada_longitud_en_grados: "-100.607299",
iave: "NO",
longitud_en_km: "14.200",
operador: "DESARROLLADORA DE CONCESIONES OMEGA S. A. DE C. V.",
tramo_de_cobro: "  Libramiento de Matehuala",
ubicaci_n_de_caseta_en_km: "  8+000"
},
{
autopista: "Libramiento de Matehuala",
caseta: " Matehuala A1",
concesionario: "DESARROLLADORA DE CONCESIONES OMEGA S. A. DE C. V.",
coordenada_latitud_en_grados: "23.664161",
coordenada_longitud_en_grados: "-100.606222",
iave: "NO",
operador: "DESARROLLADORA DE CONCESIONES OMEGA S. A. DE C. V.",
tramo_de_cobro: " Ent. Sur Matehuala - Ent. Este Matehuala",
ubicaci_n_de_caseta_en_km: "  8+000"
},
{
autopista: "Libramiento de Matehuala",
caseta: " Matehuala A2",
concesionario: "DESARROLLADORA DE CONCESIONES OMEGA S. A. DE C. V.",
coordenada_latitud_en_grados: "23.663767",
coordenada_longitud_en_grados: "-100.608339",
iave: "NO",
operador: "DESARROLLADORA DE CONCESIONES OMEGA S. A. DE C. V.",
tramo_de_cobro: " Ent. Este Matehuala - Ent. Norte Matehuala",
ubicaci_n_de_caseta_en_km: "  8+000"
},
{
autopista: "Libramiento de Mexicali",
caseta: "  Mexcali A1",
concesionario: "LIBRAMIENTO OMEGA CACHANILLA S. A. DE C. V.",
coordenada_latitud_en_grados: "32.533552",
coordenada_longitud_en_grados: "-115.40878",
iave: "NO",
longitud_en_km: "12.000",
operador: "LIBRAMIENTO OMEGA CACHANILLA S. A. DE C. V.",
tramo_de_cobro: "  Entronque Cuernavaca - Entronque San Felipe",
ubicaci_n_de_caseta_en_km: "  12+000"
},
{
autopista: "Libramiento de Mexicali",
caseta: "  Mexicali",
concesionario: "LIBRAMIENTO OMEGA CACHANILLA S. A. DE C. V.",
coordenada_latitud_en_grados: "32.533499",
coordenada_longitud_en_grados: "-115.420765",
iave: "NO",
longitud_en_km: "41.000",
operador: "LIBRAMIENTO OMEGA CACHANILLA S. A. DE C. V.",
tramo_de_cobro: "  Libramiento de Mexicali",
ubicaci_n_de_caseta_en_km: "  12+000"
},
{
autopista: "Libramiento de Mexicali",
caseta: "  Mexicali A2",
concesionario: "LIBRAMIENTO OMEGA CACHANILLA S. A. DE C. V.",
iave: "NO",
longitud_en_km: "29.000",
operador: "LIBRAMIENTO OMEGA CACHANILLA S. A. DE C. V.",
tramo_de_cobro: "  Entronque San Felipe - Entronque Centinela",
ubicaci_n_de_caseta_en_km: "  12+000"
},
{
autopista: "Libramiento de Nogales",
caseta: "  Nogales",
concesionario: "GOBIERNO DEL ESTADO DE SONORA",
coordenada_latitud_en_grados: "31.258312",
coordenada_longitud_en_grados: "-110.974723",
iave: "NO",
longitud_en_km: "12.500",
operador: "VÍAS CONCESIONADAS DEL NORTE S.A. DE C.V.",
tramo_de_cobro: "  Libramiento de Nogales",
ubicaci_n_de_caseta_en_km: "  3+300"
},
{
autopista: "Libramiento de Tecpan",
caseta: "  Tecpan",
concesionario: "LIBRAMIENTO OMEGA TECPAN S. A. DE C. V.",
coordenada_latitud_en_grados: "17.197011",
coordenada_longitud_en_grados: "-100.626768",
iave: "SI",
longitud_en_km: "4.369",
operador: "LIBRAMIENTO OMEGA TECPAN S. A. DE C. V.",
tramo_de_cobro: "  Libramiento de Tecpan",
ubicaci_n_de_caseta_en_km: "  0+100"
},
{
autopista: "Libramiento de Víctor Rosales",
caseta: "  Calera",
concesionario: "GOBIERNO DEL ESTADO DE ZACATECAS GRUPO PROFREZAC S.A. DE C.V.",
coordenada_latitud_en_grados: "22.941811",
coordenada_longitud_en_grados: "-102.689928",
iave: "NO",
longitud_en_km: "5.900",
operador: "GOBIERNO DEL ESTADO DE ZACATECAS GRUPO PROFREZAC S.A. DE C.V.",
tramo_de_cobro: "  Libramiento de Víctor Rosales",
ubicaci_n_de_caseta_en_km: "  26+850"
},
{
autopista: "Libramiento Noreste de Querétaro",
caseta: "  Chichimequillas",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "20.705555",
coordenada_longitud_en_grados: "-100.343716",
iave: "SI",
longitud_en_km: "37.000",
operador: "CAPUFE",
tramo_de_cobro: "  Libramiento Noreste de Querétaro",
ubicaci_n_de_caseta_en_km: "  20+000"
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: " Atlacomulco II",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.911815",
coordenada_longitud_en_grados: "-99.85251",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: " Acambay",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.923377",
coordenada_longitud_en_grados: "-99.844213",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Jilotepec",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.976547",
coordenada_longitud_en_grados: "-99.53149",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Querétaro 1",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.998688",
coordenada_longitud_en_grados: "-99.487671",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Querétaro 2",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.996155",
coordenada_longitud_en_grados: "-99.489945",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Querétaro 3",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.997821",
coordenada_longitud_en_grados: "-99.492",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Querétaro 4",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.000504",
coordenada_longitud_en_grados: "-99.489956",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Tula II-1",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.071871",
coordenada_longitud_en_grados: "-99.367698",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Tula II-2",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.070355",
coordenada_longitud_en_grados: "-99.368243",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Tula II-3",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.072661",
coordenada_longitud_en_grados: "-99.369804",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Tula II-4",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.071311",
coordenada_longitud_en_grados: "-99.367319",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Tula I-1",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.099725",
coordenada_longitud_en_grados: "-99.280562",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Tula I-2",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.098169",
coordenada_longitud_en_grados: "-99.283149",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Tula I-3",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.09821",
coordenada_longitud_en_grados: "-99.286059",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Tula I-4",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.100076",
coordenada_longitud_en_grados: "-99.28351",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Atitalaquia 1",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.067268",
coordenada_longitud_en_grados: "-99.218551",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Atitalaquia 2",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.064868",
coordenada_longitud_en_grados: "-99.219068",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Ajoloapan 1",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.956086",
coordenada_longitud_en_grados: "-99.053339",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Ajoloapan 2",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.955443",
coordenada_longitud_en_grados: "-99.052776",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Ajoloapan 3",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.955845",
coordenada_longitud_en_grados: "-99.055422",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Ajoloapan 4",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.95638",
coordenada_longitud_en_grados: "-99.05548",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Pachuca",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.927508",
coordenada_longitud_en_grados: "-98.891452",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Tulancingo 1",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.834861",
coordenada_longitud_en_grados: "-98.700138",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Tulancingo 2",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.83368",
coordenada_longitud_en_grados: "-98.698801",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Tulancingo 3",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.832456",
coordenada_longitud_en_grados: "-98.700121",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Tulancingo 4",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.83364",
coordenada_longitud_en_grados: "-98.701536",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Cd. Sahagún 1",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.756661",
coordenada_longitud_en_grados: "-98.628326",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Cd. Sahagún 2",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.75596",
coordenada_longitud_en_grados: "-98.628121",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Cd. Sahagún 3",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.755427",
coordenada_longitud_en_grados: "-98.629498",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Cd. Sahagún 4",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.756069",
coordenada_longitud_en_grados: "-98.630532",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Calpulalpan 1",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.62148",
coordenada_longitud_en_grados: "-98.548095",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Calpulalpan 2",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.62015",
coordenada_longitud_en_grados: "-98.547003",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Calpulalpan 3",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.619189",
coordenada_longitud_en_grados: "-98.54942",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Calpulalpan 4",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.619447",
coordenada_longitud_en_grados: "-98.54967",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Sanctórum 1",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.515572",
coordenada_longitud_en_grados: "-98.469019",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Sanctórum 2",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.512699",
coordenada_longitud_en_grados: "-98.466906",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "México - Puebla",
caseta: "  San Martín",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.241121",
coordenada_longitud_en_grados: "-98.385855",
iave: "SI",
longitud_en_km: "36.155",
operador: "CAPUFE",
tramo_de_cobro: "  San Martín Texmelucan - Puebla",
ubicaci_n_de_caseta_en_km: "  91+000"
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Sanctórum 3",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.512702",
coordenada_longitud_en_grados: "-98.468831",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Sanctórum 4",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.513876",
coordenada_longitud_en_grados: "-98.46991",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: " Sanctórum 5",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.518652",
coordenada_longitud_en_grados: "-98.471763",
iave: "SI",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V."
},
{
autopista: "Libramiento Norte de la Ciudad de México",
caseta: "  Texmelucan",
concesionario: "CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.301795",
coordenada_longitud_en_grados: "-98.409616",
iave: "SI",
longitud_en_km: "136.650",
operador: "AUTOPISTA ARCO NORTE S. A. DE C. V.",
tramo_de_cobro: "  Ent. Acambay - Ent. Tulancingo"
},
{
autopista: "Libramiento Oriente de Saltillo",
caseta: " La Carbonera",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "25.510976",
coordenada_longitud_en_grados: "-100.868373",
iave: "SI",
longitud_en_km: "21.000",
operador: "CAPUFE",
tramo_de_cobro: "  Libramiento Oriente de Saltillo",
ubicaci_n_de_caseta_en_km: "  12+300"
},
{
autopista: "Libramiento Oriente de San Luis Potosí",
caseta: "  San Nicolás de los Jassos",
concesionario: "MEXICANA DE TÉCNICOS EN AUTOPISTAS S. A. DE C. V.",
coordenada_latitud_en_grados: "22.129759",
coordenada_longitud_en_grados: "-100.825106",
iave: "NO",
longitud_en_km: "33.760",
operador: "MEXICANA DE TÉCNICOS EN AUTOPISTAS S. A. DE C. V.",
tramo_de_cobro: "  Libramiento Oriente de San Luis Potosí",
ubicaci_n_de_caseta_en_km: "  11+200"
},
{
autopista: "Libramiento Oriente de San Luis Potosí",
caseta: "  San Nicolás de los Jassos",
concesionario: "MEXICANA DE TÉCNICOS EN AUTOPISTAS S. A. DE C. V.",
coordenada_latitud_en_grados: "22.129759",
coordenada_longitud_en_grados: "-100.825106",
iave: "NO",
operador: "MEXICANA DE TÉCNICOS EN AUTOPISTAS S. A. DE C. V.",
tramo_de_cobro: " Ent. La Pila - Ent. San Nicolás",
ubicaci_n_de_caseta_en_km: "  11+200"
},
{
autopista: "Libramiento Oriente de San Luis Potosí",
caseta: "  San Nicolás de los Jassos",
concesionario: "MEXICANA DE TÉCNICOS EN AUTOPISTAS S. A. DE C. V.",
coordenada_latitud_en_grados: "22.129759",
coordenada_longitud_en_grados: "-100.825106",
iave: "NO",
operador: "MEXICANA DE TÉCNICOS EN AUTOPISTAS S. A. DE C. V.",
tramo_de_cobro: " Ent. San Nicolás - T San Elías",
ubicaci_n_de_caseta_en_km: "  11+200"
},
{
autopista: "Libramiento Poniente de Tampico",
caseta: "  Loma Real",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "22.276443",
coordenada_longitud_en_grados: "-97.893343",
iave: "NO",
longitud_en_km: "8.378",
operador: "CAPUFE",
tramo_de_cobro: "  Boulevard Loma Real - Ent. Altamira",
ubicaci_n_de_caseta_en_km: "  6+020"
},
{
autopista: "Libramiento Poniente de Tampico",
caseta: "  Loma Real",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "22.276443",
coordenada_longitud_en_grados: "-97.893343",
iave: "NO",
longitud_en_km: "6.100",
operador: "CAPUFE",
tramo_de_cobro: "  Ent. Ciudad Valles - Boulevard Loma Real",
ubicaci_n_de_caseta_en_km: "  6+020"
},
{
autopista: "Libramiento Poniente de Tampico",
caseta: "  Tampico",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "22.275332",
coordenada_longitud_en_grados: "-97.893427",
iave: "NO",
longitud_en_km: "14.478",
operador: "CAPUFE",
tramo_de_cobro: "  Libramiento Poniente de Tampico",
ubicaci_n_de_caseta_en_km: "  5+970"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Ecuandureo",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "20.17505",
coordenada_longitud_en_grados: "-102.191319",
iave: "SI",
longitud_en_km: "55.823",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Churintzio - La Barca",
ubicaci_n_de_caseta_en_km: "  360+000"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Ecuandureo",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "20.17505",
coordenada_longitud_en_grados: "-102.191319",
iave: "SI",
longitud_en_km: "13.682",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Churintzio - Ecuandureo",
ubicaci_n_de_caseta_en_km: "  360+000"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Ecuandureo",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "20.17505",
coordenada_longitud_en_grados: "-102.191319",
iave: "SI",
longitud_en_km: "42.141",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Ecuandureo - La Barca",
ubicaci_n_de_caseta_en_km: "  360+000"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Huaniqueo A1",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "19.884267",
coordenada_longitud_en_grados: "-101.510489",
iave: "NO",
longitud_en_km: "39.573",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Morelia - Huaniqueo",
ubicaci_n_de_caseta_en_km: "  278+423"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Huaniqueo A2",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "19.882534",
coordenada_longitud_en_grados: "-101.511604",
iave: "NO",
longitud_en_km: "39.573",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Huaniqueo - Morelia",
ubicaci_n_de_caseta_en_km: "  278+423"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Jeráhuaro A1",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "19.894416",
coordenada_longitud_en_grados: "-100.646701",
iave: "NO",
longitud_en_km: "21.113",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Maravatío - Jeráhuaro",
ubicaci_n_de_caseta_en_km: "  186+113"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Jeráhuaro A2",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "19.893593",
coordenada_longitud_en_grados: "-100.651203",
iave: "NO",
longitud_en_km: "21.113",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Jeráhuaro - Maravatío",
ubicaci_n_de_caseta_en_km: "  186+113"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Ocotlán",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "20.40586",
coordenada_longitud_en_grados: "-102.73889",
iave: "SI",
longitud_en_km: "72.556",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  La Barca - Zapotlanejo",
ubicaci_n_de_caseta_en_km: "  425+955"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Ocotlán A1",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "20.406969",
coordenada_longitud_en_grados: "-102.738906",
iave: "NO",
longitud_en_km: "23.811",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  La Barca - Ocotlán",
ubicaci_n_de_caseta_en_km: "  425+955"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Ocotlán A2",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "20.404903",
coordenada_longitud_en_grados: "-102.739378",
iave: "NO",
longitud_en_km: "48.095",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Ocotlán - Zapotlanejo",
ubicaci_n_de_caseta_en_km: "  425+955"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Panindícuaro",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "19.972189",
coordenada_longitud_en_grados: "-101.756945",
iave: "SI",
longitud_en_km: "105.894",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Morelia - Churintzio",
ubicaci_n_de_caseta_en_km: "  308+000"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Panindícuaro",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "19.972189",
coordenada_longitud_en_grados: "-101.756945",
iave: "SI",
longitud_en_km: "66.663",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Morelia - Panindícuaro",
ubicaci_n_de_caseta_en_km: "  308+000"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Panindícuaro",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "19.972189",
coordenada_longitud_en_grados: "-101.756945",
iave: "SI",
longitud_en_km: "39.231",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Panindícuaro - Churintzio",
ubicaci_n_de_caseta_en_km: "  308+000"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Panindícuaro",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "19.972189",
coordenada_longitud_en_grados: "-101.756945",
iave: "SI",
longitud_en_km: "27.090",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Huaniqueo - Panindícuaro",
ubicaci_n_de_caseta_en_km: "  308+000"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Vista Hermosa A1",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "20.269788",
coordenada_longitud_en_grados: "-102.43991",
iave: "NO",
longitud_en_km: "12.144",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Vista Hermosa - La Barca",
ubicaci_n_de_caseta_en_km: "  390+000"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Vista Hermosa A2",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "20.269344",
coordenada_longitud_en_grados: "-102.441826",
iave: "NO",
longitud_en_km: "12.144",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  La Barca - Vista Hermosa",
ubicaci_n_de_caseta_en_km: "  390+000"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Zinapécuaro",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "19.901776",
coordenada_longitud_en_grados: "-100.788521",
iave: "SI",
longitud_en_km: "75.427",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Maravatío - Morelia",
ubicaci_n_de_caseta_en_km: "  202+017"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Zinapécuaro",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "19.901776",
coordenada_longitud_en_grados: "-100.788521",
iave: "SI",
longitud_en_km: "38.211",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Zinapécuaro - Morelia",
ubicaci_n_de_caseta_en_km: "  202+017"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Zinapécuaro A1",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "19.902373",
coordenada_longitud_en_grados: "-100.787561",
iave: "NO",
longitud_en_km: "16.103",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Jeráhuaro - Zinapécuaro",
ubicaci_n_de_caseta_en_km: "  202+256"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Zinapécuaro A1",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "19.902373",
coordenada_longitud_en_grados: "-100.787561",
iave: "NO",
longitud_en_km: "37.216",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Maravatío - Zinapécuaro",
ubicaci_n_de_caseta_en_km: "  202+256"
},
{
autopista: "Maravatío - Zapotlanejo",
caseta: "  Zinapécuaro A2",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "19.900892",
coordenada_longitud_en_grados: "-100.789019",
iave: "NO",
longitud_en_km: "38.211",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Zinapécuaro - Maravatío",
ubicaci_n_de_caseta_en_km: "  202+256"
},
{
autopista: "Mazatlán - Culiacán",
caseta: "  Costa Rica",
concesionario: "AUTOPISTAS Y LIBRAMIENTOS DEL PACÍFICO NORTE S. A. DE C. V.",
coordenada_latitud_en_grados: "24.570288",
coordenada_longitud_en_grados: "-107.430223",
iave: "SI",
longitud_en_km: "91.959",
operador: "AUTOPISTAS Y LIBRAMIENTOS DEL PACÍFICO NORTE S. A. DE C. V.",
tramo_de_cobro: "  Ent. La Cruz - Costa Rica",
ubicaci_n_de_caseta_en_km: "  178+800"
},
{
autopista: "Mazatlán - Culiacán",
caseta: "  Mármol",
concesionario: "AUTOPISTAS Y LIBRAMIENTOS DEL PACÍFICO NORTE S. A. DE C. V.",
coordenada_latitud_en_grados: "23.471208",
coordenada_longitud_en_grados: "-106.569542",
iave: "SI",
longitud_en_km: "89.541",
operador: "AUTOPISTAS Y LIBRAMIENTOS DEL PACÍFICO NORTE S. A. DE C. V.",
tramo_de_cobro: "  El Venadillo - Ent. La Cruz",
ubicaci_n_de_caseta_en_km: "  25+150"
},
{
autopista: "Mazatlán - Culiacán",
caseta: "  Quilá A1",
concesionario: "AUTOPISTAS Y LIBRAMIENTOS DEL PACÍFICO NORTE S. A. DE C. V.",
coordenada_latitud_en_grados: "24.397637",
coordenada_longitud_en_grados: "-107.269976",
iave: "NO",
longitud_en_km: "64.259",
operador: "AUTOPISTAS Y LIBRAMIENTOS DEL PACÍFICO NORTE S. A. DE C. V.",
tramo_de_cobro: "  Ent. La Cruz - Quilá",
ubicaci_n_de_caseta_en_km: "  153+800"
},
{
autopista: "Mazatlán - Culiacán",
caseta: "  Quilá A2",
concesionario: "AUTOPISTAS Y LIBRAMIENTOS DEL PACÍFICO NORTE S. A. DE C. V.",
coordenada_latitud_en_grados: "24.396624",
coordenada_longitud_en_grados: "-107.271899",
iave: "NO",
longitud_en_km: "27.700",
operador: "AUTOPISTAS Y LIBRAMIENTOS DEL PACÍFICO NORTE S. A. DE C. V.",
tramo_de_cobro: "  Quilá - Costa Rica",
ubicaci_n_de_caseta_en_km: "  153+800"
},
{
autopista: "Mérida - Cancún",
caseta: "  Pisté",
concesionario: "CONSORCIO DEL MAYAB S. A. DE C. V.",
coordenada_latitud_en_grados: "20.728862",
coordenada_longitud_en_grados: "-88.583181",
iave: "NO",
longitud_en_km: "50.000",
operador: "CONSORCIO DEL MAYAB (ICA)",
tramo_de_cobro: "  Kantunil - Pisté",
ubicaci_n_de_caseta_en_km: "  115+200"
},
{
autopista: "Mérida - Cancún",
caseta: "  Pisté",
concesionario: "CONSORCIO DEL MAYAB S. A. DE C. V.",
coordenada_latitud_en_grados: "20.728862",
coordenada_longitud_en_grados: "-88.583181",
iave: "NO",
longitud_en_km: "90.000",
operador: "CONSORCIO DEL MAYAB (ICA)",
tramo_de_cobro: "  Kantunil - Valladolid",
ubicaci_n_de_caseta_en_km: "  115+200"
},
{
autopista: "Mérida - Cancún",
caseta: "  Pisté",
concesionario: "CONSORCIO DEL MAYAB S. A. DE C. V.",
coordenada_latitud_en_grados: "20.728862",
coordenada_longitud_en_grados: "-88.583181",
iave: "NO",
longitud_en_km: "40.000",
operador: "CONSORCIO DEL MAYAB (ICA)",
tramo_de_cobro: "  Pisté - Valladolid",
ubicaci_n_de_caseta_en_km: "  115+200"
},
{
autopista: "Mérida - Cancún",
caseta: "  Xcan",
concesionario: "CONSORCIO DEL MAYAB S. A. DE C. V.",
coordenada_latitud_en_grados: "20.876892",
coordenada_longitud_en_grados: "-87.63614",
iave: "NO",
longitud_en_km: "151.340",
operador: "CONSORCIO DEL MAYAB (ICA)",
tramo_de_cobro: "  Valladolid - Cancún",
ubicaci_n_de_caseta_en_km: "  216+500"
},
{
autopista: "México - Cuernavaca",
caseta: "  Tlalpan",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.241915",
coordenada_longitud_en_grados: "-99.148321",
iave: "SI",
longitud_en_km: "61.540",
operador: "CAPUFE",
tramo_de_cobro: "  México - Cuernavaca",
ubicaci_n_de_caseta_en_km: "  23+360"
},
{
autopista: "México - Cuernavaca",
caseta: "  Tres Marías A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.050851",
coordenada_longitud_en_grados: "-99.241365",
iave: "NO",
longitud_en_km: "27.500",
operador: "CAPUFE",
tramo_de_cobro: "  Tres Marías - Cuernavaca",
ubicaci_n_de_caseta_en_km: "  55+300"
},
{
autopista: "México - Cuernavaca",
caseta: "  Tres Marías A2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.056209",
coordenada_longitud_en_grados: "-99.241097",
iave: "NO",
longitud_en_km: "27.500",
operador: "CAPUFE",
tramo_de_cobro: "  Cuernavaca - Tres Marías",
ubicaci_n_de_caseta_en_km: "  55+300"
},
{
autopista: "México - La Marquesa",
caseta: "  Contadero 1",
concesionario: "PROMOTORA ADMINISTRADORA DE CARRETERAS S. A. DE C. V.",
coordenada_latitud_en_grados: "19.333688",
coordenada_longitud_en_grados: "-99.313794",
iave: "NO",
longitud_en_km: "11.070",
operador: "OPERVITE S. A. DE C. V.",
tramo_de_cobro: "  México - Contadero",
ubicaci_n_de_caseta_en_km: "  23+430"
},
{
autopista: "México - La Marquesa",
caseta: "  Contadero 2",
concesionario: "PROMOTORA ADMINISTRADORA DE CARRETERAS S. A. DE C. V.",
coordenada_latitud_en_grados: "19.331793",
coordenada_longitud_en_grados: "-99.31516",
iave: "NO",
longitud_en_km: "10.930",
operador: "OPERVITE S. A. DE C. V.",
tramo_de_cobro: "  Contadero - La Marquesa",
ubicaci_n_de_caseta_en_km: "  23+430"
},
{
autopista: "México - La Marquesa",
caseta: "  La Venta",
concesionario: "PROMOTORA ADMINISTRADORA DE CARRETERAS S. A. DE C. V.",
coordenada_latitud_en_grados: "19.332852",
coordenada_longitud_en_grados: "-99.314303",
iave: "NO",
longitud_en_km: "22.000",
operador: "OPERVITE S. A. DE C. V.",
tramo_de_cobro: "  México - La Marquesa",
ubicaci_n_de_caseta_en_km: "  24+000"
},
{
autopista: "México - La Marquesa",
caseta: "  La Venta",
concesionario: "PROMOTORA ADMINISTRADORA DE CARRETERAS S. A. DE C. V.",
coordenada_latitud_en_grados: "19.332852",
coordenada_longitud_en_grados: "-99.314303",
iave: "NO",
longitud_en_km: "10.500",
operador: "OPERVITE S. A. DE C. V.",
tramo_de_cobro: "  La Venta - La Marquesa",
ubicaci_n_de_caseta_en_km: "  24+000"
},
{
autopista: "México - La Marquesa",
caseta: "  La Venta",
concesionario: "PROMOTORA ADMINISTRADORA DE CARRETERAS S. A. DE C. V.",
coordenada_latitud_en_grados: "19.332852",
coordenada_longitud_en_grados: "-99.314303",
iave: "NO",
longitud_en_km: "11.500",
operador: "OPERVITE S. A. DE C. V.",
tramo_de_cobro: "  México - La Venta",
ubicaci_n_de_caseta_en_km: "  24+000"
},
{
autopista: "México - La Marquesa",
caseta: "  Santa Fe",
concesionario: "PROMOTORA ADMINISTRADORA DE CARRETERAS S. A. DE C. V.",
coordenada_latitud_en_grados: "19.363385",
coordenada_longitud_en_grados: "-99.26732",
iave: "NO",
longitud_en_km: "5.130",
operador: "OPERVITE S. A. DE C. V.",
tramo_de_cobro: "  México - Santa Fe",
ubicaci_n_de_caseta_en_km: "  17+626"
},
{
autopista: "México - Pachuca",
caseta: "  Ojo de Agua",
concesionario: "FIDEICOMISO AUTOPISTAS Y PUENTES DEL GOLFO CENTRO",
coordenada_latitud_en_grados: "19.618814",
coordenada_longitud_en_grados: "-99.029522",
iave: "NO",
longitud_en_km: "45.800",
operador: "CAPUFE",
tramo_de_cobro: "  Indios Verdes - Tizayuca",
ubicaci_n_de_caseta_en_km: "  24+700"
},
{
autopista: "México - Pachuca",
caseta: "  San Cristóbal",
concesionario: "FIDEICOMISO AUTOPISTAS Y PUENTES DEL GOLFO CENTRO",
coordenada_latitud_en_grados: "19.602763",
coordenada_longitud_en_grados: "-99.038148",
iave: "NO",
longitud_en_km: "8.800",
operador: "CAPUFE",
tramo_de_cobro: "  Indios Verdes - San Cristóbal Ecatepec",
ubicaci_n_de_caseta_en_km: "  21+050"
},
{
autopista: "México - Puebla",
caseta: "  Chalco",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.292034",
coordenada_longitud_en_grados: "-98.88175",
iave: "SI",
longitud_en_km: "15.055",
operador: "CAPUFE",
tramo_de_cobro: "  México - Chalco",
ubicaci_n_de_caseta_en_km: "  32+000"
},
{
autopista: "México - Querétaro",
caseta: "  Jorobas A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.826191",
coordenada_longitud_en_grados: "-99.250048",
iave: "SI",
longitud_en_km: "34.149",
operador: "CAPUFE",
tramo_de_cobro: "  Jorobas - Tepeji del Río",
ubicaci_n_de_caseta_en_km: "  56+280"
},
{
autopista: "México - Querétaro",
caseta: "  Jorobas A2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.825708",
coordenada_longitud_en_grados: "-99.250155",
iave: "SI",
longitud_en_km: "34.149",
operador: "CAPUFE",
tramo_de_cobro: "  Tepeji del Río - Jorobas",
ubicaci_n_de_caseta_en_km: "  56+280"
},
{
autopista: "México - Querétaro",
caseta: "  Palmillas",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "20.296108",
coordenada_longitud_en_grados: "-99.929058",
iave: "SI",
longitud_en_km: "57.571",
operador: "CAPUFE",
tramo_de_cobro: "  Tepeji del Río - Palmillas",
ubicaci_n_de_caseta_en_km: "  147+917"
},
{
autopista: "México - Querétaro",
caseta: "  Polotitlán A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "20.22643",
coordenada_longitud_en_grados: "-99.810686",
iave: "SI",
longitud_en_km: "42.621",
operador: "CAPUFE",
tramo_de_cobro: "  Tepeji del Río - Polotitlán",
ubicaci_n_de_caseta_en_km: "  133+050"
},
{
autopista: "México - Querétaro",
caseta: "  Polotitlán A2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "20.225308",
coordenada_longitud_en_grados: "-99.810547",
iave: "SI",
longitud_en_km: "42.621",
operador: "CAPUFE",
tramo_de_cobro: "  Polotitlán - Tepeji del Río",
ubicaci_n_de_caseta_en_km: "  133+050"
},
{
autopista: "México - Querétaro",
caseta: "  Tepotzotlán",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.715364",
coordenada_longitud_en_grados: "-99.207569",
iave: "SI",
longitud_en_km: "57.571",
operador: "CAPUFE",
tramo_de_cobro: "  México - Tepeji del Río",
ubicaci_n_de_caseta_en_km: "  43+010"
},
{
autopista: "Monterrey - Nuevo Laredo",
caseta: "  Agualeguas A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "26.340266",
coordenada_longitud_en_grados: "-100.070469",
iave: "NO",
longitud_en_km: "56.900",
operador: "CAPUFE",
tramo_de_cobro: "  Monterrey - Agualeguas",
ubicaci_n_de_caseta_en_km: "  79+600"
},
{
autopista: "Monterrey - Nuevo Laredo",
caseta: " Agualeguas A2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "26.341505",
coordenada_longitud_en_grados: "-100.071739",
iave: "NO",
operador: "CAPUFE",
tramo_de_cobro: " Agualeguas - Monterrey",
ubicaci_n_de_caseta_en_km: "  79+600"
},
{
autopista: "Monterrey - Nuevo Laredo",
caseta: "  Parás",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "26.508381",
coordenada_longitud_en_grados: "-100.008192",
iave: "NO",
longitud_en_km: "77.300",
operador: "CAPUFE",
tramo_de_cobro: "  Monterrey - Sabinas",
ubicaci_n_de_caseta_en_km: "  99+300"
},
{
autopista: "Monterrey - Nuevo Laredo",
caseta: "  Sabinas",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "26.512104",
coordenada_longitud_en_grados: "-100.007159",
iave: "SI",
longitud_en_km: "123.100",
operador: "CAPUFE",
tramo_de_cobro: "  Monterrey - Nuevo Laredo",
ubicaci_n_de_caseta_en_km: "  100+000"
},
{
autopista: "Monterrey - Nuevo Laredo",
caseta: "  Sabinas Aux.",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "26.508381",
coordenada_longitud_en_grados: "-100.008192",
iave: "NO",
longitud_en_km: "45.800",
operador: "CAPUFE",
tramo_de_cobro: "  Sabinas - La Gloria",
ubicaci_n_de_caseta_en_km: "  99+800"
},
{
autopista: "Monterrey - Nuevo Laredo",
caseta: "  Vallecillos",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "26.642361",
coordenada_longitud_en_grados: "-99.942202",
iave: "NO",
longitud_en_km: "30.250",
operador: "CAPUFE",
tramo_de_cobro: "  Vallecillos - La Gloria",
ubicaci_n_de_caseta_en_km: "  115+550"
},
{
autopista: "Monterrey - Saltillo y Libramiento Norponiente de Saltillo",
caseta: "  Playa 1 A1",
concesionario: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
coordenada_latitud_en_grados: "25.456853",
coordenada_longitud_en_grados: "-101.063694",
iave: "NO",
longitud_en_km: "21.500",
operador: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
tramo_de_cobro: "  Zacatecas - Torreón",
ubicaci_n_de_caseta_en_km: "  21+500"
},
{
autopista: "Monterrey - Saltillo y Libramiento Norponiente de Saltillo",
caseta: "  Playa 1 A2",
concesionario: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
coordenada_latitud_en_grados: "25.457025",
coordenada_longitud_en_grados: "-101.063828",
iave: "NO",
longitud_en_km: "10.000",
operador: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
tramo_de_cobro: "  Torreón - Monclova",
ubicaci_n_de_caseta_en_km: "  21+500"
},
{
autopista: "Monterrey - Saltillo y Libramiento Norponiente de Saltillo",
caseta: "  Playa 1 P",
concesionario: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
coordenada_latitud_en_grados: "25.44846",
coordenada_longitud_en_grados: "-101.067009",
iave: "NO",
longitud_en_km: "31.500",
operador: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
tramo_de_cobro: "  Zacatecas - Monclova",
ubicaci_n_de_caseta_en_km: "  21+500"
},
{
autopista: "Monterrey - Saltillo y Libramiento Norponiente de Saltillo",
caseta: "  Playa 2 A1",
concesionario: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
coordenada_latitud_en_grados: "25.615722",
coordenada_longitud_en_grados: "-100.908414",
iave: "NO",
longitud_en_km: "13.800",
operador: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
tramo_de_cobro: "  Monclova - Ojo Caliente 1",
ubicaci_n_de_caseta_en_km: "  35+300"
},
{
autopista: "Monterrey - Saltillo y Libramiento Norponiente de Saltillo",
caseta: "  Playa 2 A2",
concesionario: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
coordenada_latitud_en_grados: "25.616308",
coordenada_longitud_en_grados: "-100.908432",
iave: "NO",
longitud_en_km: "8.200",
operador: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
tramo_de_cobro: "  Ojo Caliente 1 - Ojo Caliente 2",
ubicaci_n_de_caseta_en_km: "  35+300"
},
{
autopista: "Monterrey - Saltillo y Libramiento Norponiente de Saltillo",
caseta: "  Playa 2 P",
concesionario: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
coordenada_latitud_en_grados: "25.612236",
coordenada_longitud_en_grados: "-100.913526",
iave: "NO",
longitud_en_km: "22.000",
operador: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
tramo_de_cobro: "  Monclova - Ojo Caliente 2",
ubicaci_n_de_caseta_en_km: "  35+300"
},
{
autopista: "Monterrey - Saltillo y Libramiento Norponiente de Saltillo",
caseta: "  Playa 3 A1",
concesionario: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
coordenada_latitud_en_grados: "25.696264",
coordenada_longitud_en_grados: "-100.57736",
iave: "NO",
longitud_en_km: "28.700",
operador: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
tramo_de_cobro: "  Ojo Caliente 2 - Periférico",
ubicaci_n_de_caseta_en_km: "  82+237"
},
{
autopista: "Monterrey - Saltillo y Libramiento Norponiente de Saltillo",
caseta: "  Playa 3 A2",
concesionario: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
coordenada_latitud_en_grados: "25.696264",
coordenada_longitud_en_grados: "-100.57736",
iave: "NO",
longitud_en_km: "12.900",
operador: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
tramo_de_cobro: "  Periférico - Morones Prieto",
ubicaci_n_de_caseta_en_km: "  82+237"
},
{
autopista: "Monterrey - Saltillo y Libramiento Norponiente de Saltillo",
caseta: "  Playa 3 P",
concesionario: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
coordenada_latitud_en_grados: "25.696264",
coordenada_longitud_en_grados: "-100.57736",
iave: "NO",
longitud_en_km: "41.600",
operador: "CONCESIONARIA AUTOPISTA MONTERREY-SALTILLO S. A. DE C. V.",
tramo_de_cobro: "  Ojo Caliente 2 - Morones Prieto",
ubicaci_n_de_caseta_en_km: "  82+237"
},
{
autopista: "Morelia - Salamanca",
caseta: "  La Cinta",
concesionario: "AUTOPISTA MORELIA SALAMANCA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.073484",
coordenada_longitud_en_grados: "-101.136663",
iave: "NO",
longitud_en_km: "20.000",
operador: "AUTOPISTA MORELIA-SALAMANCA S. A. DE C. V.",
tramo_de_cobro: "  Copándaro - La Cinta",
ubicaci_n_de_caseta_en_km: "45+770"
},
{
autopista: "Morelia - Salamanca",
caseta: "  Cuitzeo A1",
concesionario: "AUTOPISTA MORELIA SALAMANCA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.968867",
coordenada_longitud_en_grados: "-101.159727",
iave: "NO",
longitud_en_km: "7.000",
operador: "AUTOPISTA MORELIA-SALAMANCA S. A. DE C. V.",
tramo_de_cobro: "  Copándaro - Cuitzeo",
ubicaci_n_de_caseta_en_km: "  7+100"
},
{
autopista: "Morelia - Salamanca",
caseta: "  Cuitzeo A2",
concesionario: "AUTOPISTA MORELIA SALAMANCA S.A. DE C.V.",
coordenada_latitud_en_grados: "19.968282",
coordenada_longitud_en_grados: "-101.162062",
iave: "NO",
longitud_en_km: "13.000",
operador: "AUTOPISTA MORELIA-SALAMANCA S. A. DE C. V.",
tramo_de_cobro: "  Cuitzeo - La Cinta",
ubicaci_n_de_caseta_en_km: "  7+100"
},
{
autopista: "Morelia - Salamanca",
caseta: "  Uriangato",
concesionario: "AUTOPISTA MORELIA SALAMANCA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.182921",
coordenada_longitud_en_grados: "-101.157187",
iave: "NO",
longitud_en_km: "12.000",
operador: "AUTOPISTA MORELIA-SALAMANCA S. A. DE C. V.",
tramo_de_cobro: "  La Cinta - Uriangato",
ubicaci_n_de_caseta_en_km: "58+200"
},
{
autopista: "Morelia - Salamanca",
caseta: "  Uriangato",
concesionario: "AUTOPISTA MORELIA SALAMANCA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.182921",
coordenada_longitud_en_grados: "-101.157187",
iave: "NO",
longitud_en_km: "26.000",
operador: "AUTOPISTA MORELIA-SALAMANCA S. A. DE C. V.",
tramo_de_cobro: "  Uriangato - Valle de Santiago",
ubicaci_n_de_caseta_en_km: "58+200"
},
{
autopista: "Morelia - Salamanca",
caseta: "  Valle de Santiago",
concesionario: "AUTOPISTA MORELIA SALAMANCA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.372552",
coordenada_longitud_en_grados: "-101.147354",
iave: "NO",
longitud_en_km: "38.000",
operador: "AUTOPISTA MORELIA-SALAMANCA S. A. DE C. V.",
tramo_de_cobro: "  La Cinta - Valle de Santiago",
ubicaci_n_de_caseta_en_km: "  "
},
{
autopista: "Morelia - Salamanca",
caseta: "  Valtierrilla",
concesionario: "AUTOPISTA MORELIA SALAMANCA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.542645",
coordenada_longitud_en_grados: "-101.137717",
iave: "NO",
longitud_en_km: "25.000",
operador: "AUTOPISTA MORELIA-SALAMANCA S. A. DE C. V.",
tramo_de_cobro: "  Valle de Santiago - Ent. Cerro Gordo",
ubicaci_n_de_caseta_en_km: "  "
},
{
autopista: "Morelia - Salamanca",
caseta: "  Valtierrilla A1",
concesionario: "AUTOPISTA MORELIA SALAMANCA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.553053",
coordenada_longitud_en_grados: "-101.136236",
iave: "NO",
longitud_en_km: "5.000",
operador: "AUTOPISTA MORELIA-SALAMANCA S. A. DE C. V.",
tramo_de_cobro: "  Valtierrilla - Ent. Cerro Gordo",
ubicaci_n_de_caseta_en_km: "  "
},
{
autopista: "Morelia - Salamanca",
caseta: " Valtierrilla A2",
concesionario: "AUTOPISTA MORELIA SALAMANCA S.A. DE C.V.",
coordenada_latitud_en_grados: "20.553134",
coordenada_longitud_en_grados: "-101.136428",
iave: "NO",
operador: "AUTOPISTA MORELIA-SALAMANCA S. A. DE C. V.",
tramo_de_cobro: " Ent. Cerro Gordo - Valtierrilla"
},
{
autopista: "Nueva Italia - Lázaro Cárdenas",
caseta: "  Feliciano",
concesionario: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
coordenada_latitud_en_grados: "18.006497",
coordenada_longitud_en_grados: "-101.961761",
iave: "NO",
longitud_en_km: "99.250",
operador: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
tramo_de_cobro: "  Ent. Las Cañas - Lázaro Cárdenas",
ubicaci_n_de_caseta_en_km: "  282+000"
},
{
autopista: "Nueva Italia - Lázaro Cárdenas",
caseta: "  Feliciano",
concesionario: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
coordenada_latitud_en_grados: "18.006497",
coordenada_longitud_en_grados: "-101.961761",
iave: "NO",
longitud_en_km: "70.500",
operador: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
tramo_de_cobro: "  Ent. Las Cañas - Ent. Feliciano",
ubicaci_n_de_caseta_en_km: "  282+000"
},
{
autopista: "Nueva Italia - Lázaro Cárdenas",
caseta: "  Feliciano A1",
concesionario: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
coordenada_latitud_en_grados: "18.004663",
coordenada_longitud_en_grados: "-101.9639",
iave: "NO",
longitud_en_km: "28.750",
operador: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
tramo_de_cobro: "  Ent. Feliciano - Lázaro Cárdenas",
ubicaci_n_de_caseta_en_km: "  282+000"
},
{
autopista: "Nueva Italia - Lázaro Cárdenas",
caseta: "  Feliciano A2",
concesionario: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
coordenada_latitud_en_grados: "18.004082",
coordenada_longitud_en_grados: "-101.961901",
iave: "NO",
longitud_en_km: "28.750",
operador: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
tramo_de_cobro: "  Lázaro Cárdenas - Ent. Feliciano",
ubicaci_n_de_caseta_en_km: "  282+000"
},
{
autopista: "Nueva Italia - Lázaro Cárdenas",
caseta: "  Las Cañas",
concesionario: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
coordenada_latitud_en_grados: "18.554181",
coordenada_longitud_en_grados: "-101.970317",
iave: "NO",
longitud_en_km: "57.500",
operador: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
tramo_de_cobro: "  Ent. Nueva Italia - Ent. Las Cañas",
ubicaci_n_de_caseta_en_km: "  212+000"
},
{
autopista: "Nueva Italia - Lázaro Cárdenas",
caseta: " Las Cañas A1",
concesionario: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
coordenada_latitud_en_grados: "18.553657",
coordenada_longitud_en_grados: "-101.972961",
iave: "NO",
longitud_en_km: "57.500",
operador: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
tramo_de_cobro: "  Ent. Nueva Italia - Ent. Las Cañas",
ubicaci_n_de_caseta_en_km: "  212+000"
},
{
autopista: "Pátzcuaro - Uruapan",
caseta: "  Zirahuén",
concesionario: "AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
coordenada_latitud_en_grados: "19.505606",
coordenada_longitud_en_grados: "-101.659297",
iave: "SI",
longitud_en_km: "20.700",
operador: "AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
tramo_de_cobro: "  Pátzcuaro - Zirahuén",
ubicaci_n_de_caseta_en_km: "  60+500"
},
{
autopista: "Pátzcuaro - Uruapan",
caseta: "  Zirahuén A1",
concesionario: "AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
coordenada_latitud_en_grados: "19.482235",
coordenada_longitud_en_grados: "-101.730717",
iave: "NO",
longitud_en_km: "35.800",
operador: "AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
tramo_de_cobro: "  Zirahuén - Zurumucapío",
ubicaci_n_de_caseta_en_km: "  87+400"
},
{
autopista: "Pátzcuaro - Uruapan",
caseta: "  Zurumucapío",
concesionario: "AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
coordenada_latitud_en_grados: "19.441166",
coordenada_longitud_en_grados: "-101.882235",
iave: "SI",
longitud_en_km: "16.500",
operador: "AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
tramo_de_cobro: "  Zirahuén - Uruapan",
ubicaci_n_de_caseta_en_km: "  87+400"
},
{
autopista: "Peñón - Texcoco",
caseta: "  Peñón",
concesionario: "GOBIERNO DEL ESTADO DE MÉXICO SISTEMA DE AUTOPISTAS, AEROPUERTOS, SERVICIOS CONEXOS Y AUXILIARES DEL ESTADO DE MÉXICO",
coordenada_latitud_en_grados: "19.468849",
coordenada_longitud_en_grados: "-99.004418",
iave: "SI",
longitud_en_km: "16.170",
operador: "OPERVITE",
tramo_de_cobro: "  Peñón - Texcoco",
ubicaci_n_de_caseta_en_km: "  0+860"
},
{
autopista: "Peñón - Texcoco",
caseta: " Texcoco",
concesionario: "GOBIERNO DEL ESTADO DE MÉXICO SISTEMA DE AUTOPISTAS, AEROPUERTOS, SERVICIOS CONEXOS Y AUXILIARES DEL ESTADO DE MÉXICO",
coordenada_latitud_en_grados: "19.502896",
coordenada_longitud_en_grados: "-98.912747",
iave: "SI",
operador: "OPERVITE",
tramo_de_cobro: "  Texcoco - Peñón",
ubicaci_n_de_caseta_en_km: "14+480"
},
{
autopista: "Perote - Banderilla y Libramiento de Xalapa",
caseta: " Las Vigas",
concesionario: "Concesionaria Autopista Perote-Xalapa S. A. de C. V.",
coordenada_latitud_en_grados: "19.627722",
coordenada_longitud_en_grados: "-97.153089",
iave: "NO",
longitud_en_km: "30",
operador: "Concesionaria Autopista Perote-Xalapa S. A. de C. V.",
tramo_de_cobro: "Perote - Banderilla",
ubicaci_n_de_caseta_en_km: "117+110"
},
{
autopista: "Perote - Banderilla y Libramiento de Xalapa",
caseta: " Miradores",
concesionario: "Concesionaria Autopista Perote-Xalapa S. A. de C. V.",
coordenada_latitud_en_grados: "19.472105",
coordenada_longitud_en_grados: "-96.772824",
iave: "NO",
longitud_en_km: "29.6",
operador: "Concesionaria Autopista Perote-Xalapa S. A. de C. V.",
tramo_de_cobro: "Libramiento de Xalapa",
ubicaci_n_de_caseta_en_km: "77+140"
},
{
autopista: "Puebla - Acatzingo",
caseta: "  Amozoc",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.049787",
coordenada_longitud_en_grados: "-98.032313",
iave: "SI",
longitud_en_km: "42.270",
operador: "CAPUFE",
tramo_de_cobro: "  Puebla - Acatzingo",
ubicaci_n_de_caseta_en_km: "  141+613"
},
{
autopista: "Puebla - Acatzingo",
caseta: "  Amozoc",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "19.049787",
coordenada_longitud_en_grados: "-98.032313",
iave: "SI",
longitud_en_km: "13.758",
operador: "CAPUFE",
tramo_de_cobro: "  Puebla - Amozoc",
ubicaci_n_de_caseta_en_km: "  141+613"
},
{
autopista: "Puente Alvarado",
caseta: "  Alvarado",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "18.769878",
coordenada_longitud_en_grados: "-95.744556",
iave: "SI",
longitud_en_km: "0.530",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Alvarado",
ubicaci_n_de_caseta_en_km: "  1+500"
},
{
autopista: "Puente Cadereyta",
caseta: "  Cadereyta",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "25.601059",
coordenada_longitud_en_grados: "-100.005737",
iave: "SI",
longitud_en_km: "0.179",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Cadereyta",
ubicaci_n_de_caseta_en_km: "  28+000"
},
{
autopista: "Puente Camargo",
caseta: "  Camargo",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "26.362441",
coordenada_longitud_en_grados: "-98.806402",
iave: "NO",
longitud_en_km: "0.116",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Camargo",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Caracol",
caseta: "  Caracol",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "18.133114",
coordenada_longitud_en_grados: "-96.136671",
iave: "SI",
longitud_en_km: "0.164",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Caracol",
ubicaci_n_de_caseta_en_km: "  10+100"
},
{
autopista: "Puente Cd. Acuña",
caseta: "  Cd. Acuña",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "29.325454",
coordenada_longitud_en_grados: "-100.928793",
iave: "NO",
longitud_en_km: "0.129",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Cd. Acuña",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Coatzacoalcos",
caseta: "  Coatzacoalcos",
concesionario: "GOBIERNO DEL ESTADO DE VERACRUZ",
coordenada_latitud_en_grados: "18.115156",
coordenada_longitud_en_grados: "-94.410884",
iave: "SI",
longitud_en_km: "0.985",
operador: "OPERACIÓN Y CONSERVACIÓN DE AUTOPISTAS CONCESIONADAS S.A. DE C.V.",
tramo_de_cobro: "  Puente Coatzacoalcos",
ubicaci_n_de_caseta_en_km: "  2+100"
},
{
autopista: "Puente Colorado",
caseta: "  San Luis Río Colorado",
concesionario: "GOBIERNO DEL ESTADO DE SONORA",
coordenada_latitud_en_grados: "32.491685",
coordenada_longitud_en_grados: "-114.808756",
iave: "NO",
longitud_en_km: "0.304",
operador: "GOBIERNO DEL ESTADO DE SONORA",
tramo_de_cobro: "  Puente Colorado",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Colorado II",
caseta: "  San Luis Río Colorado",
concesionario: "GOBIERNO DEL ESTADO DE SONORA",
coordenada_latitud_en_grados: "32.491685",
coordenada_longitud_en_grados: "-114.808756",
iave: "NO",
longitud_en_km: "0.305",
operador: "GOBIERNO DEL ESTADO DE SONORA",
tramo_de_cobro: "  Puente Colorado",
ubicaci_n_de_caseta_en_km: "  0+001"
},
{
autopista: "Puente Córdova (Las Américas)",
caseta: "  Sin cargo para los usuarios",
concesionario: "GOBIERNO DEL ESTADO DE CHIHUAHUA",
iave: "NO",
longitud_en_km: "0.250",
operador: "GOBIERNO DEL ESTADO DE CHIHUAHUA",
tramo_de_cobro: "  Puente Córdova",
ubicaci_n_de_caseta_en_km: "  0"
},
{
autopista: "Puente Culiacán",
caseta: "  Culiacán",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "24.948879",
coordenada_longitud_en_grados: "-107.545718",
iave: "SI",
longitud_en_km: "0.433",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Culiacán",
ubicaci_n_de_caseta_en_km: "  1,429+000"
},
{
autopista: "Puente de Ixtla - Iguala",
caseta: "  Iguala",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.33621",
coordenada_longitud_en_grados: "-99.508327",
iave: "SI",
longitud_en_km: "63.578",
operador: "CAPUFE",
tramo_de_cobro: "  Puente de Ixtla - Iguala",
ubicaci_n_de_caseta_en_km: "  95+950"
},
{
autopista: "Puente Dovalí Jaime (Cosoleacaque - Nuevo Teapa)",
caseta: " Dovalí",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "18.013379",
coordenada_longitud_en_grados: "-94.396777",
iave: "NO",
longitud_en_km: "1.268",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Dovalí Jaime"
},
{
autopista: "Puente Dovalí Jaime (Cosoleacaque - Nuevo Teapa)",
caseta: " Dovalí Bis",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "18.014055",
coordenada_longitud_en_grados: "-94.443264",
iave: "NO",
operador: "CAPUFE",
tramo_de_cobro: " Salida a Nanchital"
},
{
autopista: "Puente El Zacatal",
caseta: "  El Zacatal",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.61286",
coordenada_longitud_en_grados: "-91.860817",
iave: "SI",
longitud_en_km: "3.861",
operador: "CAPUFE",
tramo_de_cobro: "  Puente El Zacatal",
ubicaci_n_de_caseta_en_km: "  162+497"
},
{
autopista: "Puente Grijalva",
concesionario: "CAPUFE",
iave: "NO",
longitud_en_km: "0.254",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Grijalva"
},
{
autopista: "Puente Juárez - Lincoln",
caseta: "  Juárez Lincoln",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "27.498254",
coordenada_longitud_en_grados: "-99.502409",
iave: "NO",
longitud_en_km: "0.159",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Juárez - Lincoln",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente La Piedad",
caseta: "  La Piedad",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "20.352787",
coordenada_longitud_en_grados: "-102.025175",
iave: "SI",
longitud_en_km: "0.092",
operador: "CAPUFE",
tramo_de_cobro: "  Puente La Piedad",
ubicaci_n_de_caseta_en_km: "  89+100"
},
{
autopista: "Puente La Unidad - Eugenio Echeverria Castellot",
caseta: " Isla Aguada",
concesionario: "GOBIERNO DEL ESTADO DE CAMPECHE",
coordenada_latitud_en_grados: "18.785548",
coordenada_longitud_en_grados: "-91.494874",
iave: "NO",
longitud_en_km: "3.222",
operador: "GOBIERNO DEL ESTADO DE CAMPECHE",
tramo_de_cobro: "  Isla del Carmen - Isla Aguada",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Laredo I (Las Américas)",
caseta: "  Laredo I",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "27.49856",
coordenada_longitud_en_grados: "-99.507378",
iave: "NO",
longitud_en_km: "0.108",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Laredo I",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Las Flores",
caseta: "  Las Flores",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "26.060544",
coordenada_longitud_en_grados: "-97.950416",
iave: "NO",
longitud_en_km: "0.083",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Las Flores",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Libre Comercio",
caseta: "  Libre Comercio",
concesionario: "GOBIERNO DEL ESTADO DE TAMAULIPAS",
coordenada_latitud_en_grados: "26.021585",
coordenada_longitud_en_grados: "-97.738817",
iave: "NO",
longitud_en_km: "0.080",
operador: "GOBIERNO DEL ESTADO DE TAMAULIPAS",
tramo_de_cobro: "  Puente Libre Comercio",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Los Tomates",
caseta: "  Los Tomates",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "25.874233",
coordenada_longitud_en_grados: "-97.474692",
iave: "NO",
longitud_en_km: "0.810",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Los Tomates",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Matamoros",
caseta: "  Matamoros",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "25.891382",
coordenada_longitud_en_grados: "-97.503914",
iave: "NO",
longitud_en_km: "0.155",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Matamoros",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Miguel Alemán",
caseta: "  Miguel Alemán",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "26.402916",
coordenada_longitud_en_grados: "-99.020661",
iave: "NO",
longitud_en_km: "0.155",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Miguel Alemán",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Nautla",
caseta: "  Nautla",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "20.210215",
coordenada_longitud_en_grados: "-96.778734",
iave: "SI",
longitud_en_km: "0.214",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Nautla",
ubicaci_n_de_caseta_en_km: "  0+700"
},
{
autopista: "Puente Nuevo Laredo III",
caseta: "  Nuevo Laredo III",
concesionario: "GOBIERNO DEL ESTADO DE TAMAULIPAS ",
coordenada_latitud_en_grados: "27.595071",
coordenada_longitud_en_grados: "-99.541437",
iave: "NO",
longitud_en_km: "0.298",
operador: "GOBIERNO DEL ESTADO DE TAMAULIPAS ",
tramo_de_cobro: "  Puente Nuevo Laredo III",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Ojinaga",
caseta: "  Ojinaga",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "29.561043",
coordenada_longitud_en_grados: "-104.397206",
iave: "NO",
longitud_en_km: "0.121",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Ojinaga",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Papaloapan",
caseta: "  Papaloapan",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "18.159588",
coordenada_longitud_en_grados: "-96.096688",
iave: "SI",
longitud_en_km: "0.288",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Papaloapan",
ubicaci_n_de_caseta_en_km: "  2+800"
},
{
autopista: "Puente Paso del Norte",
caseta: "  Paso del Norte",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "31.745887",
coordenada_longitud_en_grados: "-106.486418",
iave: "NO",
longitud_en_km: "0.216",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Paso del Norte",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Pánuco",
caseta: "  Pánuco",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "22.148794",
coordenada_longitud_en_grados: "-98.144897",
iave: "SI",
longitud_en_km: "0.179",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Pánuco",
ubicaci_n_de_caseta_en_km: "  198+000"
},
{
autopista: "Puente Piedras Negras",
caseta: "  Piedras Negras",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "28.705234",
coordenada_longitud_en_grados: "-100.512987",
iave: "NO",
longitud_en_km: "0.113",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Piedras Negras",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Piedras Negras II",
caseta: "  Piedras Negras II",
concesionario: "GOBIERNO DEL ESTADO DE COAHUILA",
coordenada_latitud_en_grados: "28.697047",
coordenada_longitud_en_grados: "-100.512395",
iave: "NO",
longitud_en_km: "0.102",
operador: "GOBIERNO DEL ESTADO DE COAHUILA",
tramo_de_cobro: "  Puente Piedras Negras II",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Reynosa",
caseta: "  Reynosa",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "26.093215",
coordenada_longitud_en_grados: "-98.270947",
iave: "NO",
longitud_en_km: "0.112",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Reynosa",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Reynosa-Pharr (Nuevo Amanecer)",
caseta: " Reynosa - Pharr",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "26.041812",
coordenada_longitud_en_grados: "-98.20886",
iave: "NO",
longitud_en_km: "2.629",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Reynosa-Pharr",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Rodolfo Robles",
caseta: "  Rodolfo Robles",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "14.677057",
coordenada_longitud_en_grados: "-92.149701",
iave: "NO",
longitud_en_km: "0.189",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Rodolfo Robles",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente San Juan",
caseta: "  San Juan",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "26.311873",
coordenada_longitud_en_grados: "-98.841957",
iave: "NO",
longitud_en_km: "0.175",
operador: "CAPUFE",
tramo_de_cobro: "  Puente San Juan",
ubicaci_n_de_caseta_en_km: "  1+100"
},
{
autopista: "Puente San Miguel",
caseta: "  San Miguel",
concesionario: "GOBIERNO DEL ESTADO DE SINALOA",
coordenada_latitud_en_grados: "25.976312",
coordenada_longitud_en_grados: "-109.033558",
iave: "NO",
longitud_en_km: "0.260",
operador: "GOBIERNO DEL ESTADO DE SINALOA",
tramo_de_cobro: "  Puente San Miguel",
ubicaci_n_de_caseta_en_km: "  19+700"
},
{
autopista: "Puente Sinaloa",
caseta: "  Sinaloa",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "25.512842",
coordenada_longitud_en_grados: "-108.347578",
iave: "SI",
longitud_en_km: "0.320",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Sinaloa",
ubicaci_n_de_caseta_en_km: "  1,617+000"
},
{
autopista: "Puente Solidaridad (Colombia)",
caseta: "  Solidaridad",
concesionario: "GOBIERNO DEL ESTADO DE NUEVO LEÓN",
coordenada_latitud_en_grados: "27.697345",
coordenada_longitud_en_grados: "-99.747804",
iave: "NO",
longitud_en_km: "0.160",
operador: "GOBIERNO DEL ESTADO DE NUEVO LEÓN",
tramo_de_cobro: "  Puente Solidaridad",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Suchiate II",
caseta: "  Suchiate II",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "14.702181",
coordenada_longitud_en_grados: "-92.151404",
iave: "NO",
longitud_en_km: "0.029",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Suchiate II",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Tampico",
caseta: "  Tampico",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "22.218325",
coordenada_longitud_en_grados: "-97.824741",
iave: "NO",
longitud_en_km: "1.543",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Tampico",
ubicaci_n_de_caseta_en_km: "  1+900"
},
{
autopista: "Puente Tecolutla",
caseta: "  Tecolutla",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "20.437802",
coordenada_longitud_en_grados: "-97.086444",
iave: "SI",
longitud_en_km: "0.368",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Tecolutla",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puente Tlacotalpan",
caseta: "  Tlacotalpan",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "18.704609",
coordenada_longitud_en_grados: "-95.641325",
iave: "SI",
longitud_en_km: "0.597",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Tlacotalpan",
ubicaci_n_de_caseta_en_km: "  1+300"
},
{
autopista: "Puente Usumacinta",
caseta: "  Usumacinta",
concesionario: "CAPUFE",
coordenada_latitud_en_grados: "17.859877",
coordenada_longitud_en_grados: "-91.783643",
iave: "SI",
longitud_en_km: "0.347",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Usumacinta",
ubicaci_n_de_caseta_en_km: "  45+200"
},
{
autopista: "Puente Zaragoza - Ysleta",
caseta: "  Zaragoza",
concesionario: "PROMOFONT S. A. DE C. V.",
coordenada_latitud_en_grados: "31.670895",
coordenada_longitud_en_grados: "-106.34067",
iave: "NO",
longitud_en_km: "0.155",
operador: "CAPUFE",
tramo_de_cobro: "  Puente Zaragoza - Ysleta",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Puerto México - Ent. La Carbonera",
caseta: " Los Chorros",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "25.186754",
coordenada_longitud_en_grados: "-100.731938",
iave: "SI",
longitud_en_km: "32.000",
operador: "CAPUFE",
tramo_de_cobro: "  Puerto México - Ent. La Carbonera",
ubicaci_n_de_caseta_en_km: "  203+500"
},
{
autopista: "Puerto México - Ent. La Carbonera",
caseta: " Huachichil",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "25.24548",
coordenada_longitud_en_grados: "-100.801484",
iave: "NO",
operador: "CAPUFE",
tramo_de_cobro: "Puerto México - Huachichil",
ubicaci_n_de_caseta_en_km: "206+500"
},
{
autopista: "Querétaro - Irapuato",
caseta: "  Cerro Gordo",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "20.591875",
coordenada_longitud_en_grados: "-101.137274",
iave: "SI",
longitud_en_km: "32.750",
operador: "CAPUFE",
tramo_de_cobro: "  Celaya - Cerro Gordo",
ubicaci_n_de_caseta_en_km: "  "
},
{
autopista: "Querétaro - Irapuato",
caseta: "  Cerro Gordo",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "20.591875",
coordenada_longitud_en_grados: "-101.137274",
iave: "SI",
longitud_en_km: "5.000",
operador: "CAPUFE",
tramo_de_cobro: "  Cerro Gordo - Salamanca",
ubicaci_n_de_caseta_en_km: "  "
},
{
autopista: "Querétaro - Irapuato",
caseta: "  Salamanca",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "20.598452",
coordenada_longitud_en_grados: "-101.180914",
iave: "SI",
longitud_en_km: "59.250",
operador: "CAPUFE",
tramo_de_cobro: "  Celaya - Irapuato",
ubicaci_n_de_caseta_en_km: "  83+250"
},
{
autopista: "Querétaro - Irapuato",
caseta: "  Salamanca A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "20.599141",
coordenada_longitud_en_grados: "-101.180695",
iave: "SI",
longitud_en_km: "37.750",
operador: "CAPUFE",
tramo_de_cobro: "  Celaya - Salamanca",
ubicaci_n_de_caseta_en_km: "  83+250"
},
{
autopista: "Querétaro - Irapuato",
caseta: "  Salamanca A2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "20.597586",
coordenada_longitud_en_grados: "-101.181031",
iave: "SI",
longitud_en_km: "21.500",
operador: "CAPUFE",
tramo_de_cobro: "  Salamanca - Irapuato",
ubicaci_n_de_caseta_en_km: "  83+250"
},
{
autopista: "Querétaro - Irapuato",
caseta: "  Salamanca A3",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "20.590023",
coordenada_longitud_en_grados: "-101.136035",
iave: "SI",
longitud_en_km: "26.750",
operador: "CAPUFE",
tramo_de_cobro: "  Cerro Gordo - Irapuato",
ubicaci_n_de_caseta_en_km: "  83+250"
},
{
autopista: "Querétaro - Irapuato",
caseta: "  Villagrán A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "20.582207",
coordenada_longitud_en_grados: "-100.992157",
iave: "NO",
longitud_en_km: "19.950",
operador: "CAPUFE",
tramo_de_cobro: "  Celaya - Ent. Villagrán",
ubicaci_n_de_caseta_en_km: " 63+000"
},
{
autopista: "Querétaro - Irapuato",
caseta: "  Villagrán A2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "20.579417",
coordenada_longitud_en_grados: "-100.99235",
iave: "NO",
operador: "CAPUFE",
tramo_de_cobro: "  Ent. Villagrán - Celaya",
ubicaci_n_de_caseta_en_km: " 63+000"
},
{
autopista: "Rancho Viejo - Taxco",
caseta: "  Taxco",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.588623",
coordenada_longitud_en_grados: "-99.559957",
iave: "SI",
longitud_en_km: "8.340",
operador: "CAPUFE",
tramo_de_cobro: "  Rancho Viejo - Taxco",
ubicaci_n_de_caseta_en_km: " 0+300"
},
{
autopista: "Reynosa - Matamoros",
caseta: "  Nuevo Progreso A2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "26.037152",
coordenada_longitud_en_grados: "-97.954566",
iave: "NO",
longitud_en_km: "21.610",
operador: "CAPUFE",
tramo_de_cobro: "  Nuevo Progreso - Matamoros",
ubicaci_n_de_caseta_en_km: "  21+040"
},
{
autopista: "Reynosa - Matamoros",
caseta: "  Nuevo Progreso P",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "26.036267",
coordenada_longitud_en_grados: "-97.954452",
iave: "SI",
longitud_en_km: "44.000",
operador: "CAPUFE",
tramo_de_cobro: "  Reynosa - Matamoros",
ubicaci_n_de_caseta_en_km: "  21+040"
},
{
autopista: "Reynosa - Matamoros",
caseta: "  Nuevo Progreso A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "26.035227",
coordenada_longitud_en_grados: "-97.954438",
iave: "NO",
longitud_en_km: "22.390",
operador: "CAPUFE",
tramo_de_cobro: "  Reynosa - Nuevo Progreso",
ubicaci_n_de_caseta_en_km: "  21+040"
},
{
autopista: "Río Verde - Cd. Valles",
caseta: " Rayón",
concesionario: "ICA SAN LUIS S. A. DE C. V.",
coordenada_latitud_en_grados: "21.864264",
coordenada_longitud_en_grados: "-99.618995",
iave: "NO",
longitud_en_km: "18.200",
operador: "ICA SAN LUIS S. A. DE C. V.",
tramo_de_cobro: "  Rayón - Vicente Guerrero",
ubicaci_n_de_caseta_en_km: "  0+300"
},
{
autopista: "Rumorosa - Tecate",
caseta: "  El Hongo",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "32.521819",
coordenada_longitud_en_grados: "-116.319985",
iave: "NO",
longitud_en_km: "55.500",
operador: "CAPUFE",
tramo_de_cobro: "  La Rumorosa - Tecate",
ubicaci_n_de_caseta_en_km: "  92+310"
},
{
autopista: "Rumorosa - Tecate",
caseta: "  El Hongo A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "32.521141",
coordenada_longitud_en_grados: "-116.320114",
iave: "NO",
longitud_en_km: "24.900",
operador: "CAPUFE",
tramo_de_cobro: "  El Hongo - Tecate",
ubicaci_n_de_caseta_en_km: "  92+310"
},
{
autopista: "Rumorosa - Tecate",
caseta: "  El Hongo A2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "32.522437",
coordenada_longitud_en_grados: "-116.31983",
iave: "NO",
longitud_en_km: "30.560",
operador: "CAPUFE",
tramo_de_cobro: "  Rumorosa - El Hongo",
ubicaci_n_de_caseta_en_km: "  92+310"
},
{
autopista: "Salina Cruz - La Ventosa",
caseta: "  Ixtepec A1",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "16.561071",
coordenada_longitud_en_grados: "-95.134966",
iave: "NO",
longitud_en_km: "30.900",
operador: "CAPUFE",
tramo_de_cobro: "  Tehuantepec - Ixtepec",
ubicaci_n_de_caseta_en_km: "  53+600"
},
{
autopista: "Salina Cruz - La Ventosa",
caseta: "  Ixtepec A2",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "16.561481",
coordenada_longitud_en_grados: "-95.134292",
iave: "NO",
longitud_en_km: "27.900",
operador: "CAPUFE",
tramo_de_cobro: "  Ixtepec - La Ventosa",
ubicaci_n_de_caseta_en_km: "  53+600"
},
{
autopista: "Salina Cruz - La Ventosa",
caseta: "  Ixtepec A3",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "16.561823",
coordenada_longitud_en_grados: "-95.136055",
iave: "NO",
longitud_en_km: "27.900",
operador: "CAPUFE",
tramo_de_cobro: "  Ixtepec - La Ventosa",
ubicaci_n_de_caseta_en_km: "  53+600"
},
{
autopista: "Salina Cruz - La Ventosa",
caseta: "  Ixtepec",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "16.561154",
coordenada_longitud_en_grados: "-95.135615",
iave: "SI",
longitud_en_km: "52.600",
operador: "CAPUFE",
tramo_de_cobro: "  Tehuantepec - La Ventosa",
ubicaci_n_de_caseta_en_km: "  53+600"
},
{
autopista: "Salina Cruz - La Ventosa",
caseta: "  Tehuantepec",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "16.162139",
coordenada_longitud_en_grados: "-95.289239",
iave: "SI",
longitud_en_km: "22.700",
operador: "CAPUFE",
tramo_de_cobro: "  Salina Cruz - Tehuantepec",
ubicaci_n_de_caseta_en_km: "  1+800"
},
{
autopista: "San José del Cabo - Aeropuerto Los Cabos",
caseta: "  San José del Cabo",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "23.04992",
coordenada_longitud_en_grados: "-109.719559",
iave: "NO",
longitud_en_km: "20.200",
operador: "CAPUFE",
tramo_de_cobro: "  San José del Cabo - Aeropuerto Los Cabos",
ubicaci_n_de_caseta_en_km: "  0+200"
},
{
autopista: "San Martín Texmelucan - Tlaxcala",
caseta: "  Aucal",
concesionario: "PROMOTORA DE AUTOPISTAS DEL PACÍFICO S. A. DE C. V.",
coordenada_latitud_en_grados: "19.301587",
coordenada_longitud_en_grados: "-98.404051",
iave: "NO",
longitud_en_km: "19.419",
operador: "OPERVITE S. A. DE C. V.",
tramo_de_cobro: "  San Martín Texmelucan - Tlaxcala",
ubicaci_n_de_caseta_en_km: "  5+450"
},
{
autopista: "Santa Ana - Altar",
caseta: "  Santa Ana",
concesionario: "GOBIERNO DEL ESTADO DE SONORA CONCESIONARIA ZONALTA S. A. DE C. V.",
coordenada_latitud_en_grados: "30.568679",
coordenada_longitud_en_grados: "-111.284143",
iave: "NO",
longitud_en_km: "73.000",
operador: "OPERVITE S. A. DE C. V.",
tramo_de_cobro: "  Santa Ana - Altar",
ubicaci_n_de_caseta_en_km: "  39+753"
},
{
autopista: "Tecate - Tijuana",
caseta: "  Esperanza",
concesionario: "AUTOPISTA TIJUANA - TECATE S. A. DE C. V.",
coordenada_latitud_en_grados: "32.550743",
coordenada_longitud_en_grados: "-116.621899",
iave: "NO",
longitud_en_km: "4.800",
operador: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REP. MEXICANA S. A. DE C. V. ",
tramo_de_cobro: "  Ent. Esperanza - Ent. Sandoval",
ubicaci_n_de_caseta_en_km: "  122+800"
},
{
autopista: "Tecate - Tijuana",
caseta: "  Tecate",
concesionario: "AUTOPISTA TIJUANA - TECATE S. A. DE C. V.",
coordenada_latitud_en_grados: "32.52585",
coordenada_longitud_en_grados: "-116.690261",
iave: "NO",
longitud_en_km: "12.250",
operador: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REP. MEXICANA S. A. DE C. V. ",
tramo_de_cobro: "  Libramiento de Tecate",
ubicaci_n_de_caseta_en_km: "  130+500"
},
{
autopista: "Tecate - Tijuana",
caseta: "  Tijuana",
concesionario: "AUTOPISTA TIJUANA - TECATE S. A. DE C. V.",
coordenada_latitud_en_grados: "32.54579",
coordenada_longitud_en_grados: "-116.852039",
iave: "NO",
longitud_en_km: "29.800",
operador: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REP. MEXICANA S. A. DE C. V. ",
tramo_de_cobro: "  Tecate - Tijuana y Lib. de Tecate",
ubicaci_n_de_caseta_en_km: "  147+600"
},
{
autopista: "Tejocotal - Nuevo Necaxa",
caseta: "  Nuevo Necaxa",
concesionario: "FIDEICOMISO AUTOPISTAS Y PUENTES DEL GOLFO CENTRO",
coordenada_latitud_en_grados: "20.183843",
coordenada_longitud_en_grados: "-98.027601",
iave: "NO",
longitud_en_km: "17.500",
operador: "CAPUFE",
tramo_de_cobro: "  Tejocotal - Nuevo Necaxa",
ubicaci_n_de_caseta_en_km: "  17+000"
},
{
autopista: "Tepic - Villa Unión",
caseta: "  Acaponeta",
concesionario: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
coordenada_latitud_en_grados: "22.453835",
coordenada_longitud_en_grados: "-105.424726",
iave: "NO",
longitud_en_km: "100.560",
operador: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
tramo_de_cobro: "  Rosamorada - Escuinapa"
},
{
autopista: "Tepic - Villa Unión",
caseta: "  Acaponeta A1",
concesionario: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
coordenada_latitud_en_grados: "22.454088",
coordenada_longitud_en_grados: "-105.418817",
iave: "NO",
longitud_en_km: "46.300",
operador: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
tramo_de_cobro: "  Rosamorada - Acaponeta",
ubicaci_n_de_caseta_en_km: "  "
},
{
autopista: "Tepic - Villa Unión",
caseta: "  Acaponeta A2",
concesionario: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
coordenada_latitud_en_grados: "22.454088",
coordenada_longitud_en_grados: "-105.418817",
iave: "NO",
longitud_en_km: "54.260",
operador: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
tramo_de_cobro: "  Acaponeta - Escuinapa",
ubicaci_n_de_caseta_en_km: "  "
},
{
autopista: "Tepic - Villa Unión",
caseta: "  Rosario",
concesionario: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
coordenada_latitud_en_grados: "22.984707",
coordenada_longitud_en_grados: "-105.878039",
iave: "NO",
longitud_en_km: "64.950",
operador: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
tramo_de_cobro: "  Escuinapa - Villa Unión",
ubicaci_n_de_caseta_en_km: "  37+000"
},
{
autopista: "Tepic - Villa Unión",
caseta: "  Rosario A1",
concesionario: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
coordenada_latitud_en_grados: "22.985107",
coordenada_longitud_en_grados: "-105.875275",
iave: "NO",
longitud_en_km: "26.380",
operador: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
tramo_de_cobro: "  Escuinapa - Rosario",
ubicaci_n_de_caseta_en_km: "  37+000"
},
{
autopista: "Tepic - Villa Unión",
caseta: "  Rosario A2",
concesionario: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
coordenada_latitud_en_grados: "22.985107",
coordenada_longitud_en_grados: "-105.875275",
iave: "NO",
longitud_en_km: "38.570",
operador: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
tramo_de_cobro: "  Rosario - Villa Unión",
ubicaci_n_de_caseta_en_km: "  37+000"
},
{
autopista: "Tepic - Villa Unión",
caseta: "  Ruiz A2",
concesionario: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
coordenada_latitud_en_grados: "21.953097",
coordenada_longitud_en_grados: "-105.120877",
iave: "NO",
longitud_en_km: "18.562",
operador: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
tramo_de_cobro: "  Ruiz - Rosamorada",
ubicaci_n_de_caseta_en_km: "  "
},
{
autopista: "Tepic - Villa Unión",
caseta: "  Ruíz",
concesionario: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
coordenada_latitud_en_grados: "21.951811",
coordenada_longitud_en_grados: "-105.116064",
iave: "NO",
longitud_en_km: "45.180",
operador: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
tramo_de_cobro: "  Entronque San Blas - Rosamorada",
ubicaci_n_de_caseta_en_km: "  "
},
{
autopista: "Tepic - Villa Unión",
caseta: "  Ruíz A1",
concesionario: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
coordenada_latitud_en_grados: "21.953097",
coordenada_longitud_en_grados: "-105.120877",
iave: "NO",
longitud_en_km: "26.618",
operador: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
tramo_de_cobro: "  Entronque San Blas - Estación Ruiz",
ubicaci_n_de_caseta_en_km: "  "
},
{
autopista: "Tepic - Villa Unión",
caseta: "  Ruíz",
concesionario: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
coordenada_latitud_en_grados: "21.951811",
coordenada_longitud_en_grados: "-105.116064",
iave: "NO",
longitud_en_km: "31.700",
operador: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
tramo_de_cobro: "  Estación Yago - Rosamorada",
ubicaci_n_de_caseta_en_km: "  "
},
{
autopista: "Tepic - Villa Unión",
caseta: "  Trapichillo",
concesionario: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
coordenada_latitud_en_grados: "21.571769",
coordenada_longitud_en_grados: "-104.987465",
iave: "SI",
longitud_en_km: "25.000",
operador: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
tramo_de_cobro: "  Tepic - Ent. San Blas",
ubicaci_n_de_caseta_en_km: "  5+100"
},
{
autopista: "Tepic - Villa Unión",
caseta: "  Yago A1",
concesionario: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
coordenada_latitud_en_grados: "21.844631",
coordenada_longitud_en_grados: "-105.084918",
iave: "NO",
longitud_en_km: "13.480",
operador: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
tramo_de_cobro: "  Ent San Blas - Estación Yago",
ubicaci_n_de_caseta_en_km: "  "
},
{
autopista: "Tepic - Villa Unión",
caseta: "  Yago A2",
concesionario: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
coordenada_latitud_en_grados: "21.845203",
coordenada_longitud_en_grados: "-105.086575",
iave: "NO",
longitud_en_km: "13.138",
operador: "CONCESIONARIA DE CARRETERAS, AUTOPISTAS Y LIBRAMIENTOS DE LA REPÚBLICA MEXICANA S. A. DE C. V.",
tramo_de_cobro: "  Estación Yago - Ruiz",
ubicaci_n_de_caseta_en_km: "  "
},
{
autopista: "Tihuatlán - Tuxpam y Puente Tuxpam",
caseta: "  Tuxpam",
concesionario: "FIDEICOMISO AUTOPISTAS Y PUENTES DEL GOLFO CENTRO",
coordenada_latitud_en_grados: "20.918939",
coordenada_longitud_en_grados: "-97.415892",
iave: "NO",
longitud_en_km: "37.500",
operador: "CAPUFE",
tramo_de_cobro: "  Tihuatlán - Tuxpam",
ubicaci_n_de_caseta_en_km: "  342+700"
},
{
autopista: "Torreón - Saltillo",
caseta: "  La Cuchilla",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "25.627001",
coordenada_longitud_en_grados: "-102.878215",
iave: "SI",
longitud_en_km: "39.840",
operador: "CAPUFE",
tramo_de_cobro: "  Matamoros - La Cuchilla",
ubicaci_n_de_caseta_en_km: "  67+036"
},
{
autopista: "Torreón - Saltillo",
caseta: "  Plan de Ayala",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "25.444123",
coordenada_longitud_en_grados: "-101.303947",
iave: "SI",
longitud_en_km: "78.000",
operador: "CAPUFE",
tramo_de_cobro: "  Loma Bonita - Puebla",
ubicaci_n_de_caseta_en_km: "  142+000"
},
{
autopista: "Tuxtla Gutiérrez - San Cristóbal de las Casas",
caseta: "  Chiapa de Corzo",
concesionario: "CONCESIONARIA DE AUTOPISTAS DEL SURESTE S. A. DE C. V.",
coordenada_latitud_en_grados: "16.730618",
coordenada_longitud_en_grados: "-93.0095",
iave: "SI",
longitud_en_km: "21.000",
operador: "CONCESIONARIA DE AUTOPISTAS DEL SURESTE S. A. DE C. V.",
tramo_de_cobro: "  Tuxtla Gutiérrez - San Cristóbal de las Casas",
ubicaci_n_de_caseta_en_km: "  0+000"
},
{
autopista: "Uruapan - Nueva Italia",
caseta: "  Santa Casilda",
concesionario: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
coordenada_latitud_en_grados: "19.152932",
coordenada_longitud_en_grados: "-101.97813",
iave: "SI",
longitud_en_km: "31.000",
operador: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
tramo_de_cobro: "  Ent. Cajones - Ent. Cuatro Caminos",
ubicaci_n_de_caseta_en_km: "  132+500"
},
{
autopista: "Uruapan - Nueva Italia",
caseta: "  Santa Casilda A1",
concesionario: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
coordenada_latitud_en_grados: "19.156446",
coordenada_longitud_en_grados: "-101.976099",
iave: "NO",
longitud_en_km: "11.000",
operador: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
tramo_de_cobro: "  Ent. Cajones - Ent. Santa Casilda",
ubicaci_n_de_caseta_en_km: "  132+500"
},
{
autopista: "Uruapan - Nueva Italia",
caseta: "  Santa Casilda A1",
concesionario: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
coordenada_latitud_en_grados: "19.156446",
coordenada_longitud_en_grados: "-101.976099",
iave: "NO",
longitud_en_km: "20.000",
operador: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
tramo_de_cobro: "  Ent. Santa Casilda - Ent. Cuatro Caminos",
ubicaci_n_de_caseta_en_km: "  132+500"
},
{
autopista: "Uruapan - Nueva Italia",
caseta: "  Taretán",
concesionario: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
coordenada_latitud_en_grados: "19.355443",
coordenada_longitud_en_grados: "-101.917902",
iave: "SI",
longitud_en_km: "29.000",
operador: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
tramo_de_cobro: "  Ent. Zirimícuaro - Ent. Cajones",
ubicaci_n_de_caseta_en_km: "  102+200"
},
{
autopista: "Uruapan - Nueva Italia",
caseta: "  Taretán A1",
concesionario: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
coordenada_latitud_en_grados: "19.351874",
coordenada_longitud_en_grados: "-101.917368",
iave: "NO",
longitud_en_km: "8.000",
operador: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
tramo_de_cobro: "  Ent. Zirimícuaro - Taretán",
ubicaci_n_de_caseta_en_km: "  102+200"
},
{
autopista: "Uruapan - Nueva Italia",
caseta: "  Taretán A1",
concesionario: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
coordenada_latitud_en_grados: "19.351874",
coordenada_longitud_en_grados: "-101.917368",
iave: "NO",
longitud_en_km: "21.000",
operador: "CONCESIONARIA DE AUTOPISTAS DE MICHOACÁN S. A. DE C. V.",
tramo_de_cobro: "  Taretán - Ent. Cajones",
ubicaci_n_de_caseta_en_km: "  102+200"
},
{
autopista: "Yerbanís - Gómez Palacio",
caseta: "  Cuencamé III",
concesionario: "AUTOPISTAS DE CUOTA S. A. DE C. V.",
coordenada_latitud_en_grados: "24.981671",
coordenada_longitud_en_grados: "-103.73525",
iave: "SI",
longitud_en_km: "48.550",
operador: "AUTOPISTAS DE CUOTA S. A. DE C. V.",
tramo_de_cobro: "  Yerbanís - Pedriceña",
ubicaci_n_de_caseta_en_km: "  143+222"
},
{
autopista: "Yerbanís - Gómez Palacio",
caseta: "  Cuencamé III A2",
concesionario: "AUTOPISTAS DE CUOTA S. A. DE C. V.",
coordenada_latitud_en_grados: "24.980948",
coordenada_longitud_en_grados: "-103.736669",
iave: "SI",
longitud_en_km: "18.630",
operador: "AUTOPISTAS DE CUOTA S. A. DE C. V.",
tramo_de_cobro: "  Cuencamé - Pedriceña",
ubicaci_n_de_caseta_en_km: "  146+150/143+100"
},
{
autopista: "Yerbanís - Gómez Palacio",
caseta: "  Cuencamé III A1",
concesionario: "AUTOPISTAS DE CUOTA S. A. DE C. V.",
coordenada_latitud_en_grados: "24.980356",
coordenada_longitud_en_grados: "-103.734326",
iave: "SI",
longitud_en_km: "29.920",
operador: "AUTOPISTAS DE CUOTA S. A. DE C. V.",
tramo_de_cobro: "  Yerbanís - Cuencamé",
ubicaci_n_de_caseta_en_km: "  146+150/143+100"
},
{
autopista: "Yerbanís - Gómez Palacio",
caseta: "  León Guzmán A2",
concesionario: "AUTOPISTAS DE CUOTA S. A. DE C. V.",
coordenada_latitud_en_grados: "25.519483",
coordenada_longitud_en_grados: "-103.63969",
iave: "SI",
longitud_en_km: "16.970",
operador: "AUTOPISTAS DE CUOTA S. A. DE C. V.",
tramo_de_cobro: "  León Guzmán - Gómez Palacio",
ubicaci_n_de_caseta_en_km: "  212+659"
},
{
autopista: "Yerbanís - Gómez Palacio",
caseta: "  León Guzmán",
concesionario: "AUTOPISTAS DE CUOTA S. A. DE C. V.",
coordenada_latitud_en_grados: "25.520619",
coordenada_longitud_en_grados: "-103.639462",
iave: "SI",
longitud_en_km: "68.450",
operador: "AUTOPISTAS DE CUOTA S. A. DE C. V.",
tramo_de_cobro: "  Pedriceña - Gómez Palacio",
ubicaci_n_de_caseta_en_km: "  212+659"
},
{
autopista: "Yerbanís - Gómez Palacio",
caseta: "  León Guzmán A1",
concesionario: "AUTOPISTAS DE CUOTA S. A. DE C. V.",
coordenada_latitud_en_grados: "25.519463",
coordenada_longitud_en_grados: "-103.639408",
iave: "SI",
longitud_en_km: "51.480",
operador: "AUTOPISTAS DE CUOTA S. A. DE C. V.",
tramo_de_cobro: "  Pedirceña - León Guzmán",
ubicaci_n_de_caseta_en_km: "  212+500"
},
{
autopista: "Zacapalco - Rancho Viejo",
caseta: "  Zacapalco",
concesionario: "BANOBRAS FONADIN",
coordenada_latitud_en_grados: "18.537976",
coordenada_longitud_en_grados: "-99.447394",
iave: "SI",
longitud_en_km: "17.300",
operador: "CAPUFE",
tramo_de_cobro: "  Zacapalco - Rancho Viejo",
ubicaci_n_de_caseta_en_km: "  0+500"
},
{
autopista: "Zapotlanejo - Lagos de Moreno",
caseta: "  Jalostotitlán",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "21.117576",
coordenada_longitud_en_grados: "-102.458041",
iave: "SI",
longitud_en_km: "65.216",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Ent. Arandas - El Desperdicio",
ubicaci_n_de_caseta_en_km: "  90+800"
},
{
autopista: "Zapotlanejo - Lagos de Moreno",
caseta: "  Jalostotitlán",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "21.117576",
coordenada_longitud_en_grados: "-102.458041",
iave: "SI",
longitud_en_km: "37.516",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Ent. Arandas - Jalostotitlán",
ubicaci_n_de_caseta_en_km: "  90+800"
},
{
autopista: "Zapotlanejo - Lagos de Moreno",
caseta: "  Jalostotitlán A1",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "21.119064",
coordenada_longitud_en_grados: "-102.455793",
iave: "SI",
longitud_en_km: "27.700",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Jalostotitlán - El Desperdicio",
ubicaci_n_de_caseta_en_km: "  91+000"
},
{
autopista: "Zapotlanejo - Lagos de Moreno",
caseta: "  Jalostotitlán A2",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "21.120273",
coordenada_longitud_en_grados: "-102.455559",
iave: "SI",
longitud_en_km: "27.700",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  El Desperdicio - Jalostotitlán",
ubicaci_n_de_caseta_en_km: "  91+000"
},
{
autopista: "Zapotlanejo - Lagos de Moreno",
caseta: "  San Juan A1",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "21.224694",
coordenada_longitud_en_grados: "-102.313144",
iave: "NO",
longitud_en_km: "8.180",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Ent. San Juan de los Lagos - El Desperdicio",
ubicaci_n_de_caseta_en_km: "  110+400"
},
{
autopista: "Zapotlanejo - Lagos de Moreno",
caseta: " San Juan A2",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "21.225663",
coordenada_longitud_en_grados: "-102.313651",
iave: "NO",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: " El Desperdicio - Ent. San Juan de los Lagos",
ubicaci_n_de_caseta_en_km: "  110+400"
},
{
autopista: "Zapotlanejo - Lagos de Moreno",
caseta: "  Tepatitlán",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "20.824618",
coordenada_longitud_en_grados: "-102.794958",
iave: "SI",
longitud_en_km: "53.284",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Zapotlanejo - Ent. Arandas",
ubicaci_n_de_caseta_en_km: "  41+512"
},
{
autopista: "Zapotlanejo - Lagos de Moreno",
caseta: "  Tepatitlán",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "20.824618",
coordenada_longitud_en_grados: "-102.794958",
iave: "SI",
longitud_en_km: "11.772",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Tepatitlán - Ent. Arandas",
ubicaci_n_de_caseta_en_km: "  41+512"
},
{
autopista: "Zapotlanejo - Lagos de Moreno",
caseta: "  Tepatitlán Aux.",
concesionario: "RED DE AUTOPISTAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
coordenada_latitud_en_grados: "20.82091",
coordenada_longitud_en_grados: "-102.794064",
iave: "NO",
longitud_en_km: "41.512",
operador: "RED DE CARRETERAS DE OCCIDENTE S. A. P. I. B. DE C. V.",
tramo_de_cobro: "  Zapotlanejo - Tepatitlán",
ubicaci_n_de_caseta_en_km: "  41+512"
}
]



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
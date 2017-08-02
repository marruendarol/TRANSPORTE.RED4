/**********************************************************



***********************************************************/

var socket; 
var userRoom = "test";



$(document).ready(function() {
	socket = io('/transporte');
    mainC.initApp();
    ctrl_busqueda.initSocket();
});

var ctrl_busqueda = {
	lan : spanish,
	waiting : false,
	errors : [],
	toogle:false,
	selOrigen : 0,
	init : function(){
		ctrl_busqueda.render();
		ctrl_login.initSocket();
	},
	checkSession: function(){
       $.ajax({
            type: 'POST',
            data: {},
            url: '/user/session',
            dataType: 'JSON'
            }).done(function( response ) {
              console.log(response,"RESPUESTA ")
              if(response.status=="failed"){
                window.location="../"
              }else{
                if(response.data.type=="MEDICO"){
                	userRoom = response.data.userId;
                	ctrl_medico.userData = response.data;
                	console.log("GENERATED ROOM",userRoom,response.data)
                	ctrl_sync.init();
                	mainC.loadTInit(ctrl_medico.render,templateList)
                	ctrl_medico.initSocket();
                }
              }
            }).fail(function( response ) {
                console.log("response",response)
        }); 
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
    			ctrl_busqueda.render()
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

	render:function(){

		var items = [
			{origen:"San Miguel ",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre 14:00",carac:["2 Toneladas","Refrigerada"]},
			{origen:"Celaya",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre",carac:["2 Toneladas","Refrigerada"]},
			{origen:"Celaya",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre",carac:["2 Toneladas","Refrigerada"]},
			{origen:"Celaya",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre",carac:["2 Toneladas","Refrigerada"]},
			{origen:"Celaya",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre",carac:["2 Toneladas","Refrigerada"]},
			{origen:"Celaya",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre",carac:["2 Toneladas","Refrigerada"]},
			{origen:"Celaya",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre",carac:["2 Toneladas","Refrigerada"]},
			{origen:"Celaya",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre",carac:["2 Toneladas","Refrigerada"]},
			{origen:"Celaya",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre",carac:["2 Toneladas","Refrigerada"]},
		]


		var tipos = [
			{img:"/img/tipo_trailer.png",desc:"Carga pesada"},
			{img:"/img/tipo_camion.png",desc:"Camión"},
			{img:"/img/tipo_autobus.png",desc:"Autobus"},
			{img:"/img/tipo_camioneta.png",desc:"Camioneta"},
			{img:"/img/tipo_coche.png",desc:"Automovil"},	
		]

		var fechas = [
			{desc:10,mes:"NOV",dia:"Lunes",comp:"10/11/2016"},
			{desc:11,mes:"NOV",dia:"Martes",comp:"11/11/2016"},
			{desc:12,mes:"NOV",dia:"Miercoles",comp:"12/11/2016"},
			{desc:13,mes:"NOV",dia:"Jueves",comp:"13/11/2016"},
			{desc:14,mes:"NOV",dia:"Viernes",comp:"14/11/2016"},
			{desc:15,mes:"NOV",dia:"Sabado",comp:"15/11/2016"},
			{desc:16,mes:"NOV",dia:"Domingo",comp:"16/11/2016"},
		]

		ctrl_busqueda.mainR = template.render('#busquedaT','#content',	{lan	: ctrl_busqueda.lan,
															toogle:ctrl_busqueda.toogle,
															items:items,
															fechaSel : 0,
															fechas : fechas,
															tipos : tipos,
															tipoSel : 0,
															strOrigen : "Celaya, Guanajuato",
															strDestino : "Monterrey, Nuevo León",
														 	data:{strOrigen:""}
														}
									);


	

		ctrl_busqueda.mainR.on('openLogin',function(){

			var html = '<h2>login</h2>'
			createModal(html)

		})

		ctrl_busqueda.mainR.on('tipoClick',function(event){
			console.log(event.context.num)
			ctrl_busqueda.mainR.set('tipoSel',event.context.num)
		});


		ctrl_busqueda.mainR.on('selOrigen',function(event){
			console.log("origen")
			$('#iDestino').focus();
		});


		ctrl_busqueda.mainR.on('selDestino',function(event){
			console.log('destino')
		});


		var startSlider = document.getElementById('slide1');
		var slider = noUiSlider.create(startSlider, {
			start: [40],
			range: {
				'min': [ 0 ],
				'max': [ 50 ]
			},
			//tooltips: true,
		});	


		gGeo.initAuto();

	
		ctrl_busqueda.userOptions();
		ctrl_busqueda.fechaOptions();

	},
	 userOptions : function(){
    	
    	var that = this;
    	$('.baseoptions').each(function(item,obj) { // Notice the .each() loop, discussed below
		var item = obj.id;
	    $(this).qtip({
	        content: {
	            text: $(this).next('div'),
	            //button : true
	        },
	        show : {
	        	event : 'click',
	        	solo : true

	        },
			hide: { event : 'unfocus click',
				fixed: true,
	    	},
	    	style: {
	      		classes: 'qtip-light qtip-shadow qtip-rounded qtip-pop',
	      		tip :  {
	      			offset : 10,
	      			corner: true,
            		width: 20,
            		height: 20
	      		}
	   		},
	   		position: {
	          		my : 'top right',
	        		at: 'bottom center', 
	           
	        },
	   		events : {
	   			show : function(event,api){
	   				that.active = true;
	   				$('#' + item).addClass('activeMenu');
	   				that.hoverOn =  item;
	   			},
	   			hide : function(event,api){
	   				that.active = false;
	   				$('#' + item).removeClass('activeMenu')
	   				//$('#'+item).css({opacity:0})
	   				that.hoverOn = ""; 
	   			}
	   		}
	    	});
		});

	},
	fechaOptions : function(){
		var that = this;
    	$('.fechaOptions').each(function(item,obj) { // Notice the .each() loop, discussed below
		var item = obj.id;
	    $(this).qtip({
	        content: {
	            text: $(this).next('div'),
	            //button : true
	        },
	        show : {
	        	event : 'click',
	        	solo : true

	        },
			hide: { event : 'unfocus click',
				fixed: true,
	    	},
	    	style: {
	      		classes: 'qtip-light qtip-shadow qtip-rounded ',
	      		tip : {
	      			
	      			corner: true,
            		width: 20,
            		height: 20
	      		}


	   		},
	   		position: {
	          		my : 'top center',
	        		at: 'bottom center', 
	           
	        },
	   		events : {
	   			show : function(event,api){
	   				that.active = true;
	   				$('#' + item).addClass('activeMenu');
	   				that.hoverOn =  item;
	   			},
	   			hide : function(event,api){
	   				that.active = false;
	   				$('#' + item).removeClass('activeMenu')
	   				//$('#'+item).css({opacity:0})
	   				that.hoverOn = ""; 
	   			}
	   		},

	    	});
		});

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
            ctrl_busqueda.selOrigen =  {
            	tipo : "origen",
            	nombre : place.formatted_address,
            	lat : place.geometry.location.lat(),
            	lng : place.geometry.location.lng(),
            }

                console.log(ctrl_busqueda.selOrigen,"PLACES")
        });

        selectFirstOnEnter(document.getElementById('iOrigen'));



		//-----------------------------------------------------

		gGeo.inputBox2 = $('#iDestino');
		var input = (document.getElementById('iDestino'));
		var searchBox2 =  new google.maps.places.Autocomplete(input,options);

		google.maps.event.addListener(searchBox2, 'place_changed', function () {
            var place = searchBox2.getPlace()
            ctrl_busqueda.selDestino =  {
            	tipo : "destino",
            	nombre : place.formatted_address,
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
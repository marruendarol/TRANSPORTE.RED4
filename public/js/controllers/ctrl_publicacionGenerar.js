/**********************************************************

GENERAR PUBLICACION



Descuento
Hora Limite 
Tipo de Publicación


***********************************************************/

var ctrl_pubGen = {
	init : function(info){
		console.log(info,"info")
		ctrl_pubGen.info = info;
		ctrl_pubGen.render();
		
	},
	render:function(){

		var diaHoy = new Date();
		var plus = 14;
		var diaHoyPlus = diaHoy.addDays(plus);

		ctrl_pubGen.daysR = ctrl_pubGen.genRange(new Date(),14)

		ctrl_pubGen.setRangeDates(diaHoy, diaHoy.addDays(14))

		var data = {daysR : ctrl_pubGen.daysR};
	
		ctrl_pubGen.mainR = template.render('#pubContT','#publicacion',	{data:data,
			info : ctrl_pubGen.info,
			horasMax : 12,
			minMaxn : 00,
			display:false,tab1:true,tab2:false});

		ctrl_pubGen.mainR.on('dayClick',function(e){
			var curr = e.context.tipo
			curr = !curr;
			this.set(e.keypath+'.tipo',curr);
			
		});

		 ctrl_pubGen.mainR.on('cancel', function() {
	                $('.qtip-modal').qtip('hide');
	            });


		 ctrl_pubGen.mainR.on('savePublicacion', function() {
	               ctrl_pubGen.savePublicacion(); 
	            });

		ctrl_pubGen.mainR.on('ref',function(e){
			var currV = ctrl_pubGen.mainR.get('display');

			currV = !currV
			console.log(currV)
			ctrl_pubGen.mainR.set('display', currV);
			
		});

		// EMPRESA INFO
			if(ctrl_app.session.userInfo.logotipo[0]!=undefined){
			ctrl_pubGen.mainR.set('info.logotipo',ctrl_app.session.userInfo.logotipo[0].thumbnailUrl);
			}
			if(ctrl_app.session.userInfo.razonsocial!=undefined){
			ctrl_pubGen.mainR.set('info.razonsocial',ctrl_app.session.userInfo.razonsocial);
			}
		// DEFAULT TIPO 1 
		ctrl_pubGen.mainR.set('info.tipoPub',1);
		ctrl_pubGen.mainR.set('info.origen',ctrl_pubGen.info.sucursalLoc);


		ctrl_pubGen.mainR.on('tab1',function(e){
			ctrl_pubGen.mainR.set('tab1',true);
			ctrl_pubGen.mainR.set('tab2',false);
			ctrl_pubGen.mainR.set('info.tipoPub',1);
			ctrl_pubGen.setRangeDates(diaHoy, diaHoy.addDays(7));
			ctrl_pubGen.mainR.set('data.daysR',ctrl_pubGen.daysR);

			// Set Origen to base origin
			ctrl_pubGen.mainR.set('info.origen',ctrl_pubGen.info.sucursalLoc);

		});

		ctrl_pubGen.mainR.on('tab2',function(e){
			ctrl_pubGen.mainR.set('tab2',true);
			ctrl_pubGen.mainR.set('tab1',false);
			ctrl_pubGen.mainR.set('info.tipoPub',2);
			ctrl_pubGen.setRangeDates(diaHoy, diaHoy.addDays(1))
			ctrl_pubGen.mainR.set('data.daysR',ctrl_pubGen.daysR)
			gGeoPub.initAuto();
		});


		var startSlider3 = document.getElementById('slideOferta');
		var slider3 = noUiSlider.create(startSlider3, {
				start: [ctrl_pubGen.info.percGanancia],
				behaviour: 'tap',
				connect: "upper",
				range: {
					'min': [ 0 ],
					'max': [ ctrl_pubGen.info.percGanancia]
				},
				//tooltips: true,
			});
		slider3.on('update', function(e){
				ctrl_pubGen.mainR.set('info.ofertaPerc',Math.round(e[0]))
				ctrl_pubGen.mainR.set('info.totalDesc',ctrl_pubGen.info.percGanancia - Math.round(e[0]))
				
					});


		var startSlider2 = document.getElementById('slideOferta2');
		var slider2= noUiSlider.create(startSlider2, {
				start: [ ctrl_pubGen.info.percGanancia ],
				behaviour: 'tap',
				connect: "upper",
				range: {
					'min': [ 0 ],
					'max': [ ctrl_pubGen.info.percGanancia ]
				},
				//tooltips: true,
			});
		slider2.on('update', function(e){
				ctrl_pubGen.mainR.set('info.ofertaPerc',Math.round(e[0]))
				ctrl_pubGen.mainR.set('info.totalDesc',ctrl_pubGen.info.percGanancia - Math.round(e[0]))
					});
			//var curr = e.context.tipo


			var startHoras = document.getElementById('slideHora');
			var sliderHoras= noUiSlider.create(startHoras, {
				start: [new Date().getHours()],
				behaviour: 'tap',
				connect: "upper",
				range: {
					'min': [ 0 ],
					'max': [ 23 ]
				},
				//tooltips: true,
			});
			sliderHoras.on('update', function(e){
				ctrl_pubGen.mainR.set('info.horasMax',Math.round(e[0]))
					});


			var startMin = document.getElementById('slideMinutos');
			var sliderMin= noUiSlider.create(startMin, {
				start: [new Date().getMinutes()],
				behaviour: 'tap',
				range: {
					'min': [ 0 ],
					'max': [ 59 ]
				},
				//tooltips: true,
			});
			sliderMin.on('update', function(e){
				ctrl_pubGen.mainR.set('info.minMax',Math.round(e[0]))
					});


		

	},
	setRangeDates:function(di,df) {
		for (var i = 0; i < ctrl_pubGen.daysR.length; i++) {
			if(ctrl_pubGen.daysR[i].date<df){
				ctrl_pubGen.daysR[i].tipo = true;
			}else{
				ctrl_pubGen.daysR[i].tipo = false;
			}
		}
	},


	genRange :function(iniD,days){
		var daysOn = [];
		var dOn = iniD;
		for (var i = 0; i < days; i++) {
			var diaName = ctrl_pubGen.diaCompleto(dOn);
			var numDia = dOn.getDate();
			var abrMes = ctrl_pubGen.mesAbr(dOn)
			daysOn.push({dia:diaName,numDia:numDia,abrMes:abrMes,date:new Date(dOn)})
			dOn = dOn.addDays(1)
		}

		return daysOn;
	},

	diaCompleto : function(date){
		var weekDay = [
			"Domingo",
			"Lunes",
			"Martes",
			"Miercoles",
			"Jueves",
			"Viernes",
			"Sabado"
		]
		return weekDay[date.getDay()];
	},
	mesAbr : function(date){
		var mesA = [
			"ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"
		]
		return mesA[date.getMonth()];
	},
	savePublicacion : function(){


		var data = {
			info : ctrl_pubGen.info,
			tipo : ctrl_pubGen.tipo,
			fechas : ctrl_pubGen.mainR.get('data.daysR'),


		}
		dbC.query("/publicacion/save","POST",{data:data},ctrl_pubGen.saveRet)
	},
	saveRet : function(){
		console.log("publicacion salvada")
		$('.qtip-modal').qtip('hide');
		createGrowl("Group info","Unidad publicada con éxito.",false,'bg_ok','guardando');
		ctrl_unidades.refresh();
	}

	
}



Date.prototype.addDays = function(days)
{
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}




//--------------------------------------------------------  GEO --------------------------------------------------
var gGeoPub = {
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
		gGeoPub.bounds = new google.maps.LatLngBounds();
		gGeoPub.initMap();
	},

	initMap: function(){

		var latLng = new google.maps.LatLng(gGeoPub.defaultLat, gGeoPub.defaultLng)

		var mapOptions = {
			center : latLng,
			zoom : 16,
			mapTypeId : google.maps.MapTypeId.ROADMAP
		}

		 gGeoPub.map = new google.maps.Map(document.getElementById('ubica'),mapOptions)

		/* var markerImage = new google.maps.MarkerImage('/img/8B1D1B.png',
                new google.maps.Size(51, 43),
                new google.maps.Point(5, 0),
                new google.maps.Point(0, 0));

		gGeoPub.userMarker = new google.maps.Marker({
	      position: latLng,
	      map: gGeoPub.map,
	      title: 'tu ubicación',
	       draggable:true,
	    //  icon: markerImage
	  }); 

		google.maps.event.addListener(gGeoPub.userMarker,'dragend', function(event) {
			var loc = gGeoPub.userMarker.getPosition()
			gGeoPub.lat = loc.lat()
			gGeoPub.lng = loc.lng()
		    gGeoPub.setLocation(loc.lat(),loc.lng())
		    // Reverse Geo coding
		    gGeoPub.codeLatLng(gGeoPub.lat,gGeoPub.lng)
		  });

		  */ 

		//marker.setMap(gGeoPub.map);
		//gGeoPub.bounds.extend(gGeoPub.userMarker.position);

		gGeoPub.initAuto();
		gGeoPub.geoInit();

	},
	initAuto : function(){

		options = {
      language: 'es-MX',
      types: ['(cities)'],
      componentRestrictions: { country: "mx" }
    }

    	console.log("buscando seachbox")

		gGeoPub.inputBox1 = $('#iOrigen');
		var input = (document.getElementById('iOrigen'));
		var searchBox =  new google.maps.places.Autocomplete(input,options);

		google.maps.event.addListener(searchBox, 'place_changed', function () {
            var place = searchBox.getPlace()
            console.log(place)
            ctrl_pubGen.selOrigen =  {
            	tipo : "origen",
            	nombre : place.formatted_address,
            	loc: [place.geometry.location.lat(),place.geometry.location.lng()],
            	place_id : place.place_id
            }
            	ctrl_pubGen.mainR.set('info.origen',ctrl_pubGen.selOrigen);
                console.log(ctrl_pubGen.selOrigen,"PLACES")
        });

        selectFirstOnEnter(document.getElementById('iOrigen'));



		//-----------------------------------------------------

		gGeoPub.inputBox2 = $('#iDestino');
		var input = (document.getElementById('iDestino'));
		var searchBox2 =  new google.maps.places.Autocomplete(input,options);

		google.maps.event.addListener(searchBox2, 'place_changed', function () {
            var place = searchBox2.getPlace()
            
            console.log(place,"PLACEDESTINO")
            ctrl_pubGen.selDestino =  {
            	tipo : "destino",
            	nombre : place.formatted_address,
            	loc: [place.geometry.location.lng(),place.geometry.location.lat()],
            	place_id : place.place_id
            }

            ctrl_pubGen.mainR.set('info.destino',ctrl_pubGen.selDestino);
        });

         selectFirstOnEnter(document.getElementById('iDestino'));

        //-----------------------------------------------------


	},
	geoInit : function(){

		//gGeoPub.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

		// Zoom after Bounds
		google.maps.event.addListener(gGeoPub.map, 'bounds_changed', function(event) {
			  if (gGeoPub.map.getZoom() > 18) {
			    gGeoPub.map.setZoom(18);
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
	    gGeoPub.setMapCookies();

		gGeoPub.map.panTo(new google.maps.LatLng( lat, lng) )
		gGeoPub.userMarker.setPosition( new google.maps.LatLng( lat, lng ) );
		$('#lat').val(lat)
		$('#lng').val(lng)

		ctrl_web.getLoc(ctrl_web.locationChange);

	},
	setMapCookies : function(){
		console.log("setting map cookies")
		var d = new Date();
   		d.setTime(d.getTime() + (1*24*60*60*1000));
    	document.cookie="lat="+ gGeoPub.lat +";expires="+d.toUTCString();
    	document.cookie="lng="+ gGeoPub.lng +";expires="+d.toUTCString();
    	document.cookie="direccion="+ gGeoPub.direccion +";expires="+d.toUTCString();
	},
	fitBounds: function(){
		var bounds = new L.LatLngBounds(gGeoPub.userMarker);
		gGeoPub.map.fitBounds(bounds);
	},
	clearPins : function(){
		 for(i=0;i<gGeoPub.marker.length;i++) {
		 	gGeoPub.marker[i].setMap(null)
		 	}
		    gGeoPub.marker = [];

		    // Clear Polylines
		    for (i=0; i<gGeoPub.line.length; i++) 
			{                           
			  gGeoPub.line[i].setMap(null); //or line[i].setVisible(false);
			}
	},
	addRoute : function(route){

		gGeoPub.clearPins();

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
				    map: gGeoPub.map
				});
				gGeoPub.line.push(line);
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

			var htmlMarker = gGeoPub.renderMarker(data[r])


			var Marker  = new RichMarker({
			      position: latLng,
			      map: gGeoPub.map,
			      content: htmlMarker,
			      shadow: 'none'
			      //icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
			  });
			
        	gGeoPub.marker.push(Marker); 
		}

		var allMarkers = gGeoPub.marker.slice()
		//allMarkers.push(gGeoPub.userMarker)
		gGeoPub.map.fitBounds(allMarkers.reduce(function(bounds, marker) {
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
	      gGeoPub.lat =  position.coords.latitude
	      gGeoPub.lng =  position.coords.longitude
	      gGeoPub.setLocation(gGeoPub.lat,gGeoPub.lng)
	      gGeoPub.codeLatLng(gGeoPub.lat,gGeoPub.lng)
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
        gGeoPub.startGeo = new Date().getTime();
        var timeOn = (Math.abs(gGeoPub.finalGeo - gGeoPub.startGeo))
        if(!timeOn || timeOn>2000){
            gGeoPub.initLatLng(lat, lng);    
        } else {
            //gGeoPub.userLocation.bindPopup('<div id="loaderGeo"><img src="../images/gif-load.gif" style="text-align:center;width:20px;height:20px;"></div>').openPopup();
            clearTimeout(gGeoPub.geoTimer);
            gGeoPub.geoTimer=setTimeout(function(){ gGeoPub.initLatLng(lat, lng)},2000);
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
                   gGeoPub.dirParts = {
                   		numero 	: parts[0].long_name,
                   		calle	: parts[1].long_name,
                   		colonia : parts[2].long_name,
                   		ciudad  : parts[3].long_name,
                   		estado 	: parts[4].long_name,
                   		pais 	: parts[5].long_name,
                   		cp 		: parts[6].long_name,
                   }
                 gGeoPub.inputBox.val(results[0].formatted_address);
                 gGeoPub.setMapCookies();
                 gGeoPub.finalGeo = new Date().getTime();
                 // if(profileImage){
                //  gGeoPub.userLocation.bindPopup('<img id="fotito2" class=\"fb-photo img-polaroid\" src=\"https://' + profileImage  + '\">').openPopup();
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
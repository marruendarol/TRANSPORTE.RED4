
var gGeoMS = {
	zoom : 12,
	defaultPin : "D76627",
	direccion : "",
	dirParts : {},
	startGeo : {},
	finalGeo : {},
	geoTimer : {},
	inputBox : {},
	lat :20.530691, 
	lng :-100.810774,
	map  : {},
	userLocation : {},
	userMarker: {},
	marker : [],
	bounds : {},
	directionsService  : {},
	directionsDisplay  : {},	
	finalAddr : {},
	id : "",
	init : function(id,lat,lng,callback){
		gGeoMS.callback = callback;
		gGeoMS.id = id;
		gGeoMS.bounds = new google.maps.LatLngBounds();
		gGeoMS.initMap(lat,lng);

		$('#addrSave').addClass('disabled');
		
	},
	initMap: function(lat,lng){
		var lat2 = lat;
		var lng2 = lng;
		if(lat==undefined ){
			lat2 = gGeoMS.lat;
			lng2 = gGeoMS.lng;
		}
		var latLng = new google.maps.LatLng(lat2, lng2)

		var mapOptions = {
			center : latLng,
			zoom : 16,
			mapTypeId : google.maps.MapTypeId.ROADMAP
		}

		 gGeoMS.map = new google.maps.Map(document.getElementById('ubica_'+ gGeoMS.id),mapOptions)
		 var markerImage = new google.maps.MarkerImage('/img/8B1D1B.png',
                new google.maps.Size(51, 43),
                new google.maps.Point(5, 0),
                new google.maps.Point(0, 0));

		gGeoMS.userMarker = new google.maps.Marker({
	      position: latLng,
	      map: gGeoMS.map,
	      title: 'ubicación',
	       draggable:true,
	    //  icon: markerImage
	  });

		google.maps.event.addListener(gGeoMS.userMarker,'dragend', function(event) {
			var loc = gGeoMS.userMarker.getPosition()
			gGeoMS.lat = loc.lat()
			gGeoMS.lng = loc.lng()
		    gGeoMS.setLocation(loc.lat(),loc.lng())
		    // Reverse Geo coding
		    gGeoMS.codeLatLng(gGeoMS.lat,gGeoMS.lng)
		  });

		gGeoMS.bounds.extend(gGeoMS.userMarker.position);
		gGeoMS.geoInit();

	},
	geoInit : function(){

		gGeoMS.inputBox = $('#pac-input_'+gGeoMS.id);
		var input = (document.getElementById('pac-input_'+gGeoMS.id));
		searchBox =  new google.maps.places.SearchBox(input);


		console.log("incializando input")
		//gGeoMS.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

		gGeoMS.directionsService = new google.maps.DirectionsService();
    	gGeoMS.directionsDisplay = new google.maps.DirectionsRenderer();
		gGeoMS.directionsDisplay.setPanel(document.getElementById('directions-panel'));

		// Zoom after Bounds
		google.maps.event.addListener(gGeoMS.map, 'bounds_changed', function(event) {
			  if (gGeoMS.map.getZoom() > 18) {
			    gGeoMS.map.setZoom(18);
			  }
			});

	    google.maps.event.addListener(searchBox, 'places_changed', function () {
	
            var places = searchBox.getPlaces();
                if (places.length==0) {
                    alert("No se encontró la dirección")
                    $('#addrSave').addClass('disabled');
                    return;
                }
                
                console.log(places,"PLACES")



                if(places[0].geometry.location.lat()!=undefined){
	                	gGeoMS.lat = places[0].geometry.location.lat();
	                	gGeoMS.lng = places[0].geometry.location.lng();

	                	gGeoMS.initLatLng(places[0].geometry.location.lat(),places[0].geometry.location.lng()) 
	                	gGeoMS.direccion = input.value;
	                	gGeoMS.setLocation(places[0].geometry.location.lat(),places[0].geometry.location.lng());

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

	    //gGeoMS.setMapCookies();
		gGeoMS.map.panTo(new google.maps.LatLng( lat, lng) )
		gGeoMS.userMarker.setPosition( new google.maps.LatLng( lat, lng ) );
		$('#lat').val(lat)
		$('#lng').val(lng)


	},
	setMapCookies : function(){
		console.log("setting map cookies")
		var d = new Date();
   		d.setTime(d.getTime() + (1*24*60*60*1000));
    	document.cookie="lat="+ gGeoMS.lat +";expires="+d.toUTCString();
    	document.cookie="lng="+ gGeoMS.lng +";expires="+d.toUTCString();
    	document.cookie="direccion="+ gGeoMS.direccion +";expires="+d.toUTCString();
	},
	fitBounds: function(){
		var bounds = new L.LatLngBounds(gGeoMS.userMarker);
		gGeoMS.map.fitBounds(bounds);
	},
	clearPins : function(){
		 for(i=0;i<gGeoMS.marker.length;i++) {
		 	gGeoMS.marker[i].setMap(null)
		 	}
		    gGeoMS.marker = [];
	},
	addPins : function(data){

		gGeoMS.clearPins();
		for (var r = 0; r < data.length; r++) {	
			var latLng = new google.maps.LatLng(data[r].loc[0],data[r].loc[1])

			var htmlMarker = ctrl_consulM.renderMarker(data[r])

			var Marker  = new RichMarker({
			      position: latLng,
			      map: gGeoMS.map,
			      content: htmlMarker,
			      shadow: 'none',
			      //icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
			  });
			
        	gGeoMS.marker.push(Marker); 
		}

		var allMarkers = gGeoMS.marker.slice()
		allMarkers.push(gGeoMS.userMarker)
		gGeoMS.map.fitBounds(allMarkers.reduce(function(bounds, marker) {
		    return bounds.extend(marker.getPosition());
		}, new google.maps.LatLngBounds()));


	},	
	myLocation : function(callback){
		if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(function(position) {
	      gGeoMS.lat =  position.coords.latitude
	      gGeoMS.lng =  position.coords.longitude
	      gGeoMS.setLocation(gGeoMS.lat,gGeoMS.lng)
	      gGeoMS.codeLatLng(gGeoMS.lat,gGeoMS.lng)
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
        gGeoMS.startGeo = new Date().getTime();
        var timeOn = (Math.abs(gGeoMS.finalGeo - gGeoMS.startGeo))
        if(!timeOn || timeOn>2000){
            gGeoMS.initLatLng(lat, lng);    
        } else {
            //gGeoMS.userLocation.bindPopup('<div id="loaderGeo"><img src="../images/gif-load.gif" style="text-align:center;width:20px;height:20px;"></div>').openPopup();
            clearTimeout(gGeoMS.geoTimer);
            gGeoMS.geoTimer=setTimeout(function(){ gGeoMS.initLatLng(lat, lng)},2000);
        }
    },
    initLatLng : function(lat, lng) {
        var geocoder;
        geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(lat, lng);
        geocoder.geocode({'latLng': latlng}, function(results, status) {
        	console.log(results,"GEO")
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                var parts = results[0].address_components
                console.log ("parts",parts)

                if(parts[5]==undefined || parts[6]==undefined || parts[7]==undefined){
                	alert("Dirección inválida, por favor escriba una dirección válida y con número.")
                }
                   gGeoMS.dirParts = {
                   		numero 	: parts[0].long_name || "",
                   		calle	: parts[1].long_name || "",
                   		colonia : parts[2].long_name || "",
                   		ciudad  : parts[3].long_name || "",
                   		estado 	: parts[5].long_name || "",
                   		pais 	: parts[6].long_name || "",
                   		cp 		: parts[7].long_name || "",
                   		coords 	: [lng,lat],
                   		formatAddr : results[0].formatted_address,
                   		place_id : results[0].place_id,
                   		id: utils.generateUUID(),
                   		interior : $('#interiorMapa').val()
                   		
                   }

                   $('#addrSave').removeClass('disabled');

                
                   gGeoMS.finalAddr = gGeoMS.dirParts;

                   gGeoMS.callback.set('data',gGeoMS.finalAddr)
                   
                 // ctrl_consulM.setFields(gGeoMS.dirParts)

                 gGeoMS.inputBox.val(results[0].formatted_address);
                 gGeoMS.finalGeo = new Date().getTime();
              
                } else {
                   console.log('No results found');
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    }
}


function staticImage(callback){
	var currentPosition = gGeoMS.map.getCenter();
	var url = "http://maps.google.com/maps/api/staticmap?sensor=false&center=" +
	    gGeoMS.lat + "," + gGeoMS.lng +
	    "&zoom=16&size=300x150&markers=color:blue|label:X|" +
	    gGeoMS.lat + ',' + gGeoMS.lng + '&key=AIzaSyBJhcLGFh_sRflxym9x31pf1Z6yx9z0HNc';

	var c = document.getElementById("canvas");
	var ctx = c.getContext("2d");
	var img = new Image();
	img.setAttribute('crossOrigin', 'anonymous');
	img.src = url;
	img.onload = function() {
	    ctx.drawImage(img, 0, 0);

	    var src = document.getElementById("output").src = canvas.toDataURL("image/png");
	    gGeoMS.finalAddr.url = src
	    callback(src)
	}
}


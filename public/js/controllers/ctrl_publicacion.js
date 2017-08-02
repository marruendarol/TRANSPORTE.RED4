/**********************************************************

PRODUCT ITEM

**********************************************************/

$(document).ready(function() {
    mainC.initApp();
    ctrl_login.ctrlCallBack = ctrl_pub;
    ctrl_pub.init();
});

var ctrl_pub = {
	waiting : false,
	errors : [],
	toogle:false,
	selOrigen : 0,
	init : function(){
		ctrl_pub.getRoute();
	},
    getRoute : function(){	
    	var r= new URI().path();
    	r = r.split('/')   	
    	ctrl_pub.pubId = r[2];

    	ctrl_pub.params = utils.getURLparams()
    	
    	ctrl_pub.getInfo();

    },
    getInfo : function(infoLogin){
    	console.log(infoLogin)
    	

    	ctrl_pub.params.id = ctrl_pub.pubId;

    	dbC.query('/busqueda/pub',"POST",ctrl_pub.params,ctrl_pub.render)
    },
    getSess : function(){
    	
    	ctrl_login.checkSession(ctrl_pub.updateSess);
    },
    updateSess : function(infoLogin){

    	ctrl_pub.infoLogin = infoLogin
    	ctrl_pub.renderLogin(infoLogin);
    },
    reservaRet : function(res){
    	window.location = "/reservar/" + res.uid ;
    },
    renderConsulta : function(){
    	ctrl_pub.mainR = template.render('#preciosDiv','#consulta',{
															
														});
    },
    getMsgs : function(){
    	var params = {tipo:"PREGUNTA_PUBLICACION",extID:ctrl_pub.pubId}
    	dbC.query('/msgCenter/readMsgs',"POST",params,ctrl_pub.msgsRet)
    },
    msgsRet : function(response){
    	ctrl_pub.mainR.set('msgs',response.msgs)
    },
	render:function(res){

		ctrl_pub.res = res;
		res.contratados = [];

		var pDate = ctrl_pub.params.fecha;

		var year =  pDate.slice(0,4);
		var month = pDate.slice(4,6);
		var day =  pDate.slice(6,8);

		var dOn =  new Date(year,month-1,day); 
		console.log(dOn)
		var diaName = ctrl_pub.diaCompleto(dOn).toUpperCase();
		var numDia = dOn.getDate();
		var abrMes = ctrl_pub.mesAbr(dOn)
		var comp = utils.pad(dOn.getDate())+ "/" + abrMes + "/" + dOn.getFullYear();
		daysOn = {dia:diaName,numDia:numDia,abrMes:abrMes,date:dOn,comp:comp,year:year}


		console.log(res,"res")

		if(res.publicacion.msgs!=undefined){
			res.publicacion.msgs.sortBy('conversationId');	
		}
		

		ctrl_pub.mainR = template.render('#publicacionT','#content',{
															pubModel : res,
															daysOn : daysOn,
															options : [
																{text:"Cualquier horario",val:1},
																{text:"Rango de Horario",val:2},
																
															],
															ophor : 1
														});


		// Autosize

		autosize($(".preguntaArea"));

		ctrl_pub.mainR.set('txtBt',"Reservar")
		ctrl_pub.mainR.set('txtConsultaBt',"Consultar transportista")

		ctrl_pub.getMsgs();


		ctrl_pub.mainR.on('consultar',function(e){
			

		if(ctrl_pub.infoLogin.status!='failed'){

			var body = ctrl_pub.mainR.get('comentarioCarga');


			if(body.length>3){
    			ctrl_pub.mainR.set('txtConsultaBt', '<img src="/img/default2.svg" class="loaderGif">')

				ctrl_pub.mainR.set('btDis','btDis');


			//var params = {pubModel: ctrl_pub.mainR.get('pubModel'),daysOn : daysOn}
			//dbC.query('/reserva/save',"POST",params,ctrl_pub.reservaRet)

			var infoPub = {
				id : ctrl_pub.params.id,
				fecha : daysOn,
				url : window.location.href,
			}

			

			var params = {idPub:ctrl_pub.pubId,descTipo:"Pregunta Publicación",tipo:"PREGUNTA_PUBLICACION",msg:{tipo:"USER",body:body}}
			params.msg.destUsr = [ctrl_pub.res.publicacion.user];
			params.msg.destMsg = [ctrl_pub.res.publicacion.userId];
			params.msg.info = infoPub
			ctrl_pub.mainR.push('msgs',params)


			
				dbC.query('/msgcenter/addMsg',"POST",params,ctrl_pub.msgRet);	
				$(".preguntaArea").val('');

			}else{
				$(".preguntaArea").focus();
			}

			

    	}else{
    		ctrl_pub.loginOpen("Para enviar preguntas al transportista necesita tener una sesión activa en transporte.red");
    	}
			

		});	



		ctrl_pub.mainR.on('reservar',function(e){



			if(ctrl_pub.infoLogin.status!='failed'){
			
			ctrl_pub.mainR.set('txtBt', '<img src="/img/default2.svg" class="loaderGif">')

			ctrl_pub.mainR.set('btDis','btDis');

			var params = {pubModel: ctrl_pub.mainR.get('pubModel'),daysOn : daysOn}
			dbC.query('/reserva/save',"POST",params,ctrl_pub.reservaRet)}

			else{
				ctrl_pub.loginOpen("Para reservar la unidad necesita tener una sesión activa en transporte.red");
			}

		});	


		//-------------------------------------------------------------
		 ctrl_pub.mainR.on('addAddr',function(){

		 	console.log("adding addrs")

		      ctrl_pub.modal = template.render('#mapaT', '#modal', {id:1,data:{}});
		      
		            createModal($('#mapa'))
		            gGeoMS.init(1,20.530691,-100.810774,ctrl_pub.modal);

		            ctrl_pub.modal.on('saveAddr', function(event) {
		                
		                staticImage(function(){
		                     $('.qtip-modal').qtip('hide');
		                      ctrl_pub.mainR.push('data.direccion',gGeoMS.finalAddr);
		                })
		                 
		                

		            })

		            ctrl_pub.modal.on('cancel', function() {
		                $('.qtip-modal').qtip('hide');
		            })

		 });

		 ctrl_pub.mainR.on('deleteAddr',function(event){

          var dirs = ctrl_pub.mainR.get('data.direccion')
            for (var i = 0; i < dirs.length; i++) {
              if(dirs[i].id==event.context.id){
                ctrl_pub.mainR.splice('data.direccion',i,1);
              }
            }
        });


		 //-------------------------------------------------------------------------------


		ctrl_pub.mainR.on('addS',function(e){

			var exist = ctrl_pub.mainR.get('pubModel.contratados');
			var id;
			for (var i = 0; i < exist.length; i++) {
				if(exist[i].id==e.context.id){
					id = i;
					var item = exist[i];
				}
			}

			if(item!=undefined){
				item.count ++;
				item.total =  parseFloat(item.val) * item.count;
				ctrl_pub.mainR.set('pubModel.contratados['+ id +']',item)
			}else{
				e.context.count = 1 ;
				e.context.total = parseFloat(e.context.val);
				ctrl_pub.mainR.push('pubModel.contratados',e.context);	
			}
			
			//ctrl_pub.mainR.splice('pubModel.publicacion.info.servicios',e.index.num,1);
			ctrl_pub.recalcular();
		})

		ctrl_pub.mainR.on('subS',function(e){

			var exist = ctrl_pub.mainR.get('pubModel.contratados');
			var item = JSON.search(exist,"//*[id='"+ e.context.id +"']")
			if(item.length>0){
				item[0].count--;
				if(item[0].count>0){
					item[0].total =  parseFloat(item[0].val) * item[0].count;
					ctrl_pub.mainR.set('pubModel.contratados',exist)
				}else{
					ctrl_pub.mainR.splice('pubModel.contratados',e.index.num,1);
				}
			}
			//ctrl_pub.mainR.splice('pubModel.contratados',e.index.num,1);
			//ctrl_pub.mainR.push('pubModel.publicacion.info.servicios',e.context);
			
			ctrl_pub.recalcular();
		});

		 ctrl_pub.mainR.on('retHome',function(){
	    	window.location = "/home2";
	    })


		ctrl_pub.mainR.on('removerAdicional',function(e){
			var exist = ctrl_pub.mainR.get('pubModel.contratados');
			var id;
			for (var i = 0; i < exist.length; i++) {
				if(exist[i].id==e.context.id){
					id = i;
					var item = exist[i];
				}
			}
			ctrl_pub.mainR.splice('pubModel.contratados',id,1);
			ctrl_pub.recalcular();
		});


		ctrl_pub.mainR.on('openLogin',function(){
			var html = '<h2>login</h2>'
			createModal(html);
		})

		ctrl_pub.mainR.on('tipoClick',function(event){
			console.log(event.context.num)
			ctrl_pub.mainR.set('tipoSel',event.context.num)
		});


		ctrl_pub.mainR.on('masInfo',function(e){
			var mas = this.get('masinfo');
			mas = !mas
			this.set('masinfo',mas)
			gGeo.init();
			var or = {lat:res.ruta.origenlat,lng:res.ruta.origenlng};
			or.tipo = "origen";
			var de = {lat:res.ruta.destinolat,lng:res.ruta.destinolng};
			de.tipo = "destino";
			
			gGeo.addPins([or,de])
			ctrl_pub.drawRoute(or,de);
			
		});


		ctrl_pub.recalcular();
		

		ctrl_pub.getSess();
		//gGeo.initAuto();




		ctrl_pub.mainR.set('data.optionHorario',1)
		
		ctrl_pub.mainR.on('optionSet',function(e){
			ctrl_pub.mainR.set('ophor',e.context.val)	
			$('#horario2').timepicker({ 'forceRoundTime': true});
			$('#horario3').timepicker({ 'forceRoundTime': true });

			$('#horario2').on('selectTime',function(e) {
				 $('#horario3').timepicker('option', 'minTime', $(this).val()); 
                    ctrl_pub.mainR.set('horaIni',$(this).val())	
			});

			$('#horario2').on('selectTime',function(e) {
				 $('#horario3').timepicker('option', 'minTime', $(this).val()); 
                    ctrl_pub.mainR.set('horaFin',$(this).val())	
			});


		});	
	




		},
		msgRet : function(response){
			console.log(response)
			ctrl_pub.mainR.set('btDis','');
			ctrl_pub.mainR.set('txtConsultaBt',"Consultar transportista")
			 $('.qtip-modal').qtip('hide');
			var err = createAlertDiv("#msgSendTip","","Mensaje Enviado Satisfactoriamentem te avisaremos en cuanto tengas respuesta.",true,'bg_ok','qtipErrSign',"mensjeOK");
			ctrl_pub.getMsgs();
		},
		renderLogin(response){
		
		 //window.scrollTo(0,0);


		
		ctrl_pub.loginR = template.render('#loginRepT','#loginContainer',{data:response});

		ctrl_pub.loginOptions();


		ctrl_pub.loginR.on('cerrarSesion',function(){		
			dbC.query('/user/cerrarSesion',"GET",{},function(){
				ctrl_pub.loginR.set('data.status','failed')
			})
		});	

		ctrl_pub.loginR.on('getSecc',function(event){	
			var pre = "/app/";
			if(event.context.parent!=undefined){
				pre += event.context.parent + "/"
			}
			window.location= pre + event.context.info.url;
		});	


		// LOGIN 
		ctrl_pub.loginR.on('openLogin',function(){
				ctrl_pub.loginOpen();
            })

        
		// REGISTRO
		ctrl_pub.loginR.on('openRegistro',function(){
				ctrl_pub.registroOpen();
            })






		//$('.checkCont').delay(3000).fadeTo("normal", 0);

	},
	loginOpen : function(msg){
		console.log("CLICK OPEN  LOGIN")

			ctrl_pub.modal = template.render('#loginT', '#modal', {});
			

			if(msg!=undefined){
				var err = createAlertDiv("#msgInfoTip","",msg,true,'bg_ok','qtipErrSign');
			}

            createModal($('#login'))

             startApp2();

            ctrl_pub.modal.on('initLog', function(event) {
            	console.log("inicializando")
                //
                var username = $('input[name="username"]').val().toLowerCase();
                var password = $('input[name="password"]').val();
                ctrl_login.login(username,password,"/app");

            })
            ctrl_pub.modal.on('cancel', function() {
                $('.qtip-modal').qtip('hide');
            })

             ctrl_pub.modal.on('goReg', function() {
         		$('.qtip-modal').qtip('hide');  
         		ctrl_pub.registroOpen();	            
            });
	},
	registroOpen : function(){

		ctrl_pub.modal = template.render('#registroT', '#modal', {tipoCuenta:"CLIENTE"});
        createModal($('#registro'))

            ctrl_pub.modal.on('crearLocal', function(event) {
            	ctrl_login.createLocal(ctrl_pub.modal.get('tipoCuenta'))

            })
            ctrl_pub.modal.on('cancel', function() {
                $('.qtip-modal').qtip('hide');
            })

            $("input[type='password']").keypress(function(e) {
		    var kc = e.which; //get keycode
		    var isUp = (kc >= 65 && kc <= 90) ? true : false; // uppercase
		    var isLow = (kc >= 97 && kc <= 122) ? true : false; // lowercase
		    var isShift = ( e.shiftKey ) ? e.shiftKey : ( (kc == 16) ? true : false ); // shift is pressed

		    // uppercase w/out shift or lowercase with shift == caps lock
		    if ( (isUp && !isShift) || (isLow && isShift) ) {
		    	$('#errorPassword').empty();
		         var err = createAlertDiv("#errorPassword","",ctrl_signup.lan.TX_caps,true,'bg_warn','qtipErrSign');
		    } else {
		        $('#errorPassword').empty();
		    }
		})

		$('#password').pstrength();
            

            startApp();

	},
	loginOptions : function(){
		console.log("running login options")
		var that = this;
    	$('.loginOptions').each(function(item,obj) { // Notice the .each() loop, discussed below
		var item = obj.id;
		console.log(item,"item",obj)
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
	      			
	      			corner: 'top right',
	      			offset : 5,
            		width: 16,
            		height: 10,
            		border :1,
            		mimic:  'center'
	      		}


	   		},
	   		position: {
	          		my : 'top right	',
	        		at: 'bottom right', 
	           
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

	},
	drawRoute: function(origen,destino){


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
		    origin: new google.maps.LatLng(origen.lat,origen.lng),
		    destination: new google.maps.LatLng(destino.lat,destino.lng),
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
	recalcular : function(){

		var costoBase = parseFloat(ctrl_pub.mainR.get('pubModel.publicacion.costos.granIVA'));


		var contratados = 	ctrl_pub.mainR.get('pubModel.contratados');
		console.log(contratados,"contratados")
		var sumatoria = costoBase;

		console.log(sumatoria,"sumatoria")

		for (var i = 0; i < contratados.length; i++) {
			console.log(contratados[i],"CONTRATADOS")
			sumatoria += parseFloat(contratados[i].total);
		}

		ctrl_pub.mainR.animate('pubModel.viaje.costoTotal',sumatoria,{duration:300})
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
			"ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"
		]
		return mesA[date.getMonth()];
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

		//gGeo.initAuto();
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
            ctrl_pub.selOrigen =  {
            	tipo : "origen",
            	nombre : place.formatted_address,
            	place_id : place.place_id,
            	shortN : place.name,
            	lat : place.geometry.location.lat(),
            	lng : place.geometry.location.lng(),
            }

                console.log(ctrl_pub.selOrigen,"PLACES")
        });

        selectFirstOnEnter(document.getElementById('iOrigen'));



		//-----------------------------------------------------

		gGeo.inputBox2 = $('#iDestino');
		var input = (document.getElementById('iDestino'));
		var searchBox2 =  new google.maps.places.Autocomplete(input,options);

		google.maps.event.addListener(searchBox2, 'place_changed', function () {
            var place = searchBox2.getPlace()
            ctrl_pub.selDestino =  {
            	tipo : "destino",
            	nombre : place.formatted_address,
            	place_id : place.place_id,
            	shortN : place.name,
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


Date.prototype.addDays = function(days)
{
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}




Array.prototype.sortBy = function() {
    function _sortByAttr(attr) {
        var sortOrder = 1;
        if (attr[0] == "-") {
            sortOrder = -1;
            attr = attr.substr(1);
        }
        return function(a, b) {
        	var a  = Object.byString(a, attr)
        	var b  = Object.byString(b, attr)
            var result = (a < b ) ? -1 : (a > b) ? 1 : 0;
            return result * sortOrder;
        }
    }
    function _getSortFunc() {
        if (arguments.length == 0) {
            throw "Zero length arguments not allowed for Array.sortBy()";
        }
        var args = arguments;
        return function(a, b) {
            for (var result = 0, i = 0; result == 0 && i < args.length; i++) {
                result = _sortByAttr(args[i])(a, b);
            }
            return result;
        }
    }
    return this.sort(_getSortFunc.apply(null, arguments));
}

Object.byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}
/**********************************************************
*	SIGNUP CONTROLLER
todo

- Combo personalizado con los resultados de google para indicar cantidad icono y otras carac
Layered Flat Design
Animations 

Local Storage  Place , tipo 
login en una sola , incluir facebook y google y local 



***********************************************************/



$(document).ready(function() {
	ctrl_login.ctrlCallBack = ctrl_home;
    mainC.initApp();
    ctrl_home.init();
});

var ctrl_home = {
	lan : spanish,
	waiting : false,
	errors : [],
	toogle:false,
	selOrigen : 0,
	titOn : 0,
	init : function(){

		ctrl_home.render();
	},
	render:function(){


		ctrl_login.checkSession(ctrl_home.renderLogin);
		var tipos = []

		var diaHoy = new Date();
		var plus = 14;
		var diaHoyPlus = diaHoy.addDays(plus);

		ctrl_home.daysR = ctrl_home.genRange(new Date(),14)
		var fechaSel = ctrl_home.setDate(diaHoy);


		var fechas = ctrl_home.daysR;

		var anos = [];
		var date = new Date()
		var currD = date.getFullYear()
		for (var i = 0; i < 10; i++) {
			anos.push({id:i,desc:currD--})
		}

		ctrl_home.tiposTra = ["foraneo","local","de turismo","de carga","de personal"]

		ctrl_home.mainR = template.render('#homeT','#content',	{lan	: ctrl_home.lan,
															toogle:ctrl_home.toogle,
															publicaciones:[],
															fechaSel : fechaSel,
															fechas : fechas,
															tipos : tipos,
															tipoSel : "",

															anos :  anos,
															filtersCarac : [],
															filtersServ : [],
															filtersAnos : [],
															sortOrder : "info.totalDesc",
														 	data:{strOrigen:""}
														}
									);




		var back = ["fondo1.jpg","fondo2.jpg","fondo3.jpg","fondo4.jpg","fondo5.jpg"]
		var rBack = back[Math.floor(Math.random()*back.length)];

		$('.backHeader').css({'background':"-webkit-linear-gradient(top, rgba(0, 0, 0, 0.77) 13%,rgba(0, 0, 0, 0.14) 119%), url(/img/"+ rBack+") repeat"});	
		$('.backHeader').css({'background-size':'cover'});	
		$('.backHeader').css({'background-position':'0'});	


		ctrl_home.mainR.on('dayClick',function(e){

			var fechaSel = ctrl_home.setDate(e.context.date);
			this.set('fechas',ctrl_home.daysR)
			this.set('fechaSel',fechaSel);
			$('.fechaOptions').qtip('hide');
		$('.baseoptions').qtip('hide');
		})

		$('.backOverlay').height($('.backHeader').height());

		ctrl_home.mainR.on('tipoClick',function(event){
			console.log(event.context)
		
			ctrl_home.mainR.set('tipoSel',event.context)
				$('.fechaOptions').qtip('hide');
				$('.baseoptions').qtip('hide');
		});


		ctrl_home.mainR.on('selOrigen',function(event){
			$('#iDestino').focus();
		});

		ctrl_home.mainR.on('selDestino',function(event){
			$('.iFechaCont').focus();
		})

		ctrl_home.mainR.on('hoverTipo',function(event){
			//var curr = this.get(event.keypath+'.hovering')
			//curr = !curr
			//this.set(event.keypath+'.hovering', curr)
		});


		// FILTROS
		ctrl_home.mainR.on('addFilterCarac',function(event){
			ctrl_home.mainR.push('filtersCarac',event.context);
			var act = ctrl_home.mainR.get('caracl')
			for (var i = 0; i < act.length; i++) {
				if(act[i].id==event.context.id) { ctrl_home.mainR.splice('caracl',i,1) };	
			}
			ctrl_home.filterPubs();
		});
		ctrl_home.mainR.on('removeFilterCarac',function(event){
			ctrl_home.mainR.push('caracl',event.context);
			var act = ctrl_home.mainR.get('filtersCarac')
			for (var i = 0; i < act.length; i++) {
				if(act[i].id==event.context.id) { ctrl_home.mainR.splice('filtersCarac',i,1) };
			};
			ctrl_home.filterPubs();
		});
		// Serv
		ctrl_home.mainR.on('addFilterServ',function(event){
			ctrl_home.mainR.push('filtersServ',event.context);
			var act = ctrl_home.mainR.get('servicios')
			for (var i = 0; i < act.length; i++) {
				if(act[i].id==event.context.id) { ctrl_home.mainR.splice('servicios',i,1) };	
			};
			ctrl_home.filterPubs();
		});
		ctrl_home.mainR.on('removeFilterServ',function(event){
			ctrl_home.mainR.push('servicios',event.context);
			var act = ctrl_home.mainR.get('filtersServ')
			for (var i = 0; i < act.length; i++) {
				if(act[i].id==event.context.id) { ctrl_home.mainR.splice('filtersServ',i,1) };
			};
			ctrl_home.filterPubs();
		});

		// Anos
		ctrl_home.mainR.on('addFilterAno',function(event){
			ctrl_home.mainR.push('filtersAnos',event.context);
			console.log(event.context,"AÑOS")
			var act = ctrl_home.mainR.get('anos')
			for (var i = 0; i < act.length; i++) {
				if(act[i].id==event.context.id) { ctrl_home.mainR.splice('anos',i,1) };	
			};
			ctrl_home.filterPubs();
		});
		ctrl_home.mainR.on('removeFilterAno',function(event){
			ctrl_home.mainR.push('anos',event.context);
			var act = ctrl_home.mainR.get('filtersAnos')
			for (var i = 0; i < act.length; i++) {
				if(act[i].id==event.context.id) { ctrl_home.mainR.splice('filtersAnos',i,1) };
			};
			ctrl_home.filterPubs();
		});


		ctrl_home.mainR.on('sortChange',function(event){
			console.log("cambio filtros")
			ctrl_home.filterPubs();
		})

	


		gGeo.initAuto();

	
		ctrl_home.userOptions();
		ctrl_home.fechaOptions();


		ctrl_home.mainR.set('txtBt',"Buscar")


		// BUSQUEDA--------------------------------------------------------
		ctrl_home.mainR.on('buscarBt',function(){

			ctrl_home.mainR.set('txtBt', '<img src="/img/default2.svg" class="loaderGif">')

			ctrl_home.mainR.set('btDis','btDis');


			var sObj = {
				origen : ctrl_home.selOrigen,
				destino : ctrl_home.selDestino,
				fecha : ctrl_home.mainR.get('fechaSel').date,
				tipo :  ctrl_home.mainR.get('tipoSel').id,
				subtipo :  ctrl_home.mainR.get('tipoSel').dataVal,
				rendimiento :  ctrl_home.mainR.get('tipoSel').rendimiento,

			}

		 	ctrl_home.setLS(sObj);
			dbC.query("/busqueda/dist","POST",sObj,ctrl_home.searchRet)


		})
		//------------------------------------------------------------------------------------------------

		ctrl_home.mainR.on('verPub',function(e){
			


			var params = {
				//orlat : ctrl_home.selOrigen.lat.toFixed(3),
				//orlng : ctrl_home.selOrigen.lng.toFixed(3),
				//delat : ctrl_home.selDestino.lng.toFixed(3), 
				//delng : ctrl_home.selDestino.lat.toFixed(3),
				orid : ctrl_home.selOrigen.place_id,
				deid : ctrl_home.selDestino.place_id,
				fecha :  moment(ctrl_home.mainR.get('fechaSel').date).format('YYYYMMDD'),
			}
			window.open("/publicacion/" + e.context.uid + "?" + $.param( params ),'_blank' );
		});

		ctrl_home.mainR.on('masInfo',function(e){
			var mas = this.get('masinfo');
			mas = !mas
			this.set('masinfo',mas)
			gGeo.init();
			gGeo.addPins([ctrl_home.selOrigen,ctrl_home.selDestino])
			ctrl_home.drawRoute();
			localStorage.setItem('masinfo', mas);

		});

		ctrl_home.mainR.on('buscarExtra',function(e){

			ctrl_home.mainR.set('txtBt', '<img src="/img/default2.svg" class="loaderGif">')

			ctrl_home.mainR.set('btDis','btDis');


			var sObj = {
				origen : ctrl_home.selOrigen,
				destino : ctrl_home.selDestino,
				fecha : ctrl_home.mainR.get('fechaSel').date,
				tipo :  ctrl_home.mainR.get('tipoSel').id,
				subtipo :  ctrl_home.mainR.get('tipoSel').dataVal,
				rendimiento :  ctrl_home.mainR.get('tipoSel').rendimiento,
				extraDistance : 100
			}

		 	ctrl_home.setLS(sObj);
			dbC.query("/busqueda/dist","POST",sObj,ctrl_home.searchRet)
		});

		/*ctrl_home.mainR.on('selToggle',function(e){
 			var acV = this.get(e.keypath + '.checked')
 			console.log(acV,"PATH")
 			acV = !acV
 			this.set(e.keypath + '.checked',acV);
 		}); */ 





		clearInterval(ctrl_home.tint);
		ctrl_home.tint = setInterval(ctrl_home.titleRot,5000)

		ctrl_home.getCategorias();

		// Focus decoration
	$( "#iOrigen" ).focusin(function() {
		$('.fechaOptions').qtip('hide');
		$('.baseoptions').qtip('hide');
	    $('.iOrigenCont').addClass('selHome')
	});
	$( "#iOrigen" ).focusout(function() {
	    $('.iOrigenCont').removeClass('selHome')
	});
	$( "#iDestino" ).focusin(function() {
		$('.fechaOptions').qtip('hide');
		$('.baseoptions').qtip('hide');
	    $('.iDestinoCont').addClass('selHome')
	});
	$( "#iDestino" ).focusout(function() {
	    $('.iDestinoCont').removeClass('selHome')
	});


	$( ".iFechaCont" ).focusin(function() {
		var api =ctrl_home.tipFecha.qtip('api');
		api.toggle(true)
	    $('.iFechaCont').addClass('selHome')
	});
	$( ".iFechaCont" ).focusout(function() {
		//$('.fechaOptions').qtip('hide');
	    $('.iFechaCont').removeClass('selHome')
	});
	$( ".iTipoCont" ).focusin(function() {
		var api =ctrl_home.tipTipo.qtip('api');
		api.toggle(true)
	    $('.iTipoCont').addClass('selHome')
	});
	$( ".iTipoCont" ).focusout(function() {
		
	    $('.iTipoCont').removeClass('selHome')
	});



	},
	
	titleRot : function(){
		//console.log("titOn",ctrl_home.titOn)
		$('#tipoT').fadeOut('slow',function(){
			$('#tipoT').text(ctrl_home.tiposTra[ctrl_home.titOn]).fadeIn('slow')
		});
		if(ctrl_home.titOn<ctrl_home.tiposTra.length) { ctrl_home.titOn++ } else { ctrl_home.titOn = 0}
	},
    clearLS : function(){
    	localStorage.clear();
    },
	setLS : function(sObj){

			localStorage.setItem('tipo',sObj.tipo);
			localStorage.setItem('fecha',sObj.fecha.date);
			localStorage.setItem('origen_lng',sObj.origen.lng);
			localStorage.setItem('origen_lat',sObj.origen.lat);
			localStorage.setItem('origen_nombre',sObj.origen.nombre);
			localStorage.setItem('origen_shortN',sObj.origen.shortN);
			localStorage.setItem('origen_place_id',sObj.origen.place_id);
			localStorage.setItem('origen_text', $('#iOrigen').val());
		

			localStorage.setItem('destino_lng',sObj.destino.lng);
			localStorage.setItem('destino_lat',sObj.destino.lat);
			localStorage.setItem('destino_nombre',sObj.destino.nombre);
			localStorage.setItem('destino_shortN',sObj.destino.shortN);
			localStorage.setItem('destino_place_id',sObj.destino.place_id);
			localStorage.setItem('destino_text', $('#iDestino').val());

			localStorage.setItem('ts', new Date());
		
	},
	readLS : function(){


		var origen_lng = localStorage.getItem('origen_lng');
		if(origen_lng!=null){

			ctrl_home.selOrigen =  {
            	tipo : "origen",
            	nombre : localStorage.getItem('origen_nombre'),
            	shortN : localStorage.getItem('origen_shortN'),
            	lat : parseFloat(localStorage.getItem('origen_lat')),
            	lng : parseFloat(localStorage.getItem('origen_lng')),
            	place_id : localStorage.getItem('origen_place_id'),
            }

            ctrl_home.selDestino =  {
            	tipo : "destino",
            	nombre : localStorage.getItem('destino_nombre'),
            	shortN : localStorage.getItem('destino_shortN'),
            	lat : parseFloat(localStorage.getItem('destino_lat')),
            	lng : parseFloat(localStorage.getItem('destino_lng')),
            	place_id : localStorage.getItem('destino_place_id'),
            }

           // console.log(localStorage.getItem('masinfo'),"MASINFO")
            //ctrl_home.mainR.set('masinfo',localStorage.getItem('masinfo')== "false" ? false : true);

            $('#iOrigen').val(localStorage.getItem('origen_text'));
            $('#iDestino').val(localStorage.getItem('destino_text'))

           var item = JSON.search(ctrl_home.mainR.get('tipos'),"//*[id="+ localStorage.getItem('tipo')  +"]")[0];
           ctrl_home.mainR.set('tipoSel',item)




            var sObj = {
				origen : ctrl_home.selOrigen,
				destino : ctrl_home.selDestino,
				fecha : localStorage.getItem('fecha'),
				tipo : localStorage.getItem('tipo')
			}
		//dbC.query("/busqueda/dist","POST",sObj,ctrl_home.searchRet);



		}else{
			 var item = JSON.search(ctrl_home.mainR.get('tipos'),"//*[id="+ 6  +"]")[0];
           ctrl_home.mainR.set('tipoSel',item)
		}
	},
	getCategorias : function(){
		dbC.query('/user/categorias',"GET",{},ctrl_home.categoriasRet)
	},
	categoriasRet: function(res){

		res[0].children.push({tipoClase:4,id:1000,text:"Todos Caja Seca" ,icon:"/img/tipos/ts_cs_full.png",categoria:4,dataVal:8,rendimiento:6})
		res[1].children.push({tipoClase:4,id:1001,text:"Todos Plataforma" ,icon:"/img/tipos/ts_cs_full.png",categoria:4,dataVal:8,rendimiento:6})
		ctrl_home.mainR.set('tipos',res);
		ctrl_home.userOptions();

		ctrl_home.readLS();

	},
 	searchRet : function(res){

 		ctrl_home.resPub = res.publicaciones;
 		ctrl_home.mainR.set('searchOn',true);
 


 		//ctrl_home.mainR.set('searchOn',true);
 		ctrl_home.mainR.set('txtBt',"Buscar");
 		ctrl_home.mainR.set('btDis','');
 		ctrl_home.mainR.set('infoSearch',res.infoSearch)
 		ctrl_home.filterPubs();
 		ctrl_home.mainR.set('ruta',res.ruta)
 	},
 	filterPubs : function(){

 		var sortOrder =  ctrl_home.mainR.get('sortORD')
 		console.log(sortOrder,ctrl_home.resPub)
 		ctrl_home.resPub.sortBy(sortOrder)

 		var caracs = ctrl_home.mainR.get('filtersCarac');
 		var servic = ctrl_home.mainR.get('filtersServ');
 		var anos = ctrl_home.mainR.get('filtersAnos');
 		//var volAvMin = ctrl_home.mainR.get('volAvMin');
 		//var volAvMax = ctrl_home.mainR.get('volAvMax');

 		//var snapshot = Defiant.getSnapshot(ctrl_home.resPub);

 		var a = 0;

 		for (var i = 0; i < ctrl_home.resPub.length; i++) {
 			ctrl_home.resPub[i].visible = true;

 			// Carac
 			for (a = 0; a < caracs.length; a++) {
 				var carSE = JSON.search(ctrl_home.resPub[i].info.carac,'//*[id='+ caracs[a].id +']')
 				if(carSE.length==0) {  ctrl_home.resPub[i].visible = false;}
 			}

 			// Servicios
 			for (a = 0; a < servic.length; a++) {
 				var servSE = JSON.search(ctrl_home.resPub[i].info.servicios,'//*[id='+ servic[a].id +']')
 				if(servSE.length==0) {  ctrl_home.resPub[i].visible = false;}
 			}

 			// Años
 			for ( a = 0; a < anos.length; a++) {
 				if(ctrl_home.resPub[i].info.ano != anos[a].desc ) {  ctrl_home.resPub[i].visible = false;}
 			}	
 			
 		}


 		// fILTROS EXISTENTES

 		var caracAv = [];
 		var servAv = [];
 		var anosAv = [];


 		// Creación de Filtros----------------------------------------------------------------------------------
 		for (var i = 0; i < ctrl_home.resPub.length; i++) {
 			if(ctrl_home.resPub[i].visible){
 				var a;
	 			for ( a = 0; a < ctrl_home.resPub[i].info.carac.length; a++) {
	 				var ext = JSON.search(caracAv,"//*[id="+ ctrl_home.resPub[i].info.carac[a].id +"]")

	 				var sel = JSON.search(ctrl_home.mainR.get('filtersCarac'),"//*[id="+ ctrl_home.resPub[i].info.carac[a].id +"]")
	 				if(ext.length==0 && sel.length==0) { 
	 					ctrl_home.resPub[i].info.carac[a].count = ext.length;
	 					caracAv.push(ctrl_home.resPub[i].info.carac[a])
	 				}
	 			}
	 			for (a = 0; a < ctrl_home.resPub[i].info.servicios.length; a++) {
	 				var ext = JSON.search(servAv,"//*[id="+ ctrl_home.resPub[i].info.servicios[a].id +"]")
	 				var sel = JSON.search(ctrl_home.mainR.get('filtersServ'),"//*[id="+ ctrl_home.resPub[i].info.servicios[a].id +"]")
	 				if(ext.length==0 && sel.length==0) { 
	 					ctrl_home.resPub[i].info.servicios[a].count = ext.length;
	 					servAv.push(ctrl_home.resPub[i].info.servicios[a])
	 				}
	 			}
	 			if(ctrl_home.resPub[i].visible){
	 			var ext = JSON.search(anosAv,"//*[desc="+ ctrl_home.resPub[i].info.ano +"]")
	 			var sel = JSON.search(ctrl_home.mainR.get('filtersAnos'),"//*[desc="+ ctrl_home.resPub[i].info.ano +"]")
	 			if(ext.length==0 && sel.length==0) { 
	 					anosAv.push({id:i,desc:ctrl_home.resPub[i].info.ano,count:ext})
	 			}
 			 } 
 			}
 			
 		}

 		// Sort Filters by ID
 		caracAv.sortBy("desc");
 		servAv.sortBy("desc");
 		anosAv.sortBy("desc")

 		ctrl_home.mainR.set('caracl',caracAv);
 		ctrl_home.mainR.set('servicios',servAv);
 		ctrl_home.mainR.set('anos',anosAv);
 		ctrl_home.mainR.set('publicaciones',ctrl_home.resPub);


 	},
	renderLogin(response){
		
		 window.scrollTo(0,0);
		
		ctrl_home.loginR = template.render('#loginRepT','#loginContainer',{data:response});

		ctrl_home.loginOptions();


		ctrl_home.loginR.on('cerrarSesion',function(){	
			signOut()	
			dbC.query('/user/cerrarSesion',"GET",{},function(){
				ctrl_home.loginR.set('data.status','failed')
			})
		});	

		ctrl_home.loginR.on('getSecc',function(event){	
			var pre = "/app/";
			if(event.context.parent!=undefined){
				pre += event.context.parent + "/"
			}
			window.location= pre + event.context.info.url;
		});	


		// LOGIN 
		ctrl_home.loginR.on('openLogin',function(){
			ctrl_home.modal = template.render('#loginT', '#modal', {});
			

            createModal($('#login'))


            startApp2();

            ctrl_home.modal.on('initLog', function(event) {
            	console.log("inicializando")
                //
                var username = $('input[name="username"]').val().toLowerCase();
                var password = $('input[name="password"]').val();
                ctrl_login.login(username,password,"/app");

            })
            ctrl_home.modal.on('cancel', function() {
                $('.qtip-modal').qtip('hide');
            });

            ctrl_home.modal.on('goReg', function() {
         		ctrl_home.registroOpen();
	            $('.qtip-modal').qtip('hide');  
            });


         

            })

        
		// REGISTRO
		ctrl_home.loginR.on('openRegistro',function(){
			ctrl_home.registroOpen();
        });


		//$('.checkCont').delay(3000).fadeTo("normal", 0);

	},
	registroOpen : function(){

		ctrl_home.modal = template.render('#registroT', '#modal', {tipoCuenta:"CLIENTE"});
			


            createModal($('#registro'))



            ctrl_home.modal.on('crearLocal', function(event) {
            	ctrl_login.createLocal(ctrl_home.modal.get('tipoCuenta'))

            })
            ctrl_home.modal.on('cancel', function() {
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
	userOptions : function(){
    	
    	var that = this;
    	$('.baseoptions').each(function(item,obj) { // Notice the .each() loop, discussed below
		var item = obj.id;
	    ctrl_home.tipTipo = $(this).qtip({
	        content: {
	            text: $(this).next('div'),
	            //button : true
	        },
	        show : {	
	        	event : '',
	        	solo : true
	        },
			hide: { 
				event : 'unfocus',
				fixed: true,
	    	},
	    	style: {
	      		classes: 'qtip-light qtip-shadow qtip-rounded qtip-pop',
	      		tip :  {
	      			offset : 10,
	      			corner: true,
            		width: 16,
            		height: 10,
            		mimic: 'center'
	      		}
	   		},
	   		position: {
	          		my : 'top center',
	        		at: 'bottom center', 
	        		  adjust:{screen:true, resize:true}
	           
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
	    ctrl_home.tipFecha = $(this).qtip({
	        content: {
	            text: $(this).next('div'),
	            //button : true
	        },
	        show : {
	        	event : '',
	        	solo : true,
	        	

	        },
			hide: { 
				event  : 'unfocus',
				fixed: true,
	    	},
	    	style: {
	      		classes: 'qtip-light qtip-shadow qtip-rounded ',
	      		tip : {
	      			
	      			corner: true,
            		width: 16,
            		height: 10
	      		}


	   		},
	   		position: {
	          		my : 'top center',
	        		at: 'bottom center', 
	        		 adjust:{screen:true, resize:true}
	           
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
	setDate:function(di) {
		di.setHours(0,0,0,0)
		var selDate;
		for (var i = 0; i < ctrl_home.daysR.length; i++) {
			ctrl_home.daysR[i].date.setHours(0,0,0,0)
			//console.log(ctrl_home.daysR[i].date,di)
			if(ctrl_home.daysR[i].date.getTime()==di.getTime()){
				selDate = ctrl_home.daysR[i];
				//console.log("TRUE")
				ctrl_home.daysR[i].tipo = true;
			}else{
				//console.log("FALSE")
				ctrl_home.daysR[i].tipo = false;
			}
		}
		return selDate;
	},


	genRange :function(iniD,days){
		var daysOn = [];
		var dOn = iniD;
		for (var i = 0; i < days; i++) {
			var diaName = ctrl_home.diaCompleto(dOn).slice(0,3).toUpperCase();
			var numDia = dOn.getDate();
			var abrMes = ctrl_home.mesAbr(dOn)
			var comp = utils.pad(dOn.getDate())+ "/" + abrMes + "/" + dOn.getFullYear();
			daysOn.push({dia:diaName,numDia:numDia,abrMes:abrMes,date:dOn,comp:comp})
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
            	shortN : place.name,
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
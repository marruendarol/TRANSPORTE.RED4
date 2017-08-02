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
	init : function(){
		ctrl_home.render();
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

	render:function(){

		var ofertas = [
		/*{origen:"Celaya",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre 14:00",carac:["2 Toneladas","Refrigerada"]},
		{origen:"Celaya",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre",carac:["2 Toneladas","Refrigerada"]},
		{origen:"Celaya",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre",carac:["2 Toneladas","Refrigerada"]},
		{origen:"Celaya",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre",carac:["2 Toneladas","Refrigerada"]},
		{origen:"Celaya",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre",carac:["2 Toneladas","Refrigerada"]},
		{origen:"Celaya",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre",carac:["2 Toneladas","Refrigerada"]},
		{origen:"Celaya",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre",carac:["2 Toneladas","Refrigerada"]},
		{origen:"Celaya",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre",carac:["2 Toneladas","Refrigerada"]},
		{origen:"Celaya",destino:"Nuevo León",precioBase:"12,228.00",precioOferta:"9,323.00",descuento:"32%",finaliza:"20 Septiembre",carac:["2 Toneladas","Refrigerada"]},*/
		]

		ctrl_home.mainR = template.render('#homeT','#content',	{lan	: ctrl_home.lan,
															toogle:ctrl_home.toogle,
															ofertas:ofertas,
														 	data:{strOrigen:""}
														}
									);

		ctrl_home.mainR.on('openLogin',function(){

			var html = '<h2>login</h2>'
			createModal(html)

		})

		ctrl_home.mainR.on('sPlace',function(event){

			var str = event.context.data.strOrigen;
			if(str.length>0){
				socket.emit('oPlace',{str:str,room:userRoom})
			}else{
				ctrl_home.renderOrigenRes({})
			}
			
			
		})

		ctrl_home.mainR.observe( 'data.strOrigen', function ( newValue, oldValue, keypath ) {
			if(newValue!=oldValue){
					ctrl_home.showOrigen();
	   			var str = newValue;
				if(str.length>0){
					socket.emit('oPlace',{str:str,room:userRoom})
				}else{
					ctrl_home.hideOrigen();
				}
			}
			
		});

		ctrl_home.mainR.on('selOrigen',function(event){
			console.log("valor sel ",ctrl_home.selOrigen)
			if(ctrl_home.selOrigen>-1){
			ctrl_home.origen = ctrl_home.orRs[ctrl_home.selOrigen];

			ctrl_home.mainR.set('data.strOrigen', ctrl_home.origen.municipio_nombre)
			}
			ctrl_home.hideOrigen();
			$('#iDestino').focus();
			
		});

		ctrl_home.mainR.on('selOrigenDown',function(event){
			
			ctrl_home.selOrigen++;
			if(ctrl_home.selOrigen>ctrl_home.orRs.length-1){
				ctrl_home.selOrigen = 0;
			}
			console.log(ctrl_home.selOrigen)
			ctrl_home.orR.set('selOrigen',ctrl_home.selOrigen)
		});

		ctrl_home.mainR.on('selOrigenUp',function(event){
			
			ctrl_home.selOrigen--;
			if(ctrl_home.selOrigen<0){
				ctrl_home.selOrigen = ctrl_home.orRs.length-1
			}
			console.log(ctrl_home.selOrigen)
			ctrl_home.orR.set('selOrigen',ctrl_home.selOrigen)

		});

	


		ctrl_home.mainR.on('toogleOptions',function(){
			console.log("pasando")
			  ctrl_home.toogle = !ctrl_home.toogle;
			ctrl_home.mainR.set('toogle',ctrl_home.toogle)
		})

		 socket.on('placeOrigen', function(obj) {  //Fired upon a reconnection 
	        	ctrl_home.procOrigen(obj) 
	    });

		 

	},
	hideOrigen : function(){
		ctrl_home.selOrigen = 0
		$('#resOrigen').hide();
	},
	showOrigen : function(){
		$('#resOrigen').show();
	},
	procOrigen : function(res){
		ctrl_home.renderOrigenRes(res);
	},
	renderOrigenRes: function(res){

		console.log(res,"render")
		if(res.length>0){
			res[0].selected = true;
			ctrl_home.orRs = res;
			ctrl_home.orR = template.render('#origenResT','#resOrigen',	{data	: res, selOrigen:ctrl_home.selOrigen });
		}else{
			ctrl_home.selOrigen = -1;
			ctrl_home.orR = template.render('#origenEmptyT','#resOrigen',	{ });
			
		}


		ctrl_home.orR.on('selOrigen',function(event){

			ctrl_home.origen = event.context;
			ctrl_home.mainR.set('data.strOrigen', ctrl_home.origen.municipio_nombre)
			ctrl_home.hideOrigen();
			$('#iDestino').focus();
			
		});

	},

	rt: function(){
		var origen, destinos, opciones, vehiculo;

origen = {"idCategoria":"A-9",
			"desc":"Celaya 2000, Nuevo Celaya, Celaya, Celaya, Guanajuato",
			"idTramo":117543,
			"source":167466,
			"target":167467,
			"x":-100.836,
			"y":20.5334
}

destinos = [{"idCategoria":"A-2","desc":"León, Guanajuato","idTramo":617873,"source":551810,"target":551809,"x":-101.6821337,"y":21.1221486}]

opciones = {
	casetas : true,
	alertas : false
};

vehiculo = {
	tipo : 1, 
	subtipo : 1,
	excedente : 1,
	rendimiento : 17.0,
	costoltgas : 12.0
};


$.ajax({
	type : 'POST',
	url : 'http://ttr.sct.gob.mx/TTR/rest/GeoRouteSvt',
	data : {
		'json' : JSON.stringify({
			"usr" : "sct",
			"key" : "sct",
			"origen" : origen,
			"destinos" : destinos,
			"ruta" : 1,
			"opciones" : opciones,
			"vehiculo" : vehiculo
		})
	},
	contentType : 'application/json',
	dataType : 'jsonp',
	success : function(resp) {
		console.log("Resp", resp);
	},
	error : function(jqXHR, textStatus, errorThrown) {
		if (textStatus != "abort") {
			console.log(textStatus);
		}
	}
});
	}



	
	
}

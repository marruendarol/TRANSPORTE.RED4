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


/*
    'http://gaia.inegi.org.mx/sakbe/wservice?make=IL&x=-100.809979&y=20.517765&escala=100000&type=xml&key=T34JkNDI-g8JV-3IX6-IvRH-kNt5wu97qPIT'

    'http://gaia.inegi.org.mx/sakbe/wservice?make=IL&x=-101.687987&y=21.122860&escala=100000&type=xml&key=T34JkNDI-g8JV-3IX6-IvRH-kNt5wu97qPIT'

    <sakbe>
<linea>
<id_routing_net>583867</id_routing_net>
<source>128071</source>
<target>246914</target>
<nombre>Boulevard Adolfo López Mateos</nombre>
<geojson>
{"type":"Point","coordinates":[-100.809851762763,20.5192422239355]}
</geojson>
</linea>
</sakbe>

<sakbe>
<linea>
<id_routing_net>602944</id_routing_net>
<source>287287</source>
<target>287288</target>
<nombre>Calle Ignacio Comonfort</nombre>
<geojson>
{"type":"Point","coordinates":[-101.685539026594,21.1219452806223]}
</geojson>
</linea>
</sakbe>


'http://gaia.inegi.org.mx/sakbe/wservice?make=CR&id_i=583867&source_i=128071&target_i=246914&id_f=602944&source_f=287287&target_f=287288&p=2&v=1&e=0&type=json&key=T34JkNDI-g8JV-3IX6-IvRH-kNt5wu97qPIT '
*/



    getPlaceP : function(valor){

    var url = 'http://gaia.inegi.org.mx/sakbe/wservice';
    var data = {
					"key" : "T34JkNDI-g8JV-3IX6-IvRH-kNt5wu97qPIT",
					"type" : 'json',
					"buscar" : valor,
					"make" : 'SD',
				}

    	$.getJSON( url, data,function( json ) {  
    		ctrl_home.orRs = json;
    		ctrl_home.renderOrigenRes(json)
    	});

    
    },
    getPlaceD : function(valor){

    var url = 'http://gaia.inegi.org.mx/sakbe/wservice';
    var data = {
					"key" : "T34JkNDI-g8JV-3IX6-IvRH-kNt5wu97qPIT",
					"type" : 'json',
					"buscar" : valor,
					"make" : 'SD',
				}


    	$.getJSON( url, data,function( json ) {  
    		ctrl_home.deRs = json;
    		ctrl_home.renderDestinoRes(json)
    	});

    
    },
    getRoute: function(){


    	var url = 'http://gaia.inegi.org.mx/sakbe/wservice';
    	var data = {
    				"make" : 'GD',
					"key" : "T34JkNDI-g8JV-3IX6-IvRH-kNt5wu97qPIT",
					"_id": 1,
					"dest_i":ctrl_home.origen.id_dest,
					"dest_f":ctrl_home.destino.id_dest,
					"p": 1, // 0 Preferentemente Libre  1 Preferentemente cuota 2 Ruta Sugerida
					"v" : 1, // Tipo Vehiculo 
					"e" : 0,  // Eje Excedente 
					"type" : 'json'
				}

    	$.getJSON( url, data,function( json ) {  
    		console.log(json)
    	});

   /* $.ajax({
		type : 'POST',
		url : 'http://gaia.inegi.org.mx/ NLB/tunnel/mdm_routing/optimal',
		data : {
				id_s:'22716',
				id_t:'22788',
		},
		contentType : 'application/json',
		dataType : 'json',
		crossDomain : true,
		success : function(resp) {
			console.log("Resp", resp);
		},
		error : function(jqXHR, textStatus, errorThrown) {
			if (textStatus != "abort") {
				console.log(textStatus);
			}
		}
	});*/
	


    	
    },
	render:function(){

		ctrl_home.mainR = template.render('#homeT','#content',	{lan	: ctrl_home.lan,
															toogle:ctrl_home.toogle,
														 	data:{strOrigen:"",strDestino:""}
														}
									);


		ctrl_home.mainR.on('bRoute',function(){
			console.log("buscando ruta")
			ctrl_home.getRoute();
		})


		ctrl_home.mainR.observe( 'data.strOrigen', function ( newValue, oldValue, keypath ) {
			if(newValue!=oldValue){
					ctrl_home.showOrigen();
	   			var str = newValue;
	   			console.log(str,"STR")
				if(str.length>3){
					ctrl_home.getPlaceP(str);
					//socket.emit('oPlace',{str:str,room:userRoom})
				}else{
					ctrl_home.hideOrigen();
				}
			}
			
		});

		ctrl_home.mainR.on('selOrigen',function(event){
			console.log("valor sel ",ctrl_home.selOrigen)
			if(ctrl_home.selOrigen>-1){
			ctrl_home.origen = ctrl_home.orRs[ctrl_home.selOrigen];

			ctrl_home.mainR.set('data.strOrigen', ctrl_home.origen.nombre)
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

		//------------


		ctrl_home.mainR.observe( 'data.strDestino', function ( newValue, oldValue, keypath ) {
			if(newValue!=oldValue){
					ctrl_home.showDestino();
	   			var str = newValue;

				if(str.length>3){
					ctrl_home.getPlaceD(str);
					//socket.emit('oPlace',{str:str,room:userRoom})
				}else{
					ctrl_home.hideDestino();
				}
			}
			
		});

		ctrl_home.mainR.on('selDestino',function(event){
			if(ctrl_home.selDestino>-1){
			ctrl_home.destino = ctrl_home.deRs[ctrl_home.selDestino];

			ctrl_home.mainR.set('data.strDestino', ctrl_home.destino.nombre)
			}
			ctrl_home.hideDestino();
			
			
		});

		ctrl_home.mainR.on('selDestinoDown',function(event){
			
			ctrl_home.selDestino++;
			if(ctrl_home.selDestino>ctrl_home.deRs.length-1){
				ctrl_home.selDestino = 0;
			}
			console.log(ctrl_home.selDestino)
			ctrl_home.deR.set('selDestino',ctrl_home.selDestino)
		});

		ctrl_home.mainR.on('selDestinoUp',function(event){
			
			ctrl_home.selDestino--;
			if(ctrl_home.selDestino<0){
				ctrl_home.selDestino = ctrl_home.deRs.length-1
			}

			ctrl_home.deR.set('selDestino',ctrl_home.selDestino)

		});
	


		ctrl_home.mainR.on('toogleOptions',function(){
			console.log("pasando")
			  ctrl_home.toogle = !ctrl_home.toogle;
			ctrl_home.mainR.set('toogle',ctrl_home.toogle)
		})

		 
		 

	},
	hideOrigen : function(){
		ctrl_home.selOrigen = 0
		$('#resOrigen').hide();
	},
	showOrigen : function(){
		$('#resOrigen').show();
	},
	hideDestino : function(){
		ctrl_home.selOrigen = 0
		$('#resDestino').hide();
	},
	showDestino : function(){
		$('#resDestino').show();
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
			ctrl_home.mainR.set('data.strOrigen', ctrl_home.origen.nombre)
			ctrl_home.hideOrigen();
			$('#iDestino').focus();
			
		});

	},
	renderDestinoRes: function(res){

		if(res.length>0){
			res[0].selected = true;
			ctrl_home.deRs = res;
			ctrl_home.deR = template.render('#destinoResT','#resDestino',	{data	: res, selDestino:ctrl_home.selDestino });
		}else{
			ctrl_home.selDestino = -1;
			ctrl_home.deR = template.render('#origenEmptyT','#resDestino',	{ });
			
		}


		ctrl_home.deR.on('selDestino',function(event){

			ctrl_home.destino = event.context;
			ctrl_home.mainR.set('data.strDestino', ctrl_home.destino.nombre)
			ctrl_home.hideDestino();
			//$('#iDestino').focus();
			
		});

	},
}




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
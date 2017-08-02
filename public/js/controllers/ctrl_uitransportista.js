/**********************************************************

***********************************************************/


var socket; 
var userRoom = "";


var templateList = [
    './templates/transportista/t_bases.html',
    './templates/transportista/t_transportista.html',
]

$(document).ready(function() {
	socket = io('/transporte.red');
    mainC.initApp();
   // ctrl_trans.checkSession();
   mainC.loadTInit(ctrl_trans.render,templateList)
   ctrl_trans.initSocket();
});



var ctrl_trans = {
	tabs : [],
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
                	ctrl_trans.userData = response.data;
                	console.log("GENERATED ROOM",userRoom,response.data)
                	ctrl_sync.init();
                	mainC.loadTInit(ctrl_trans.render,templateList)
                	ctrl_trans.initSocket();
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

    	socket.on('connect', function () { 
    		console.log("connecting remote")
    		socket.emit('create',"temporalsocket")//userRoom);  

    		socket.on('joined', function(response){
    			console.log("4- Socket join")
    			createGrowl("Group info","Conectado a transporte.red",false,'bg_ok','conn');

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
    render : function(){
    	var rObj = template.render('#mainT','#contentUI',{})
    

    	// menu
    	var menuObj = { items : [
    			{id:utils.guid(), ico: "menu1", name:"Resumen de viajes",ico:"bases32.png",link:"agenda",clase:ctrl_bases,unique:true},
    			{id:utils.guid(), ico: "menu1", name:"Agenda de Viajes",ico:"bases32.png",link:"agenda",clase:ctrl_bases,unique:true},
    			{id:utils.guid(), ico: "menu1", name:"Bases",ico:"bases32.png",link:"agenda",clase:ctrl_bases,unique:true},
    			{id:utils.guid(), ico: "menu1", name:"Unidades",ico:"pacientes32.png",toogle:false},
    			{id:utils.guid(), ico: "menu1", name: "Choferes",ico:"medico32.png",link:"catalogo",clase:"",unique:true},
    			{id:utils.guid(), ico: "menu1", name: "Documentos", ico:"herramienta32.png", toogle:false},
    			{id:utils.guid(), ico: "menu1", name: "Estados de Cuenta", ico:"herramienta32.png", toogle:false},
    			{id:utils.guid(), ico: "menu1", name: "Métodos de Pago", ico:"herramienta32.png", toogle:false},
    			{id:utils.guid(), ico: "menu1", name: "Facturación", ico:"herramienta32.png", toogle:false},
    			{id:utils.guid(), ico: "menu1", name: "Opciones", ico:"herramienta32.png", toogle:false},
    			{id:utils.guid(), ico: "menu1", name:"Reportes",ico:"pacientes32.png",toogle:false, childs : [
    				{id:utils.guid(), ico: "menu1", name:"Unidades",ico:"pacientes32.png", link:"imc",clase :"",unique:true},
    				{id:utils.guid(), ico: "menu1", name:"Choferes",ico:"pacientes32.png", link:"imc", clase : "",unique:true},
    				{id:utils.guid(), ico: "menu1", name:"Solicitudes Expediente",ico:"pacientes32.png", link:"imc", clase : "",unique:true}
    			]},

    		]};

/*
    		
*/

    	var mObj = template.render('#menuT','#menuArea',menuObj)

    	mObj.on('toogle',function(e){

    		if(e.context.link!=undefined){
    		
	    		var obj = e.context

	    		if(ctrl_trans.addTab(obj)){
	    			e.context.clase.init(obj);
	    		}
	    			
    		}

    		if(!e.context.toogle){
    			e.context.toogle = true;
    			$('#childs_'+ e.context.id).slideDown(200);
    			TweenMax.to($('#icof_'+ e.context.id), .5, {rotation:90,ease: Back.easeOut.config(1.7)});
    			
    		}else{
    			e.context.toogle = false;
    			$('#childs_'+ e.context.id).slideUp(200);
    			TweenMax.to($('#icof_'+ e.context.id), .5, {rotation:0,ease: Back.easeOut.config(1.7)});
    		}
    		
    	})





    	ctrl_trans.tabObj = template.render('#tabsT','#contentArea',{tabs : ctrl_trans.tabs})

    	mObj.on('createG',function(e){
    		createGrowl("Group info","Growl informativo...",false,'bg_info');
    	})

    	mObj.on('createModal',function(e){
    		var dataObj = {_id:1,msg:"Aviso",
						nodeName: "Aviso Muestra",
							}
			var modal = template.render('#deleteNT','#modal',dataObj);

				createModal($('#delModal'))

				modal.on('confirm',function(){	
					 $('.qtip-modal').qtip('hide');
				})
				modal.on('cancel',function(){	
					 $('.qtip-modal').qtip('hide');
				})
    	})


    	

    	ctrl_header.render();

    	    	// Bienvenido 
    		var html = '<h5>Dashboard</h5>'
    		var obj = {name:"Resumen",id:utils.guid(),unique:true}
    
	}
};



var ctrl_header = {
	render : function(){

		var mObj = template.render('#headerT','#headerDiv',{data : ctrl_trans.userData})
		ctrl_header.userOptions()

		mObj.on('closeSession',function(){
			ctrl_header.closeSession();
		})

		mObj.on('profile',function(){
    		var obj = {name:"Configuración de Perfil",
    		unique : true,
    		type:"PROFILE",
    		id:"profile" }
    		if(ctrl_trans.addTab(obj)){
    			ctrl_profileM.init(obj)	
    			ctrl_trans.gotoTab(obj.id)
    		}else{
    			ctrl_trans.gotoTab(obj.id)
    		}
    		
    		
		})
	},
	closeSession : function(){
		 $.ajax({
            type: 'GET',
            data: {},
            url: '/user/cerrarSesion',
            dataType: 'JSON'
            }).done(function( response ) {
                window.location="../"
            }).fail(function( response ) {
                console.log("response",response)
        }); 
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
	      		tip : true
	   		},
	   		position: {
	          		my : 'top left',
	        		at: 'bottom left', 
	           
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
	    

	    $('.notifications').each(function(item,obj) { // Notice the .each() loop, discussed below
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
	      		tip : true
	   		},
	   		position: {
	          		my : 'top left',
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
	    

	     $('.messages').each(function(item,obj) { // Notice the .each() loop, discussed below
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
	      		tip : true
	   		},
	   		position: {
	          		my : 'top left',
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
	    }



}




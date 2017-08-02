
/**********************************************************
* TODO 
* 
	- Mensajes de Sección avisos rojos 
	- Meter Catálgoo de Servicios por unidad y poderle poner precio 
	- Catálogo Marcas	
	- Estatus de Unidad
	- Cuadrar Búsquedas a portada -

***********************************************************/




$(document).ready(function() {

    ctrl_app.checkSession();
});



var ctrl_app = {
	objs : [],
	menuState : false,
	checkSession: function(){
       $.ajax({
            type: 'POST',
            data: {},
            url: '/user/session',
            dataType: 'JSON'
            }).done(function( response ) {
             ctrl_app.session = response;
             ctrl_app.render();
             ctrl_app.getRoute();   
            }).fail(function( response ) {
               window.location = "/home2";
        }); 
    },
    getRoute : function(){
    	
    	var r= new URI().path();
    	r = r.split('/')   	
    	for (var i = 0; i < ctrl_app.session.seccs.length; i++) {
    		 
    		if(ctrl_app.session.seccs[i].info.url == r[2]){
    			ctrl_app.url = ctrl_app.session.seccs[i].info.url;
    			$.getScript('/js/controllers/'+ctrl_app.session.seccs[i].info.ctrl, function(data, textStatus, jqxhr) {			
				});
				
    		}
    	};	
    	ctrl_app.renderMenu();
    	ctrl_app.renderMiniMenu();
    },
    setRoute(name,url){
		 window.history.pushState({},name,url );
         document.title = name;
         ctrl_app.getRoute();
	},
    render : function(){

    	ctrl_app.rObj = template.render('#mainT','#contentUI',{user:ctrl_app.session,urlApp:ctrl_app.url})
    	ctrl_app.renderLogin();

    	$(window).on('popstate', function() {
	     ctrl_app.getRoute();
	    });


	    ctrl_app.rObj.on('toogleMenu',function(){
	    	if(ctrl_app.menuState){
	    		ctrl_app.closeMenu();
	    	}else{
	    		ctrl_app.openMenu();
	    	}
	    })


	    ctrl_app.rObj.on('retHome',function(){
	    	window.location = "/";
	    })

	   $('#miniMenu').on('click',function(event){	
    		ctrl_app.closeMenu();
    	});


	   template.render('#footerT','#footerApp',{})
	    	



    },
    renderMenu : function(){
    	
    	$('#subUI').empty();

    	ctrl_app.mObj = template.render('#menuT','#backMenu',{user:ctrl_app.session,urlApp:ctrl_app.url},null,null,true)
    	ctrl_app.mObj.on('menuClick',function(event){
    		window.history.pushState({path:"app/" + event.context.info.url},event.context.info.nombre,"/app/" + event.context.info.url);
    		console.log(event.context.info.nombre,"TITULO")
    		document.title = event.context.info.nombre;
    		ctrl_app.cleanUp();
    		ctrl_app.getRoute();
    	})

    },
    openMenu : function(){
    	ctrl_app.menuState = true;
    	$("#miniMenu").animate({"left":"0px"})
    },
    closeMenu : function(){
    	ctrl_app.menuState = false;
    	$("#miniMenu").animate({"left":"-625px"})
    },
    renderMiniMenu : function(){
    	ctrl_app.mObjM = template.render('#minimenuT','#miniMenu',{user:ctrl_app.session,urlApp:ctrl_app.url})
    
    	ctrl_app.mObjM.on('menuClick',function(event){
    		ctrl_app.closeMenu();
    		var parent="";
    		if(event.context.parent!=undefined){
    			parent = "/" +  event.context.parent;
    		}
    		window.history.pushState({path:"app/" + event.context.info.url},event.context.info.nombre,"/app" + parent + "/" + event.context.info.url);
    		document.title = event.context.info.nombre;
    		ctrl_app.cleanUp();
    		ctrl_app.getRoute();
    	})
    },
    renderLogin : function(){
		ctrl_app.loginR = template.render('#loginRepT','#loginContainer',{data:ctrl_app.session});

		ctrl_app.loginOptions();


		ctrl_app.loginR.on('cerrarSesion',function(){		
			dbC.query('/user/cerrarSesion',"GET",{},function(){
				window.location = "/home2";
			})
		});	

		ctrl_app.loginR.on('getSecc',function(event){		
			window.location= "/app/" + event.context.info.url;
		});	

		//$('.checkCont').delay(3000).fadeTo("normal", 0);

	},
	loginOptions : function(){
		var that = this;
    	$('.loginOptions').each(function(item,obj) { // Notice the .each() loop, discussed below
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
	suscribe : function(obj){
		ctrl_app.objs.push(obj);
	},
	cleanUp: function(){ // Clean CLASS objects
		for (var i = 0; i < ctrl_app.objs.length; i++) {
			window[ctrl_app.objs[i]]={};
		}
		ctrl_app.objs = [];
	},
	getPerms(url){
		var tipo = ctrl_app.session.tipo;
		var perms = {};
		for (var i = 0; i < ctrl_app.session.seccs.length; i++) {
			if(ctrl_app.session.seccs[i].info.url==url && ctrl_app.session.seccs[i].perms[tipo]!=undefined){
				return ctrl_app.session.seccs[i].perms[tipo];
			}
		}
		return perms
	},

	
}


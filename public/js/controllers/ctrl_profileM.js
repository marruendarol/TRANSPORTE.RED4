/* -----------------------------------------------------
	Secciones a actualizar 
		- Datos Generales
		- Consultorios
			-  Horarios
			- Dirección Teléfonos
		- Asistentes
		- Datos de Pago 
		- Datos de Facturación
		- 

	loader 
	errores
	probar socket 
	
	% completado del perfil

	
	Consultorio que lleva

	Horarios 
	Ubicación
	Dirección 
	RFC 

	Días habiles cambios rápidos
	1-7 

	cambiar estatus de consultorio  a activo , vacaciones, remodelación , suspensión de actividades


-------------------------------------------------------- */

var ctrl_profileM = {
	tabData : {tabs  : []},
	rObj : {},
	userId : {},
	init: function(obj){
		ctrl_profileM.render(obj)
	},
    render : function(obj){

        ctrl_profileM.tabData = {tabs  : []}
    	ctrl_profileM.rObj = template.render('#profileT','#tab_' + obj.id,{profileData:ctrl_profileM.profileData})
    	
    	ctrl_profileM.tabObj = template.render('#subtabsT','#profileContent',ctrl_profileM.tabData)

    	// Creeate Tabs 
    	var obj = {name:"Datos Generales",type:"GENERALES",id:utils.guid() }
    		ctrl_profileM.addTab(obj)
    		ctrl_profileM.gotoTab(obj.id)	

    	var obj = {name:"Consultorios",type:"CONSULTORIOS",id:utils.guid() }
    		ctrl_profileM.addTab(obj)
    		
    	var obj = {name:"Asistentes",type:"ASISTENTES",id:utils.guid() }
    		ctrl_profileM.addTab(obj)
    		
    	var obj = {name:"Pagos al portal",type:"EDOCTA",id:utils.guid() }
    		ctrl_profileM.addTab(obj)			

    	// Tabs Listener
   		ctrl_profileM.tabObj.on('clickTab',function(e){
    		ctrl_profileM.gotoTab(e.context.id)
    	})   	

    
    },
    addTab : function(obj){

    	obj.html = '<div id="tab_'+ obj.id +'"></div>'
    	ctrl_profileM.tabData.tabs.push(obj);
    	ctrl_profileM.tabObj.set('tabs', ctrl_profileM.tabData.tabs);
    	
    },
    gotoTab : function(id){
    	
    	ctrl_profileM.tabData.tabs.forEach(function(item){
    		if(item.id==id){
    			$('#subtabContItem_'+item.id).slideDown(400).siblings().slideUp(400);
    			$('#subtabItem_'+item.id).addClass('subactive').siblings().removeClass('subactive');
    			$('.subtabText').removeClass('subactiveText');
    			$('#subtabItem_'+item.id).find('.subtabText').addClass('subactiveText')

    			switch(item.type){
    				case "GENERALES" 	: ctrl_genM.getData(item);break;
    				case "CONSULTORIOS" : ctrl_consulM.getData(item);break;
    				case "ASISTENTES" 	: ctrl_asistM.getData(item);break;
    				case "EDOCTA" 		: ctrl_pagosM.getData(item);break; 
    			}


    		}else{
    			// not visible
    		}
    	});
    },
    removeTab : function(id){
    	utils. removeObjArr(ctrl_profileM.tabData.tabs,"id",id)
    	ctrl_profileM.tabObj.set('tabs', ctrl_profileM.tabData.tabs);
    },
};


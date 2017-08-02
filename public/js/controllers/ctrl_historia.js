var ctrl_historia = {
	tabSubmenu : {subms  : []},
	rObj : {},
	profileData : {},
	userId : {},
	changes : false,
    getData : function(obj){

		console.log('Entra Historia Clinica');
		ctrl_historia.tabSubmenu = {subms  : []};
    	ctrl_historia.rObj = template.render('#profileT','#sub_' + obj.id,{});
		ctrl_historia.subObj = template.render('#submenuT','#subContent',ctrl_historia.tabSubmenu);

		// Creeate Links
		var obj = {name:"Datos Personales",type:"DATOS",id:utils.guid() }
    		ctrl_historia.addSub(obj);
    		ctrl_historia.gotoSub(obj.id);
			
		var obj = {name:"Antecedentes",type:"ANTECEDENTES",id:utils.guid() }
    		ctrl_historia.addSub(obj);

		var obj = {name:"Estudios",type:"ESTUDIOS",id:utils.guid() }
    		ctrl_historia.addSub(obj);

		var obj = {name:"Nota de Evolución",type:"EVOLUCION",id:utils.guid() }
    		ctrl_historia.addSub(obj);

    	// Tabs Listener
   		ctrl_historia.subObj.on('clickSub',function(e){
			console.log('Click submenu');
    		ctrl_historia.gotoSub(e.context.id);
    	});
    },

	
	addSub : function(obj){
		//if(ctrl_historia.tabSubmenu.subms.length < 8){
			obj.html = '<div id="sub_'+ obj.id +'"></div>';
			ctrl_historia.tabSubmenu.subms.push(obj);
			ctrl_historia.subObj.set('subms', ctrl_historia.tabSubmenu.subms);
		//}
    },

    gotoSub : function(id){
    	ctrl_historia.tabSubmenu.subms.forEach(function(item){
    		if(item.id===id){
    			$('#subsubContItem_'+item.id).slideDown(400).siblings().slideUp(400);
    			$('#subsubItem_'+item.id).addClass('subactive').siblings().removeClass('subactive');
    			$('.subsubText').removeClass('subactiveText');
    			$('#subsubItem_'+item.id).find('.subsubText').addClass('subactiveText');

    			switch(item.type){
    				case "DATOS" 		: ctrl_datosPersonales.init(item);break;
    				case "ANTECEDENTES" : ctrl_antecedentes.init(item);break;
    				case "ESTUDIOS" 	: ctrl_estudiosHistoria.init(item);break;
					case "EVOLUCION" 	: ctrl_notaEvHistoria.init(item);break;
    			}
    		}else{
    			// not visible
    		}
    	});
    },

    removeTab : function(id){
    	utils. removeObjArr(ctrl_historia.tabSubmenu.subs,"id",id);
    	ctrl_historia.subObj.set('subs', ctrl_historia.tabSubmenu.subs);
    },

};

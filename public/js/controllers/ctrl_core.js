/**********************************************************
*	CORE CONTROLLER
***********************************************************/

$(document).ready(function() {
    mainC.init(ctrl_core.init);  // Inicializa Foundation JS
});

var ctrl_core = {

	path : "",
	id 	 : "",
	init : function(){		
		ctrl_menu.init();
		ctrl_core.initRoutes();
		ctrl_core.routeCheck();
	},
	loadController : function(controllerURL,params,forceReload){
		
		$.ajax({
	        type: "GET",
	        url: controllerURL,
	        dataType: "script",
	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	            console.log('error ', errorThrown);
	        },
	        success:function(e){
	         	eval(params.init)(params);
	        }
    	});
	},
	initRoutes : function(){
		window.onpopstate = function(event) {
 			ctrl_core.routeCheck();
		};
	},
	routeCheck : function(){
		var qParam = utils.getURLparams();

		switch(qParam.r){

			case "especialidadesList" : 
		 		var params = { init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_especialidadesList.js",params);
				break;

			case "especialidad"  :
				var params = { id : qParam.id, init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_especialidad.js",params);
				break;		

			case "especRList" : 
		 		var params = { init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_especRList.js",params);
				break;

			case "especR"  :
				var params = { id : qParam.id, init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_especR.js",params);
				break;			

			case "cardsList" : 
		 		var params = { init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_cardsList.js",params);
				break;

			case "cardsReport" : 
		 		var params = { init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_cardsReport.js",params);
				break;	

			case "card"  :
				var params = { id : qParam.id, init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_card.js",params);
				break;

			case "cardItemList" : 
		 		var params = { init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_cardItemList.js",params);
				break;

			case "cardItem"  :
				var params = { id : qParam.id, init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_cardItem.js",params);
				break;	

			case "bannersList" : 
		 		var params = { init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_bannersList.js",params);
				break;

			case "banner"  :
				var params = { id : qParam.id, init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_banner.js",params);
				break;


			case "incidenciasList" : 
		 		var params = { init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_incidenciasList.js",params);
				break;

			case "incidencia"  :
				var params = { id : qParam.id, init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_incidencia.js",params);
				break;

			case "altasList" : 
		 		var params = { init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_altasList.js",params);
				break;

			case "alta"  :
				var params = { id : qParam.id, init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_alta.js",params);
				break;	

			case "sucursalesList" : 
		 		var params = { init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_sucursalesList.js",params);
				break;

			case "sucursal"  :
				var params = { id : qParam.id, init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_sucursal.js",params);
				break;	

			case "suscriptoresList" : 
		 		var params = { init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_suscriptoresList.js",params);
				break;

			case "suscriptor"  :
				var params = { id : qParam.id, init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_suscriptor.js",params);
				break;		

			

			case "promocionesList" : 
		 		var params = { init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_promocionesList.js",params);
				break;

			case "promocion"  :
				var params = { id : qParam.id, init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_promocion.js",params);
				break;			

			case "clientsList" : 
		 		var params = { init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_clientsList.js",params);
				break;

			case "client"  :
				var params = { id : qParam.id, init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_client.js",params);
				break;
				
			case "logList" : 
		 		var params = { init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_logList.js",params);
				break;					

			case "usersList" : 
		 		var params = { init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_usersList.js",params);
				break;

			case "user"  :
				var params = { id : qParam.id, init : 'ctrl_pj.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_userC.js",params);
				break;	
		

			case "dashboard"  :
				var params = { id : qParam.id, init : 'ctrl_pA.init' }
    			ctrl_core.loadController("../js/controllers/ctrl_dashboard.js",params);
				break;		

			default : alert("ruta no encontrada")
		}

		

	}

}
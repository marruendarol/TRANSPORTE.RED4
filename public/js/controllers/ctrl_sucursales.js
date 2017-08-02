/*-----------------------------------------------------------------------------------
	TODO 

	- Selector Lugar / Dirección
	

-------------------------------------------------------------------------------------*/
var templateList = [
   '/templates/t_sucursalesList.html',
]


var ctrl_sucursales = {
	template 	: "#sucursalesList",
	singular 	: "sucursal",
	url 		: "sucursales",
	urlParams 	: {},
	crud_URL : "/sucursales/read",
	init : function(){
		console.log("inicalizando")
		var rObj = template.render("#loaderT",'#subContent',{txtBt:"Cargando datos...",loader:loaderC});
		ctrl_app.suscribe('ctrl_sucursales');		
		mainC.loadTInit(ctrl_sucursales.read,templateList);
	},	
	pageParams : function(){
		var params = {};
		ctrl_sucursales.urlParams = utils.getURLparams();
		params.pn 			= ctrl_sucursales.urlParams.pn || 1;		// Page Number
		params.rpp			= ctrl_sucursales.urlParams.rpp || 10;	// Records Per Page
		params.si 			= ctrl_sucursales.urlParams.si || 'tipo';	// Sort Index
		params.sd 			= ctrl_sucursales.urlParams.sd || 'DESC';		// Sort Dir
		params.q			= ctrl_sucursales.urlParams.q || "";		// Query 
		
		return params ;
	},
	read : function(){
		var params = ctrl_sucursales.pageParams();
		dbC.query(ctrl_sucursales.crud_URL,"POST",params,ctrl_sucursales.read_Return)
	},
	read_Return: function(result){
		ctrl_sucursales.render(result);
	},
	remove: function(_id){
		dbC.query("/sucursales/remove","POST",{_id:_id},ctrl_sucursales.remove_Return)
	},
	remove_Return : function(e){
		ctrl_sucursales.read();
		createGrowl("Group info","Registro borrado con éxito",false,'bg_ok','borrado',3000);

	},
	render : function(result){

	var tableDef = [
			{name : "Nombre",field:"nombre",classC:"thLeft tdForceW",width:'10%'},
			{name : "Teléfono",field:"telefono",classC:"thLeft tdForceW",width:'10%'},
			{name : "Dirección",field:"direccion",classC:"thLeftr",width:'30%'},
			{name : "Mapa",field:"url",classC:"hide-for-small-only",width:'20%'},
			
			
		]	

		var perms = ctrl_app.getPerms(ctrl_sucursales.url);

		console.log(perms,"perms")

		if(perms.del){
			tableDef.unshift( {name : "",field:"borrar",classC:"thCenter ",width:'20px'});
		}		


		var resObj = {	data:result.data,
						tableDef : tableDef,
						userInfo	: ctrl_app.session.userInfo,
						pageInfo 	: result.pageInfo,
						info 		: { totalCount:result.totalCount },
						pills 		: mainC.genPills(result.pageInfo,ctrl_sucursales),
						perms 		: perms,

					};

		var rObj = template.render(ctrl_sucursales.template,'#subContent',resObj);

		if(resObj.data.length>0){
			mainC.genPagination(resObj.pageInfo)	
			var rObj = template.render(ctrl_sucursales.template,'#subContent',resObj);


			rObj.on('rowClick',function(event){
				window.history.pushState({},ctrl_sucursales.singular,"/app/empresa/"+ ctrl_sucursales.singular + "?_id="+ event.context._id);
				ctrl_app.getRoute();
			})

			// Pagination Controls  
			rObj.on('pageClick', function ( event ) {
				var newURL = utils.setURL({'pn':event.context.pn})
				utils.changeURL(newURL);
				ctrl_sucursales.read();
			});

			rObj.on('tableHover', function( event ){
				if(event.hover){
					$('#delDiv_'+ event.context._id).show()	
				}else{
					$('#delDiv_'+ event.context._id).hide()
				}
				
			});


			rObj.on('searchQ', function( event ){
				var newURL = utils.setURL({'q':event.node.value,'pn':1});
				utils.changeURL(newURL);
				ctrl_sucursales.read();
			});

			rObj.on('searchB', function( event ){
				console.log("sarchB",$('#buscador').val())
				var newURL = utils.setURL({'q':$('#buscador').val(),'pn':1});
				utils.changeURL(newURL);
				ctrl_sucursales.read();
			});

			rObj.on('deleteRecord',function(event){
				

				var item = $('#del_' + event.get('_id'));
				$('#del_' + event.context._id).append('<div hidden id="pop_'+ event.context._id +'"></div')
				var modal = template.render('#deleteT','#pop_'+ event.context._id,{_id:event.context._id,desc:"¿Borrar registro?"});
				createPopAction($('#pop_'+ event.context._id),item)

				modal.on('confirm',function(event){	
					console.log("confirmado",event.context)
					 ctrl_sucursales.remove(event.context._id)
				})
				modal.on('cancel',function(event){	
					 $('.qtip-modal').qtip('hide');
				})
			})

			rObj.on('orderCol',function(event){
				
				var p = ctrl_sucursales.pageParams();
				(p.sd=="ASC") ? p.sd="DESC" : p.sd="ASC";
				var newURL = utils.setURL({'si':event.context.field,"sd": p.sd})
				utils.changeURL(newURL);
				ctrl_sucursales.read();
			})

		
			rObj.on('exportExcel',function(e){
					exportToExcel($('#tb1').html(),ctrl_sucursales.url + "_" + new Date());
			})

			rObj.on('rppChange',function(e){
				console.log(e.context)
					var newURL = utils.setURL({'rpp': $('#rpp option:selected').val()})
				utils.changeURL(newURL);
				ctrl_sucursales.read();
			})
			

		} else{
			// Genera mensaje listado vacio;
			resObj.empty = true;
			var rObj = template.render(ctrl_sucursales.template,'#subContent',resObj);
			
		}

		rObj.on('addRecord',function(event){
			window.history.pushState({},ctrl_sucursales.singular,"/app/empresa/"+ ctrl_sucursales.singular);
			ctrl_app.getRoute();
		})

		rObj.on('pillClose',function(event){
			var newURL = utils.removeParam(event.context.param)
			utils.changeURL(newURL);
			ctrl_sucursales.read();
		})


		//$('#tb1').stacktable({myClass:'responsive'});
		// Render Footer
		//template.render('#footerT','#footer',resObj)
		

	}
}







ctrl_sucursales.init()
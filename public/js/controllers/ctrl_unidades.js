/*-----------------------------------------------------------------------------------
	TODO 
	
	DAtos default por tipo de vehiculo
	añadir simulador default con tu sucursal y poder abrir uno mas grande para que sea claro
	


	Preferencias de Búsuqedas y avisos

	Búsquedas 
		- Todo desde un origen o un destino
		- Tipo de Vehiculo 



Pasos Búsqueda
	
	- traer 
	- traer datos de trayecto


-------------------------------------------------------------------------------------*/
var templateList = [
   '/templates/t_unidadesList.html',
]


var ctrl_unidades = {
	template 	: "#unidadesList",
	singular 	: "unidad",
	url 		: "unidades",
	urlParams 	: {},
	crud_URL : "/unidades/read",
	init : function(){
		console.log("inicalizando")
		ctrl_unidades.rObj = template.render("#loaderT",'#subContent',{txtBt:"Cargando datos...",loader:loaderC});
		ctrl_app.suscribe('ctrl_unidades');		
		mainC.loadTInit(ctrl_unidades.read_Categorias,templateList);
	},	
	pageParams : function(){
		var params = {};
		ctrl_unidades.urlParams = utils.getURLparams();
		params.pn 			= ctrl_unidades.urlParams.pn || 1;		// Page Number
		params.rpp			= ctrl_unidades.urlParams.rpp || 50;	// Records Per Page
		params.si 			= ctrl_unidades.urlParams.si || 'tipo';	// Sort Index
		params.sd 			= ctrl_unidades.urlParams.sd || 'DESC';		// Sort Dir
		params.q			= ctrl_unidades.urlParams.q || "";		// Query 
		
		return params ;
	},
	read_Categorias(){
		dbC.query("/user/categorias","GET",{},ctrl_unidades.catRet)
	},
	catRet(result){
		categorias = result;
		ctrl_unidades.read()
	},
	read : function(){
		var params = ctrl_unidades.pageParams();
		dbC.query(ctrl_unidades.crud_URL,"POST",params,ctrl_unidades.read_Return)
	},
	refresh : function(){
		console.log("refrescando")
		var params = ctrl_unidades.pageParams();
		dbC.query(ctrl_unidades.crud_URL,"POST",params,function(result){
			ctrl_unidades.rObj.set('data',result.data)
		})
	},
	read_Return: function(result){
		ctrl_unidades.render(result);
	},
	remove: function(_id){
		dbC.query("/unidades/remove","POST",{_id:_id},ctrl_unidades.remove_Return)
	},
	remove_Return : function(e){
		ctrl_unidades.read();
		createGrowl("Group info","Registro borrado con éxito",false,'bg_ok','borrado',3000);

	},

	render : function(result){

	var tableDef = [
			{name : "Tipo",field:"path",classC:"thCenter tdForceW hide-for-small-only",width:'6%'},
			{name : "Marca",field:"marca",classC:"thLeft hide-for-small-only tdForceW",width:'10%'},
			{name : "Modelo",field:"modelo",classC:"thLeft hide-for-small-only tdForceW",width:'10%'},
			{name : "Placas",field:"placas",classC:"thLeft tdForceW",width:'10%'},
			{name : "Sucursal",field:"ejes",classC:"thLeft tdForceW",width:'20%'},
			{name : "Publicación",field:"",classC:"thLeft tdForceW ",width:'20%'},
			
		]	

		var perms = ctrl_app.getPerms(ctrl_unidades.url);

		console.log(perms,"perms")

		if(perms.del){
			tableDef.unshift( {name : "",field:"borrar",classC:"collapse thCenter tdForceW ",width:'20px'});
		}		


		var resObj = {	data:result.data,
						tableDef : tableDef,
						userInfo	: ctrl_app.session.userInfo,
						pageInfo 	: result.pageInfo,
						info 		: { totalCount:result.totalCount },
						pills 		: mainC.genPills(result.pageInfo,ctrl_unidades),
						perms 		: perms,

					};

		ctrl_unidades.rObj = template.render(ctrl_unidades.template,'#subContent',resObj);

		if(resObj.data.length>0){
			mainC.genPagination(resObj.pageInfo)	
			ctrl_unidades.rObj = template.render(ctrl_unidades.template,'#subContent',resObj);


			ctrl_unidades.rObj.on('rowClick',function(event){
				//limitar edición si esta publicado
				if(event.context.estatus==1){
					ctrl_unidades.modal = template.render('#editarT', '#modal', {id:1,data:{}});
      
            	createModal($('#editar'))

				ctrl_unidades.modal.on('cancel',function(event){	
					 $('.qtip-modal').qtip('hide');
				})


				}else{
					window.history.pushState({},ctrl_unidades.singular,"/app/empresa/"+ ctrl_unidades.singular + "?_id="+ event.context._id);
					ctrl_app.getRoute();
				}
				
			})

			// Pagination Controls  
			ctrl_unidades.rObj.on('pageClick', function ( event ) {
				var newURL = utils.setURL({'pn':event.context.pn})
				utils.changeURL(newURL);
				ctrl_unidades.read();
			});

			ctrl_unidades.rObj.on('tableHover', function( event ){
				if(event.hover){
					$('#delDiv_'+ event.context._id).show()	
				}else{
					$('#delDiv_'+ event.context._id).hide()
				}
				
			});


			ctrl_unidades.rObj.on('searchQ', function( event ){
				var newURL = utils.setURL({'q':event.node.value,'pn':1});
				utils.changeURL(newURL);
				ctrl_unidades.read();
			});

			ctrl_unidades.rObj.on('searchB', function( event ){
				console.log("sarchB",$('#buscador').val())
				var newURL = utils.setURL({'q':$('#buscador').val(),'pn':1});
				utils.changeURL(newURL);
				ctrl_unidades.read();
			});

			ctrl_unidades.rObj.on('deleteRecord',function(event){
				

				var item = $('#del_' + event.get('_id'));
				$('#del_' + event.context._id).append('<div hidden id="pop_'+ event.context._id +'"></div')
				var modal = template.render('#deleteT','#pop_'+ event.context._id,{_id:event.context._id});
				createPopAction($('#pop_'+ event.context._id),item)

				modal.on('confirm',function(event){	
					console.log("confirmado",event.context)
					 ctrl_unidades.remove(event.context._id)
				})
				modal.on('cancel',function(event){	
					 $('.qtip-modal').qtip('hide');
				})
			})

			ctrl_unidades.rObj.on('orderCol',function(event){
				
				var p = ctrl_unidades.pageParams();
				(p.sd=="ASC") ? p.sd="DESC" : p.sd="ASC";
				var newURL = utils.setURL({'si':event.context.field,"sd": p.sd})
				utils.changeURL(newURL);
				ctrl_unidades.read();
			})

		
			ctrl_unidades.rObj.on('exportExcel',function(e){
					exportToExcel($('#tb1').html(),ctrl_unidades.url + "_" + new Date());
			})

			ctrl_unidades.rObj.on('rppChange',function(e){
				console.log(e.context)
					var newURL = utils.setURL({'rpp': $('#rpp option:selected').val()})
				utils.changeURL(newURL);
				ctrl_unidades.read();
			})

			// publicación
			ctrl_unidades.rObj.on('publicar',function(e){

				
				 ctrl_unidades.modal = template.render('#publicacionT', '#modal', {id:1,data:{}});
      
	            createModal($('#publicacion'))
	            console.log(e.context,"CONTEXTO A PASAR ")
	             ctrl_pubGen.init(e.context);

	           
			});


			ctrl_unidades.rObj.on('verPub',function(e){
				window.open("/publicacion/" + e.context.pubID,'_blank' );
			});

			ctrl_unidades.rObj.on('quitarPub',function(event){

				ctrl_unidades.modal = template.render('#quitarT', '#modal', {id:1,data:{}});
      
            	createModal($('#quitar'))

				ctrl_unidades.modal.on('confirm',function(eventModal){	
					console.log("confirmado",event.context)
					 ctrl_unidades.quitarPub(event.context._id,event.context.pubID)
				})
				ctrl_unidades.modal.on('cancel',function(event){	
					 $('.qtip-modal').qtip('hide');
				})
			});


			

		} else{
			// Genera mensaje listado vacio;
			resObj.empty = true;
			ctrl_unidades.rObj = template.render(ctrl_unidades.template,'#subContent',resObj);
			
		}

		ctrl_unidades.rObj.on('addRecord',function(event){
			window.history.pushState({},ctrl_unidades.singular,"/app/empresa/"+ ctrl_unidades.singular);
			ctrl_app.getRoute();
		})

		ctrl_unidades.rObj.on('pillClose',function(event){
			var newURL = utils.removeParam(event.context.param)
			utils.changeURL(newURL);
			ctrl_unidades.read();
		})


		//$('#tb1').stacktable({myClass:'responsive'});
		// Render Footer
		//template.render('#footerT','#footer',resObj)
		

	},
	quitarPub : function(idUnidad,idPub){
		var data = {
			idPub : idPub,
			idUnidad : idUnidad
		 }
		dbC.query("/publicacion/quitar","POST",{data:data},ctrl_unidades.quitarRet)

	},
	quitarRet : function(){
		console.log("regreso ")
		ctrl_unidades.refresh();
		$('.qtip-modal').qtip('hide');
	}
}







ctrl_unidades.init()
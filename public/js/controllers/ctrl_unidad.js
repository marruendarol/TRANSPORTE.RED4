/*-----------------------------------------------------------------------------------
	TODO 

 Error al no ser camion pide los requeridos ocultos 
 Al marcar extras no aparece el campo ni la unidad
 Autocotizar no


-------------------------------------------------------------------------------------*/

var templateList = [
   '/templates/t_detailUnidad.html',
]


var ctrl_unidades = {
    data : {},
    changes : false,
	init : function(){
        var rObj = template.render("#loaderT",'#subContent',{txtBt:"Cargando datos...",loader:loaderC});
        ctrl_unidades.urlParams = utils.getURLparams();
        ctrl_unidades._id = ctrl_unidades.urlParams._id;
		    mainC.loadTInit(ctrl_unidades.getModel,templateList);
    },
    getModel : function(){
    	dbC.query('/unidades/model',"GET",{},ctrl_unidades.modelRet)
    },
    modelRet : function(res){
    	ctrl_unidades.model = res;
        if(ctrl_unidades._id!=undefined){
            ctrl_unidades.mode = 0; // Edición
            ctrl_unidades.getData();    
        }else{
            ctrl_unidades.mode = 1; // Creación
            ctrl_unidades.render()
        }	
    },
    getData : function(){
    	dbC.query('/unidades/item/'+ ctrl_unidades._id,"GET",{},ctrl_unidades.dataRet)
    },
    dataRet : function(res){
    	ctrl_unidades.data = res;
    	ctrl_unidades.render();
    },
	render:function(){
        // RENDER
        console.log("rendering formulario")

    // Set Default Autocotizar    
    if(ctrl_unidades.data.autocotizar==undefined){
            ctrl_unidades.data.autocotizar = 1;
        }
    // If servicios emmpty
     if(ctrl_unidades.data.servicios==undefined){
        ctrl_unidades.data.servicios= []
     }

      if(ctrl_unidades.data.carac==undefined){
        ctrl_unidades.data.carac =  []
     }

		ctrl_unidades.rObj = template.render('#mainbT','#subContent',{
            llaves : Object.keys(ctrl_unidades.model),
            model:ctrl_unidades.model,
            data:ctrl_unidades.data,
            mode:ctrl_unidades.mode,
            title: (ctrl_unidades.mode==1) ? "Alta de unidad" : "Editar unidad",
            list : "Unidades"
        });

    ctrl_unidades.rObj.set('data.autotcotizar',1);

        // EVENTS
        ctrl_unidades.rObj.on('dataChange',function(event){
             ctrl_unidades.setChange();
             //var dato = {}
            // var recPath = key.slice(6);
            //dato[recPath] = this.get('data.'+recPath);
           // console.log(dato)
           // socket.emit('updateExp',{room:userRoom,data : dato,_id:that._id});
           // createGrowl("Group info","Guardando...",false,'bg_ok','guardando',1000);
        });


         ctrl_unidades.rObj.on('optionSet',function(event){
            setTimeout(function(){ setSliders(ctrl_unidades.rObj,true);},200)
           
            //ctrl_unidades.rObj.set('data.'+ event.key.num , event.context.val)
        });

        ctrl_unidades.rObj.on('blur',function(event){
            ctrl_unidades.setChange();
            ctrl_unidades.validateOne(event);
        });

        ctrl_unidades.rObj.on('submit',function(event){
            ctrl_unidades.validate();
        });


        $('#tree').jstree({
        'core' : {
            'check_callback': true,
            multiple : false,
            'strings' : { 'Loading ...' : 'Cargando...' },
            'data' : {
                "url" : "/user/categorias",
                "dataType" : "json" ,
                 'data' : function (node) {
                    console.log(node,"NODO DATOS")
                    return { 'id' : node.id, 'text':node.nombre, 'tipoClase' : node.tipoClase };
                  }
            }
            }
        }) 

       

        $('#tree').on('changed.jstree', function (e, data) {
        var i, j, r= [];
        var path = [];
        for(i = 0, j = data.selected.length; i < j; i++) {
         path.push(data.instance.get_path(data.selected[i]))
          r.push(data.instance.get_node(data.selected[i]));
        }

        console.log(r[0])
        //ctrl_unidades.setChange();
        ctrl_unidades.rObj.set('data.tipo',parseInt(r[0].id));
        ctrl_unidades.rObj.set('data.tipoClase',parseInt(r[0].original.tipoClase));
        ctrl_unidades.rObj.set('data.tipoImg',r[0].original.icon);
        ctrl_unidades.rObj.set('data.path',path[0].join(" > "));
        setSliders(ctrl_unidades.rObj,true);


        }).jstree();

    
      $('#tree').on('activate_node.jstree', function(e, data) {

          if(!data.instance.is_leaf(data.node)) {
             try{ data.instance.open_node(data.node) } catch(e){}
             data.instance.deselect_node(data.node, true);
          }
        });

       $('#tree').on("loaded.jstree", function (e, data) { data.instance.select_node(ctrl_unidades.data.tipo); });

      // Cambios Alerta -------------------------------------------------------
      window.onbeforeunload = function (e) {
            if(ctrl_unidades.changes){
                var message = "tiene cambios por guardar, esta seguro que desea salir?",
                  e = e || window.event;
                  // For IE and Firefox
                  if (e) {
                    e.returnValue = message;
                  }
                  // For Safari
                  return message;
            }
  
        }


 
        //-- POPs 
        ctrl_unidades.rObj.on('popOver',function(event,key){
          //$('.popit').remove();
          var item = $('#pop_' + key).append('<div hidden class="popit" id="popit_'+ key +'"></div')
          var modal = template.render('#popT','#popit_'+ key,{id:key,desc:event.context.popInfo});
          createPop($('#popit_'+ key),item)
        })
      
      
      ctrl_unidades.getExtras();
      ctrl_unidades.getCarac();
      // mask input activate dwe  ---------------------------------------------
      setMasks();
      // Slider ------------------------------------------------------------------------------
      setSliders(ctrl_unidades.rObj);
      //--------------------------------------------------------------------------------------  
      setPops();
    
        var comboSucursal = new dhtmlXComboFromSelect("combo_sucursal");
        comboSucursal.enableFilteringMode(true);
        comboSucursal.autoOptionSize=true;
        comboSucursal.allowFreeText(false);
        comboSucursal.attachEvent("onChange", function(value, text, loc){
          ctrl_unidades.rObj.set('data.sucursal',value)
          ctrl_unidades.rObj.set('data.sucursalDesc',text)

          var sucLoc = JSON.search(this.res,'//*[value="'+ value +'"]')
          ctrl_unidades.rObj.set('data.sucursalLoc',sucLoc[0].loc);

          });
        ctrl_unidades.populate(comboSucursal,'/bases/bases',ctrl_unidades.data.sucursal);

        var comboMarca = new dhtmlXComboFromSelect("combo_marca");
        comboMarca.enableFilteringMode(true);
        comboMarca.autoOptionSize=true;
        comboMarca.allowFreeText(false);
        comboMarca.attachEvent("onChange", function(value, text){ 
          ctrl_unidades.rObj.set('data.marca',value)

          ctrl_unidades.getModelos(value)
         });
        ctrl_unidades.populate(comboMarca,'/unidades/getCamionesMarca',ctrl_unidades.data.marca);

        comboModelo = new dhtmlXComboFromSelect("combo_modelo");
        comboModelo.enableFilteringMode(true);
        comboModelo.allowFreeText(false);
        comboModelo.attachEvent("onChange", function(value, text){ ctrl_unidades.rObj.set('data.modelo',value) });
        if(ctrl_unidades.data.marca!=undefined){
            ctrl_unidades.getModelos(ctrl_unidades.data.marca,ctrl_unidades.data.modelo)
        }
        

        var comboCombus = new dhtmlXComboFromSelect("combo_tipogas");
        comboCombus.enableFilteringMode(true);
        comboCombus.allowFreeText(false);
        comboCombus.attachEvent("onChange", function(value, text){ ctrl_unidades.rObj.set('data.tipogas',value) });
        ctrl_unidades.populate(comboCombus,'/user/tipogas',ctrl_unidades.data.tipogas || 1);


        // Extra Select
        ctrl_unidades.rObj.on('selExtra',function(event,key){
          try{
            var item = JSON.search(ctrl_unidades.rObj.get('data.servicios'),'//*[id="'+event.context.id+'"]')  ;

            var arr = ctrl_unidades.rObj.get('data.servicios')
          for (var i = 0; i < arr.length; i++) {
            if(arr[i].id == event.context.id){
                indexS = i;

            }
          }


          if(item.length==0){
             ctrl_unidades.rObj.push('data.servicios',event.context);
          }else{
             ctrl_unidades.rObj.splice('data.servicios',indexS,1);
          }
           setMasks();

           
          } catch (e){}
          
          // get 
          //ctrl_unidades.rObj.set('extras.'+event.index.num+".selected",1)

          
        })


        // Carac Sel
        ctrl_unidades.rObj.on('selCarac',function(event,key){

          console.log("sel Carac")
          try{
            var item = JSON.search(ctrl_unidades.rObj.get('data.carac'),'//*[id="'+event.context.id+'"]')  ;

            var arr = ctrl_unidades.rObj.get('data.carac')
          for (var i = 0; i < arr.length; i++) {
            if(arr[i].id == event.context.id){
                indexS = i;

            }
          }


          if(item.length==0){
             ctrl_unidades.rObj.push('data.carac',event.context);
          }else{
             ctrl_unidades.rObj.splice('data.carac',indexS,1);
          }
          } catch (e){}
          
        })
        // Default autocotizar
        
        

        

	  },
    getModelos : function(value,defaultValue){
              comboModelo.clearAll();
       dbC.query('/unidades/getCamionesModelo?marca='+value,"GET",{},function(res){
             comboModelo.addOption(res) 
                if(defaultValue!=undefined){
             comboModelo.setComboValue(defaultValue);
           }  
             
       })
    },
    getExtras : function(){
       dbC.query('/user/extras',"GET",{},function(res){
          console.log("res extras",res)
            ctrl_unidades.rObj.set('extras',res);
            setMasks();
       })
    },
    getCarac : function(){
       dbC.query('/user/carac',"GET",{},function(res){
          console.log("res carac",res)
            ctrl_unidades.rObj.set('caracl',res);;
       })
    },
    populate : function(combo,url,defaultValue,params){
       dbC.query(url,"GET",params || {},function(res){
            combo.res = res;
            combo.addOption(res) 
            combo.setComboValue(defaultValue)
       })
    },
    setChange : function(){
        ctrl_unidades.changes = true;
        ctrl_unidades.btEnable();
    },
     btEnable : function(){
        $('#btSave').removeClass('disabled');
       // TweenLite.to('#btSave', 0.5, {backgroundColor:"#F06F00", opacity: 1, ease:Power3.easeOut});
    },
    btDisable : function(){
        $('#btSave').addClass('disabled');
        //TweenLite.to('#btSave', 0.5, {backgroundColor:"#666666", opacity: 1, ease:Power3.easeOut});
    },
    validate : function(){
        var err = [];
        for (var a in ctrl_unidades.model){
            var item = ctrl_unidades.model[a];
            var data = ctrl_unidades.rObj.get('data.'+ a);
            $('#err_'+ a).empty();
            if(item.matchP!=undefined){
                reg = new RegExp(item.matchP.pattern,"i");
                 if(!reg.exec(data)){ 
                    var msg = createAlertDiv('#err_'+ a,"Create Error",item.matchP.desc,true,'bg_error','qtipErrSign');
                    err.push(item.matchP)                   
                 }else{
                    
                 }     
            } 
        }
        if(err.length==0){
            if(ctrl_unidades._id==undefined){
                ctrl_unidades.save();    
            }else{
                ctrl_unidades.update();
            }
        }
    },
    validateOne: function(item){
        var err = [];
        var key = item.keypath.slice(6);
        var data = ctrl_unidades.rObj.get('data.'+ key);

        $('#err_'+ key).empty();

        reg = new RegExp(item.context.matchP.pattern,"i");
             if(!reg.exec(data)){ 
                
                var msg = createAlertDiv('#err_'+ key,"Create Error",item.context.matchP.desc,true,'bg_error','qtipErrSign');
                err.push(item.context.matchP)                   
             }else{
                
             }     
    },
    save : function(){      
        var data = {data: ctrl_unidades.rObj.get('data')};
        dbC.query('/unidades/save',"POST",data,ctrl_unidades.saveRet)
    },
    update : function(){
         var data = {data: ctrl_unidades.rObj.get('data')};
         delete data.data._id;
         dbC.query('/unidades/update/'+ ctrl_unidades._id,"POST",data,ctrl_unidades.saveRet);
    },
    saveRet : function(){
        createGrowl("Group info","Registro guardado con exito.",false,'bg_ok','guardando');
        window.history.pushState({},"/app/empresa/unidades","/app/empresa/unidades");
        window.scrollTo(0,0);
        ctrl_app.getRoute();
    },
    

}


ctrl_unidades.init()
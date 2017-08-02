/*-----------------------------------------------------------------------------------
	TODO 

 

-------------------------------------------------------------------------------------*/

var templateList = [
   '/templates/t_detail.html',
]


var ctrl_dispositivos = {
    data : {direccion:[]},
    changes : false,
	init : function(){
        var rObj = template.render("#loaderT",'#subContent',{txtBt:"Cargando datos...",loader:loaderC});
        ctrl_dispositivos.urlParams = utils.getURLparams();
        ctrl_dispositivos._id = ctrl_dispositivos.urlParams._id;
		    mainC.loadTInit(ctrl_dispositivos.getModel,templateList);
    },
    getModel : function(){
    	dbC.query('/dispositivos/model',"GET",{},ctrl_dispositivos.modelRet)
    },
    modelRet : function(res){
    	ctrl_dispositivos.model = res;
        if(ctrl_dispositivos._id!=undefined){
            ctrl_dispositivos.mode = 0; // Edición
            ctrl_dispositivos.getData();    
        }else{
            ctrl_dispositivos.mode = 1; // Creación

            ctrl_dispositivos.render()
        }	
    },
    getData : function(){
    	dbC.query('/dispositivos/item/'+ ctrl_dispositivos._id,"GET",{},ctrl_dispositivos.dataRet)
    },
    dataRet : function(res){
    	ctrl_dispositivos.data = res;
    	ctrl_dispositivos.render();
    },
	 render:function(){
        // RENDER
        
        // PRE FILL



		    ctrl_dispositivos.rObj = template.render('#mainbT','#subContent',{model:ctrl_dispositivos.model,
            data:ctrl_dispositivos.data,
            mode:ctrl_dispositivos.mode,
            title: (ctrl_dispositivos.mode==1) ? "Alta de dispositivo" : "Editar dispositivo",
            list : "dispositivos"
        });

        // EVENTS
        ctrl_dispositivos.rObj.on('dataChange',function(event){
             ctrl_dispositivos.setChange();
        });

        ctrl_dispositivos.rObj.on('blur',function(event){
            ctrl_dispositivos.setChange();
            ctrl_dispositivos.validateOne(event);
        });

        ctrl_dispositivos.rObj.on('submit',function(event){
            ctrl_dispositivos.validate();
        });

        ctrl_dispositivos.rObj.on('deleteAddr',function(event){

          var item = $('#del_' + event.context.id);
        $('#del_' + event.context.id).append('<div hidden id="pop_'+ event.context.id +'"></div')
        var modal = template.render('#deleteT','#pop_'+ event.context.id,{id:event.context.id,desc:"¿Borrar Dirección?"});
        createPopAction($('#pop_'+ event.context.id),item)

        modal.on('confirm',function(event){ 

          var dirs = ctrl_dispositivos.rObj.get('data.direccion')

            for (var i = 0; i < dirs.length; i++) {
              if(dirs[i].id==event.context.id){
                console.log(i,"encontro")
                ctrl_dispositivos.rObj.splice('data.direccion',i,1);
              }
            }
        })
        modal.on('cancel',function(event){  
           $('.qtip-modal').qtip('hide');
        })


          
        });

      // Cambios Alerta -------------------------------------------------------
      window.onbeforeunload = function (e) {
            if(ctrl_dispositivos.changes){
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

      // mask input activate dwe  ---------------------------------------------
      setMasks();
      // Slider ------------------------------------------------------------------------------
      //setSliders(ctrl_dispositivos.rObj);
      //--------------------------------------------------------------------------------------  
      setPops();

      // Invoke Map 
      ctrl_dispositivos.rObj.on('addAddr',function(){

      ctrl_dispositivos.modal = template.render('#mapaT', '#modal', {id:1,data:{}});
      
            createModal($('#mapa'))
            gGeo.init(1,20.530691,-100.810774);

            ctrl_dispositivos.modal.on('saveAddr', function(event) {
                
                staticImage(function(){
                     $('.qtip-modal').qtip('hide');
                      ctrl_dispositivos.rObj.push('data.direccion',gGeo.finalAddr);
                })
                 
                

            })

            ctrl_dispositivos.modal.on('cancel', function() {
                $('.qtip-modal').qtip('hide');
            })

    });


	  },
    populate : function(combo,url,defaultValue){
       dbC.query(url,"GET",{},function(res){
                combo.addOption(res) 
                combo.setComboValue(defaultValue)
       })
    },
    setChange : function(){
        ctrl_dispositivos.changes = true;
        ctrl_dispositivos.btEnable();
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
        for (var a in ctrl_dispositivos.model){
            var item = ctrl_dispositivos.model[a];
            var data = ctrl_dispositivos.rObj.get('data.'+ a);
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
            if(ctrl_dispositivos._id==undefined){
                ctrl_dispositivos.save();    
            }else{
                ctrl_dispositivos.update();
            }
        }
    },
    validateOne: function(item){
        var err = [];
        var key = item.keypath.slice(6);
        var data = ctrl_dispositivos.rObj.get('data.'+ key);

        $('#err_'+ key).empty();

        reg = new RegExp(item.context.matchP.pattern,"i");
             if(!reg.exec(data)){ 
                
                var msg = createAlertDiv('#err_'+ key,"Create Error",item.context.matchP.desc,true,'bg_error','qtipErrSign');
                err.push(item.context.matchP)                   
             }else{
                
             }     
    },
    save : function(){      
        var data = {data: ctrl_dispositivos.rObj.get('data')};
        console.log(data,"data")
        dbC.query('/dispositivos/save',"POST",data,ctrl_dispositivos.saveRet)
    },
    update : function(){
         var data = {data: ctrl_dispositivos.rObj.get('data')};
         delete data.data._id;
         dbC.query('/dispositivos/update/'+ ctrl_dispositivos._id,"POST",data,ctrl_dispositivos.saveRet);
    },
    saveRet : function(){
        createGrowl("Group info","Registro guardado con exito.",false,'bg_ok','guardando');
        window.history.pushState({},"/app/flotilla/dispositivos","/app/flotilla/dispositivos");
        window.scrollTo(0,0);
        ctrl_app.getRoute();
    }

}


ctrl_dispositivos.init()
/*-----------------------------------------------------------------------------------
	TODO 

 

-------------------------------------------------------------------------------------*/

var templateList = [
   '/templates/t_detail.html',
]


var ctrl_sucursales = {
    data : {direccion:[]},
    changes : false,
	init : function(){
        var rObj = template.render("#loaderT",'#subContent',{txtBt:"Cargando datos...",loader:loaderC});
        ctrl_sucursales.urlParams = utils.getURLparams();
        ctrl_sucursales._id = ctrl_sucursales.urlParams._id;
		    mainC.loadTInit(ctrl_sucursales.getModel,templateList);
    },
    getModel : function(){
    	dbC.query('/sucursales/model',"GET",{},ctrl_sucursales.modelRet)
    },
    modelRet : function(res){
    	ctrl_sucursales.model = res;
        if(ctrl_sucursales._id!=undefined){
            ctrl_sucursales.mode = 0; // Edición
            ctrl_sucursales.getData();    
        }else{
            ctrl_sucursales.mode = 1; // Creación

            ctrl_sucursales.render()
        }	
    },
    getData : function(){
    	dbC.query('/sucursales/item/'+ ctrl_sucursales._id,"GET",{},ctrl_sucursales.dataRet)
    },
    dataRet : function(res){
    	ctrl_sucursales.data = res;
    	ctrl_sucursales.render();
    },
	 render:function(){
        // RENDER
        
        // PRE FILL



		    ctrl_sucursales.rObj = template.render('#mainbT','#subContent',{model:ctrl_sucursales.model,
            data:ctrl_sucursales.data,
            mode:ctrl_sucursales.mode,
            title: (ctrl_sucursales.mode==1) ? "Alta de sucursal" : "Editar sucursal",
            list : "sucursales"
        });

        // EVENTS
        ctrl_sucursales.rObj.on('dataChange',function(event){
             ctrl_sucursales.setChange();
        });

        ctrl_sucursales.rObj.on('blur',function(event){
            ctrl_sucursales.setChange();
            ctrl_sucursales.validateOne(event);
        });

        ctrl_sucursales.rObj.on('submit',function(event){
            ctrl_sucursales.validate();
        });

        ctrl_sucursales.rObj.on('deleteAddr',function(event){

          var item = $('#del_' + event.context.id);
        $('#del_' + event.context.id).append('<div hidden id="pop_'+ event.context.id +'"></div')
        var modal = template.render('#deleteT','#pop_'+ event.context.id,{id:event.context.id,desc:"¿Borrar Dirección?"});
        createPopAction($('#pop_'+ event.context.id),item)

        modal.on('confirm',function(event){ 

          var dirs = ctrl_sucursales.rObj.get('data.direccion')

            for (var i = 0; i < dirs.length; i++) {
              if(dirs[i].id==event.context.id){
                console.log(i,"encontro")
                ctrl_sucursales.rObj.splice('data.direccion',i,1);
              }
            }
        })
        modal.on('cancel',function(event){  
           $('.qtip-modal').qtip('hide');
        })


          
        });

      // Cambios Alerta -------------------------------------------------------
      window.onbeforeunload = function (e) {
            if(ctrl_sucursales.changes){
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
      setSliders(ctrl_sucursales.rObj);
      //--------------------------------------------------------------------------------------  
      setPops();

      // Special Mask
       Inputmask({mask:["(55)99999999","(33)99999999","(81)99999999","(999)9999999"],'autoUnmask': true}).mask($('.phoneMex'));

      // Invoke Map 
      ctrl_sucursales.rObj.on('addAddr',function(){

      ctrl_sucursales.modal = template.render('#mapaT', '#modal', {id:1,data:{}});
      
            createModal($('#mapa'))
            gGeo.init(1,20.530691,-100.810774);

            ctrl_sucursales.modal.on('saveAddr', function(event) {
                
                staticImage(function(){
                     $('.qtip-modal').qtip('hide');
                      ctrl_sucursales.rObj.push('data.direccion',gGeo.finalAddr);
                })
                 
                

            })

            ctrl_sucursales.modal.on('cancel', function() {
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
        ctrl_sucursales.changes = true;
        ctrl_sucursales.btEnable();
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
        for (var a in ctrl_sucursales.model){
            var item = ctrl_sucursales.model[a];
            var data = ctrl_sucursales.rObj.get('data.'+ a);
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
            if(ctrl_sucursales._id==undefined){
                ctrl_sucursales.save();    
            }else{
                ctrl_sucursales.update();
            }
        }
    },
    validateOne: function(item){
        var err = [];
        var key = item.keypath.slice(6);
        var data = ctrl_sucursales.rObj.get('data.'+ key);

        $('#err_'+ key).empty();

        reg = new RegExp(item.context.matchP.pattern,"i");
             if(!reg.exec(data)){ 
                
                var msg = createAlertDiv('#err_'+ key,"Create Error",item.context.matchP.desc,true,'bg_error','qtipErrSign');
                err.push(item.context.matchP)                   
             }else{
                
             }     
    },
    save : function(){      
        var data = {data: ctrl_sucursales.rObj.get('data')};
        console.log(data,"data")
        dbC.query('/sucursales/save',"POST",data,ctrl_sucursales.saveRet)
    },
    update : function(){
         var data = {data: ctrl_sucursales.rObj.get('data')};
         delete data.data._id;
         dbC.query('/sucursales/update/'+ ctrl_sucursales._id,"POST",data,ctrl_sucursales.saveRet);
    },
    saveRet : function(){
        createGrowl("Group info","Registro guardado con exito.",false,'bg_ok','guardando');
        window.history.pushState({},"/app/flotilla/sucursales","/app/flotilla/sucursales");
        window.scrollTo(0,0);
        ctrl_app.getRoute();
    }

}


ctrl_sucursales.init()
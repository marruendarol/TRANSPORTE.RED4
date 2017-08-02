/*-----------------------------------------------------------------------------------
	TODO 

 

-------------------------------------------------------------------------------------*/

var templateList = [
   '/templates/t_detail.html',
]


var ctrl_base = {
    data : {direccion:[]},
    changes : false,
	init : function(){
        var rObj = template.render("#loaderT",'#subContent',{txtBt:"Cargando datos...",loader:loaderC});
        ctrl_base.urlParams = utils.getURLparams();
        ctrl_base._id = ctrl_base.urlParams._id;
		    mainC.loadTInit(ctrl_base.getModel,templateList);
    },
    getModel : function(){
    	dbC.query('/bases/model',"GET",{},ctrl_base.modelRet)
    },
    modelRet : function(res){
    	ctrl_base.model = res;
        if(ctrl_base._id!=undefined){
            ctrl_base.mode = 0; // Edición
            ctrl_base.getData();    
        }else{
            ctrl_base.mode = 1; // Creación

            ctrl_base.render()
        }	
    },
    getData : function(){
    	dbC.query('/bases/item/'+ ctrl_base._id,"GET",{},ctrl_base.dataRet)
    },
    dataRet : function(res){
    	ctrl_base.data = res;
    	ctrl_base.render();
    },
	 render:function(){
        // RENDER
        
        // PRE FILL



		    ctrl_base.rObj = template.render('#mainbT','#subContent',{model:ctrl_base.model,
            data:ctrl_base.data,
            mode:ctrl_base.mode,
            title: (ctrl_base.mode==1) ? "Alta de base" : "Editar base",
            list : "bases"
        });

        // EVENTS
        ctrl_base.rObj.on('dataChange',function(event){
             ctrl_base.setChange();
        });

        ctrl_base.rObj.on('blur',function(event){
            ctrl_base.setChange();
            ctrl_base.validateOne(event);
        });

        ctrl_base.rObj.on('submit',function(event){
            ctrl_base.validate();
        });

        ctrl_base.rObj.on('deleteAddr',function(event){

          var item = $('#del_' + event.context.id);
        $('#del_' + event.context.id).append('<div hidden id="pop_'+ event.context.id +'"></div')
        var modal = template.render('#deleteT','#pop_'+ event.context.id,{id:event.context.id,desc:"¿Borrar Dirección?"});
        createPopAction($('#pop_'+ event.context.id),item)

        modal.on('confirm',function(event){ 

          var dirs = ctrl_base.rObj.get('data.direccion')

            for (var i = 0; i < dirs.length; i++) {
              if(dirs[i].id==event.context.id){
                console.log(i,"encontro")
                ctrl_base.rObj.splice('data.direccion',i,1);
              }
            }
        })
        modal.on('cancel',function(event){  
           $('.qtip-modal').qtip('hide');
        })


          
        });

      // Cambios Alerta -------------------------------------------------------
      window.onbeforeunload = function (e) {
            if(ctrl_base.changes){
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
      setSliders(ctrl_base.rObj);
      //--------------------------------------------------------------------------------------  
      setPops();

      // Special Mask
       Inputmask({mask:["(55)99999999","(33)99999999","(81)99999999","(999)9999999"],'autoUnmask': true}).mask($('.phoneMex'));

      // Invoke Map 
      ctrl_base.rObj.on('addAddr',function(){

      ctrl_base.modal = template.render('#mapaT', '#modal', {id:1,data:{}});
      
            createModal($('#mapa'))
            gGeo.init(1,20.530691,-100.810774,ctrl_base.modal);

            ctrl_base.modal.on('saveAddr', function(event) {
                
                staticImage(function(){
                     $('.qtip-modal').qtip('hide');
                      ctrl_base.rObj.push('data.direccion',gGeo.finalAddr);
                })
                 
                

            })

            ctrl_base.modal.on('cancel', function() {
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
        ctrl_base.changes = true;
        ctrl_base.btEnable();
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
        for (var a in ctrl_base.model){
            var item = ctrl_base.model[a];
            var data = ctrl_base.rObj.get('data.'+ a);
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
            if(ctrl_base._id==undefined){
                ctrl_base.save();    
            }else{
                ctrl_base.update();
            }
        }
    },
    validateOne: function(item){
        var err = [];
        var key = item.keypath.slice(6);
        var data = ctrl_base.rObj.get('data.'+ key);

        $('#err_'+ key).empty();

        reg = new RegExp(item.context.matchP.pattern,"i");
             if(!reg.exec(data)){ 
                
                var msg = createAlertDiv('#err_'+ key,"Create Error",item.context.matchP.desc,true,'bg_error','qtipErrSign');
                err.push(item.context.matchP)                   
             }else{
                
             }     
    },
    save : function(){      
        var data = {data: ctrl_base.rObj.get('data')};
        console.log(data,"data")
        dbC.query('/bases/save',"POST",data,ctrl_base.saveRet)
    },
    update : function(){
         var data = {data: ctrl_base.rObj.get('data')};
         delete data.data._id;
         dbC.query('/bases/update/'+ ctrl_base._id,"POST",data,ctrl_base.saveRet);
    },
    saveRet : function(){
        createGrowl("Group info","Registro guardado con exito.",false,'bg_ok','guardando');
        window.history.pushState({},"/app/empresa/bases","/app/empresa/bases");
        window.scrollTo(0,0);
        ctrl_app.getRoute();
    }

}


ctrl_base.init()
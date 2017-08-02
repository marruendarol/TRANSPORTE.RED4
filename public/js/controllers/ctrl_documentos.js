/*-----------------------------------------------------------------------------------
	TODO 

 

-------------------------------------------------------------------------------------*/

var templateList = [
   '/templates/t_preferencias.html',
]


var ctrl_pref = {
    data : {},
    changes : false,
	init : function(){
        var rObj = template.render("#loaderT",'#subContent',{txtBt:"Cargando datos...",loader:loaderC});
        ctrl_pref.urlParams = utils.getURLparams();
        ctrl_pref._id = ctrl_pref.urlParams._id;
		    mainC.loadTInit(ctrl_pref.getModel,templateList);
    },
    getModel : function(){
    	dbC.query('/preferencias/model',"GET",{},ctrl_pref.modelRet)
    },
    modelRet : function(res){
    	ctrl_pref.model = res;
        if(ctrl_pref._id!=undefined){
            ctrl_pref.mode = 0; // Edición
            ctrl_pref.getData();    
        }else{
            ctrl_pref.mode = 1; // Creación
            ctrl_pref.render()
        }	
    },
    getData : function(){
    	dbC.query('/preferencias/item/'+ ctrl_pref._id,"GET",{},ctrl_pref.dataRet)
    },
    dataRet : function(res){
    	ctrl_pref.data = res;
    	ctrl_pref.render();
    },
	render:function(){
        // RENDER
        console.log("rendering formulario")
		ctrl_pref.rObj = template.render('#mainbT','#subContent',{model:ctrl_pref.model,
            data:ctrl_pref.data,
            mode:ctrl_pref.mode,
            title: "Preferencias",
            list : "preferencias"
        });

        // EVENTS
        ctrl_pref.rObj.on('dataChange',function(event){
             ctrl_pref.setChange();
             //var dato = {}
            // var recPath = key.slice(6);
            //dato[recPath] = this.get('data.'+recPath);
           // console.log(dato)
           // socket.emit('updateExp',{room:userRoom,data : dato,_id:that._id});
           // createGrowl("Group info","Guardando...",false,'bg_ok','guardando',1000);
        });

         ctrl_pref.rObj.on('optionSet',function(event){
          console.log("SETTING")
            setTimeout(function(){ setSliders(ctrl_pref.rObj,true);},200)
           
            //ctrl_pref.rObj.set('data.'+ event.key.num , event.context.val)
        });

        ctrl_pref.rObj.on('blur',function(event){
            ctrl_pref.setChange();
            ctrl_pref.validateOne(event);
        });

        ctrl_pref.rObj.on('submit',function(event){
            ctrl_pref.validate();
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

       

       
      // Cambios Alerta -------------------------------------------------------
      window.onbeforeunload = function (e) {
            if(ctrl_pref.changes){
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
        ctrl_pref.rObj.on('popOver',function(event,key){
          //$('.popit').remove();
          var item = $('#pop_' + key).append('<div hidden class="popit" id="popit_'+ key +'"></div')
          var modal = template.render('#popT','#popit_'+ key,{id:key,desc:event.context.popInfo});
          createPop($('#popit_'+ key),item)
        })
      
      
      ctrl_pref.getExtras();
      // mask input activate dwe  ---------------------------------------------
      setMasks();
      // Slider ------------------------------------------------------------------------------
      setSliders(ctrl_pref.rObj);
      //--------------------------------------------------------------------------------------  
      setPops();
    
       


        // Extra Select
        ctrl_pref.rObj.on('selExtra',function(event,key){

          console.log(event.index)
          try{
            var item = JSON.search(ctrl_pref.rObj.get('data.servicios'),'//*[id="'+event.context.id+'"]')  ;

            var arr = ctrl_pref.rObj.get('data.servicios')
          for (var i = 0; i < arr.length; i++) {
            if(arr[i].id == event.context.id){
                indexS = i;

            }
          }


          if(item.length==0){
             ctrl_pref.rObj.push('data.servicios',event.context);
          }else{
             ctrl_pref.rObj.splice('data.servicios',indexS,1);
          }
           setMasks();

           
          } catch (e){}
          
          
          // get 
          //ctrl_pref.rObj.set('extras.'+event.index.num+".selected",1)

          
        })
        

	  },
    getModelos : function(value,defaultValue){
              comboModelo.clearAll();
       dbC.query('/preferencias/getCamionesModelo?marca='+value,"GET",{},function(res){
             comboModelo.addOption(res) 
                if(defaultValue!=undefined){
             comboModelo.setComboValue(defaultValue);
           }  
             
       })
    },
    getExtras : function(){
       dbC.query('/user/extras',"GET",{},function(res){
            ctrl_pref.rObj.set('extras',res);
            setMasks();
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
        ctrl_pref.changes = true;
        ctrl_pref.btEnable();
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
        for (var a in ctrl_pref.model){
            var item = ctrl_pref.model[a];
            var data = ctrl_pref.rObj.get('data.'+ a);
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
            if(ctrl_pref._id==undefined){
                ctrl_pref.save();    
            }else{
                ctrl_pref.update();
            }
        }
    },
    validateOne: function(item){
        var err = [];
        var key = item.keypath.slice(6);
        var data = ctrl_pref.rObj.get('data.'+ key);

        $('#err_'+ key).empty();

        reg = new RegExp(item.context.matchP.pattern,"i");
             if(!reg.exec(data)){ 
                
                var msg = createAlertDiv('#err_'+ key,"Create Error",item.context.matchP.desc,true,'bg_error','qtipErrSign');
                err.push(item.context.matchP)                   
             }else{
                
             }     
    },
    save : function(){      
        var data = {data: ctrl_pref.rObj.get('data')};
        dbC.query('/preferencias/save',"POST",data,ctrl_pref.saveRet)
    },
    update : function(){
         var data = {data: ctrl_pref.rObj.get('data')};
         delete data.data._id;
         dbC.query('/preferencias/update/'+ ctrl_pref._id,"POST",data,ctrl_pref.saveRet);
    },
    saveRet : function(){
        createGrowl("Group info","Registro guardado con exito.",false,'bg_ok','guardando');
        window.history.pushState({},"/app/empresa/preferencias","/app/empresa/preferencias");
        window.scrollTo(0,0);
        ctrl_app.getRoute();
    },
    

}


ctrl_pref.init()
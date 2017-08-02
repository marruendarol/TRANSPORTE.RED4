/*-----------------------------------------------------------------------------------
	TODO 

 

-------------------------------------------------------------------------------------*/

var templateList = [
   '/templates/t_personales.html',
]


var ctrl_personales = {
    data : {},
    changes : false,
	init : function(){
        var rObj = template.render("#loaderT",'#subContent',{txtBt:"Cargando datos...",loader:loaderC});
        ctrl_personales.urlParams = utils.getURLparams();
        ctrl_personales._id = ctrl_personales.urlParams._id;
		    mainC.loadTInit(ctrl_personales.getModel,templateList);
    },
    getModel : function(){
    	dbC.query('/personales/model',"GET",{},ctrl_personales.modelRet)
    },
    modelRet : function(res){
    	ctrl_personales.model = res;
            ctrl_personales.mode = 0; // Edición
            ctrl_personales.getData();    
      
    },
    getData : function(){
    	dbC.query('/personales/item',"GET",{},ctrl_personales.dataRet)
    },
    dataRet : function(res){
    	ctrl_personales.data = res;
    	ctrl_personales.render();
    },
	render:function(){
        // RENDER
		ctrl_personales.rObj = template.render('#mainbT','#subContent',{
            model:ctrl_personales.model,
            data:ctrl_personales.data,
            mode:ctrl_personales.mode,
            title: "DatosPersonales",
            list : "personales"
        });

        ctrl_personales.rObj.on('blur',function(event){
            ctrl_personales.setChange();
            ctrl_personales.validateOne(event);
        });

        ctrl_personales.rObj.on('submit',function(event){
            ctrl_personales.validate();
        });

       ctrl_personales.rObj.on('deleteAddr',function(event){

          var item = $('#del_' + event.context.id);
        $('#del_' + event.context.id).append('<div hidden id="pop_'+ event.context.id +'"></div')
        var modal = template.render('#deleteT','#pop_'+ event.context.id,{id:event.context.id,desc:"¿Borrar Dirección?"});
        createPopAction($('#pop_'+ event.context.id),item)

        modal.on('confirm',function(event){ 

          var dirs = ctrl_personales.rObj.get('data.direccion')

            for (var i = 0; i < dirs.length; i++) {
              if(dirs[i].id==event.context.id){
                console.log(i,"encontro")
                ctrl_personales.rObj.splice('data.direccion',i,1);
              }
            }
        })


        modal.on('cancel',function(event){  
           $('.qtip-modal').qtip('hide');
        })


          
        });

       ctrl_personales.rObj.on('openMap',function(e){
        window.open('http://maps.google.com/?q='+e.context.coords[0]+','+e.context.coords[1],"_blank");
       })




        ctrl_personales.rObj.on('addAddr',function(){

      ctrl_personales.modal = template.render('#mapaT', '#modal', {id:1,data:{}});
      
            createModal($('#mapa'))
             gGeo.init(1,20.530691,-100.810774,ctrl_personales.modal);

            ctrl_personales.modal.on('saveAddr', function(event) {
                
                staticImage(function(){
                     $('.qtip-modal').qtip('hide');
                      console.log(gGeo.finalAddr,"DIR FINALK")
                      ctrl_personales.rObj.push('data.direccion',gGeo.finalAddr);
                })
                 
                

            })

            ctrl_personales.modal.on('cancel', function() {
                $('.qtip-modal').qtip('hide');
            })

    });


        //-------------------------
       
       var uploader = new qq.FineUploader({
            request: {
                endpoint: "/personales/file-upload?folder=logos",
                inputName : "file",
                uuidName : "named"

            },
            deleteFile: {
                  enabled: true,
                  forceConfirm: false,
                  endpoint: '/personales/file-delete'
            },
            messages: {
                emptyError: 'File is empty',
                noFilesError: 'No files attached.',
                onLeave: 'We are still uploading your files...Please wait.'
            },
            validation: {
                allowedExtensions: ['jpeg', 'jpg', 'gif', 'png'],
                itemLimit: 1,
                tooManyItemsError : "Solo es permitida una imagen",
                stopOnFirstInvalidFile: true
            },
            thumbnail: {
                width: 200,
                height: 200
            },
            scaling: {
                sendOriginal : false,

                sizes: [
                    {name: "logo", maxSize: 200},
                    //{name: "medium", maxSize: 300}
                ]
            },
            callbacks: {
              onDelete: function(id) {
                
              },
              onSubmitDelete: function(id) {
                  var idDel = this.getUuid(id);
                    console.log(idDel,"DEL")
                  var objto = ctrl_personales.rObj.get('data.logotipo')
                  for (var i = 0; i < objto.length; i++) {
                    if(objto[i].uuid==idDel){
                      ctrl_personales.rObj.splice('data.logotipo',i,1);
                    }
                  }
         var data = {data: ctrl_personales.rObj.get('data')};
         delete data.data._id; 
         dbC.query('/personales/update',"POST",data,function(){});

               

                var name = this.getName(id);
                var extension = name.slice(name.length-4,name.length)
                  this.setDeleteFileParams({filename: this.getUuid(id),extension:extension}, id)
              },
              onDeleteComplete: function(id, xhr, isError) {
                  //...
              },
              onComplete : function(id, fileName, res){
                    console.log(id, fileName, res)
                   ctrl_personales.rObj.push('data.logotipo',{name:res.filename,uuid: res.id,thumbnailUrl:'/uploads/logos/'+res.filename});
              }
            },
            element: document.getElementById("uploader")

        });

       uploader.addInitialFiles(ctrl_personales.data.logotipo)




        ctrl_personales.rObj.on('deleteImg',function(event){

        var item = $('#del_' + event.context.id);
        $('#del_' + event.context.id).append('<div hidden id="pop_'+ event.context.id +'"></div')
        var modal = template.render('#deleteT','#pop_'+ event.context.id,{id:event.context.id,desc:"¿Borrar Imagen?"});
        createPopAction($('#pop_'+ event.context.id),item)

        modal.on('confirm',function(event){ 

          var dirs = ctrl_personales.rObj.get('data.logotipo')

            for (var i = 0; i < dirs.length; i++) {
              if(dirs[i].id==event.context.id){
                console.log(i,"encontro")
                ctrl_personales.rObj.splice('data.logotipo',i,1);
              }
            }
        });

      });

        //

       
      // Cambios Alerta -------------------------------------------------------
      window.onbeforeunload = function (e) {
            if(ctrl_personales.changes){
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
        ctrl_personales.rObj.on('popOver',function(event,key){
          //$('.popit').remove();
          var item = $('#pop_' + key).append('<div hidden class="popit" id="popit_'+ key +'"></div')
          var modal = template.render('#popT','#popit_'+ key,{id:key,desc:event.context.popInfo});
          createPop($('#popit_'+ key),item)
        })
      
 
      // mask input activate dwe  ---------------------------------------------
      setMasks();
      // Slider ------------------------------------------------------------------------------
      setSliders(ctrl_personales.rObj);
      //--------------------------------------------------------------------------------------  
      setPops();

      Inputmask({mask:["(55)99999999","(33)99999999","(81)99999999","(999)9999999"],'autoUnmask': true}).mask($('.phoneMex'));
    

	  },
   
    populate : function(combo,url,defaultValue,params){
       dbC.query(url,"GET",params || {},function(res){
            combo.res = res;
            combo.addOption(res) 
            combo.setComboValue(defaultValue)
       })
    },
    setChange : function(){
        ctrl_personales.changes = true;
        ctrl_personales.btEnable();
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
        for (var a in ctrl_personales.model){
            var item = ctrl_personales.model[a];
            var data = ctrl_personales.rObj.get('data.'+ a);
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
            ctrl_personales.update();
        }
    },
    validateOne: function(item){
        var err = [];
        var key = item.keypath.slice(6);
        var data = ctrl_personales.rObj.get('data.'+ key);

        $('#err_'+ key).empty();

        reg = new RegExp(item.context.matchP.pattern,"i");
             if(!reg.exec(data)){ 
                
                var msg = createAlertDiv('#err_'+ key,"Create Error",item.context.matchP.desc,true,'bg_error','qtipErrSign');
                err.push(item.context.matchP)                   
             }else{
                
             }     
    },
    update : function(){
         var data = {data: ctrl_personales.rObj.get('data')};
         delete data.data._id;
         console.log(data,"DATOS ENVIAR")
         dbC.query('/personales/update',"POST",data,ctrl_personales.saveRet);
    },
    saveRet : function(){
        createGrowl("Group info","Registro guardado con exito.",false,'bg_ok','guardando');
        window.history.pushState({},"/app/empresa/","/app/empresa");
        window.scrollTo(0,0);
        ctrl_app.getRoute();
    },
    

}


ctrl_personales.init();

function base64ToFile(dataURI, origFile) {
  var byteString, mimestring;

  if(dataURI.split(',')[0].indexOf('base64') !== -1 ) {
    byteString = atob(dataURI.split(',')[1]);
  } else {
    byteString = decodeURI(dataURI.split(',')[1]);
  }

  mimestring = dataURI.split(',')[0].split(':')[1].split(';')[0];

  var content = new Array();
  for (var i = 0; i < byteString.length; i++) {
    content[i] = byteString.charCodeAt(i);
  }

  var newFile = new File(
    [new Uint8Array(content)], origFile.name, {type: mimestring}
  );


  // Copy props set by the dropzone in the original file

  var origProps = [ 
    "upload", "status", "previewElement", "previewTemplate", "accepted" 
  ];

  $.each(origProps, function(i, p) {
    newFile[p] = origFile[p];
  });

  return newFile;
}


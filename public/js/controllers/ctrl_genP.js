// DATOS GENERALES PACIENTE

var ctrl_genP = {
	rObj : {},
	profileData : {},
	userId : {},
	changes : false,
    getData : function(obj){

    	ctrl_genP.genObj = template.render('#datosT','#tab_' + obj.id,{})


    	ctrl_genP.genObj.on('keydown',function(e){
    		ctrl_genP.setChange(e.context)
    	});

		$('#tags').tagsinput({
		  maxTags: 10,
		  freeInput: false,
		   onTagExists: function(item, $tag) {
		    $tag.hide().fadeIn();
		  },
		});

		// Remove Listeners
		$("#tags").on('itemRemoved', function(event) {
   			ctrl_genP.setChange('tag Remove')
		});
		
    	ctrl_genP.genObj.on('comboChange', function(event) {
   			ctrl_genP.setChange('combo Change')
		});
		
		 // Add Especialidad
		ctrl_genP.genObj.on('addTag',function(e){
			var str = $('#tagInput').val();
			$('#tags').tagsinput('add', str);
			var espec 	= str;
			var item = {
						espec : espec,
						ts:utils.generateTS(),
						id:utils.generateUUID()};
			ctrl_genP.setChange(e.context)
			$('#tagInput').val("").focus();

		});		

    	ctrl_genP.genObj.on('updateRS',function(){
    		console.log("updating...")
    		ctrl_genP.profileUpdate();
    	})

    	socket.removeListener('userdata');

		socket.on('userdata', function(response){
			
			console.log("regreso DATA",response)
			ctrl_genP.btDone()

        	ctrl_genP.profileData = response;
        	var id = response._id
        	ctrl_genP.userId = id
        	ctrl_genP.genObj.set('profileData',ctrl_genP.profileData)

        	$('#tags').tagsinput('removeAll');
			
        	if(response.tags!=undefined){
        	ctrl_genP.addTags('#tags',response.tags)
			}
      	});

		// Mascara teléfono
      	 $("#telefono").mask("(999) 999-9999");


		ctrl_genP.btAnim();
  		socket.emit('getUserPacienteInfo',{room:userRoom});


  		window.onbeforeunload = function (e) {
  			if(ctrl_genP.changes){
  				var message = "El perfil tiene cambios por guardar",
				  e = e || window.event;
				  // For IE and Firefox
				  if (e) {
				    e.returnValue = message;
				  }
				  // For Safari
				  return message;
  			}
  
		}

  	
    },
    btAnim : function(){
    	$('#updateProfile').html('<div>Actualizando... <img id="spinIco" src="img/spinner.png"></div>');
    	TweenMax.to( $('#spinIco'), 0.5, {rotation:"360", ease:Linear.easeNone, repeat:-1});
    },
    btDone : function(){
    	$('#updateProfile').html('Actualizar Datos');
    	var color = "#F06F00"
    	if(!ctrl_genP.changes){
    		color = "#666666";
    	}
    	TweenLite.to('#updateProfile', 0.5, {backgroundColor:"green", opacity: 1, ease:Power3.easeOut,onComplete:function(){
    		TweenLite.to('#updateProfile', 0.5, {backgroundColor:color, opacity: 1, ease:Power3.easeOut})
    	}})
    },
    btEnable : function(){
    	$('#updateProfile').removeClass('disabled');
    	TweenLite.to('#updateProfile', 0.5, {backgroundColor:"#F06F00", opacity: 1, ease:Power3.easeOut});
    },
    btDisable : function(){
    	$('#updateProfile').addClass('disabled');
    	TweenLite.to('#updateProfile', 0.5, {backgroundColor:"#666666", opacity: 1, ease:Power3.easeOut});
    },
    setChange : function(){
    	ctrl_genP.changes = true;
    	ctrl_genP.btEnable();
    },
    profileUpdate : function(){

    	ctrl_genP.changes = false;
    	ctrl_genP.btDisable();
    	var obj = {
				'info.nombre' 		:  $('#nombre').val(),
				'info.paterno' 		:  $('#paterno').val(),
				'info.materno' 		:  $('#materno').val(),
		  		'info.sexo' 		:  $('#sexoCombo').val(),
				'info.civil'		:  $('#civilCombo').val(),
				'info.residencia'	:  $('#residencia').val(),
				'info.telefono' 	:  $('#telefono').val(),
		};	

	// Validate Data		
		console.log(obj,"obj to update");

    	socket.removeListener('updateData');
		socket.emit('updateUserPacienteInfo',{_id: ctrl_genP.userId, room:userRoom,data:obj});
		
		socket.on('updateData', function(response){
			
			ctrl_genP.btDone();
			createGrowl("App info","Registro Actualizado con éxito.",false,'bg_ok');
			socket.emit('getUserPacienteInfo',{room:userRoom});

      	});
    },

    datosGenerales : function(data){
    	var rObj = template.render('#datosT','#tab_' + obj.id,data)
    },
    addTags : function(el,obj){
		console.log(el,obj)
		for (var i = 0; i < obj.length; i++) {
			$(el).tagsinput('add', obj[i]);
		}
			
	},
	getExternal : function(extra){
		var params = {}
		dbC.query(extra.url,"POST",params,ctrl_genP.external_Return,extra)
	},
	external_Return : function(result,extra){
		// Place Holder
		$(extra.div).append('<option value="" style="display:none;" selected disabled>'+extra.placeholder+'</option>')

		console.log(result,"RESULT COMBO")

		for (var i = 0; i < result.data.length; i++) {
			$(extra.div).append('<option value="'+ result.data[i][extra.value] +'">' + result.data[i][extra.label] +'</option>')
		}

		if(extra.defaultVal!=null){
		//	$(extra.div).val(extra.defaultVal);
		}
	},
};


// DATOS GENERALES MEDICO

var ctrl_bases = {
	rObj : {},
	profileData : {},
	userId : {},
	changes : false,
    getData : function(obj){

    	ctrl_bases.genObj = template.render('#datosT','#tab_' + obj.id,{})


    	ctrl_bases.genObj.on('keydown',function(e){
    		ctrl_bases.setChange(e.context)
    	})


    	$('#especialidad').tagsinput({
		  maxTags: 10,
		  freeInput: false,
		   onTagExists: function(item, $tag) {
		    $tag.hide().fadeIn();
		  }
		});

		$('#subespecialidad').tagsinput({
		  maxTags: 10,
		  freeInput: false,
		   onTagExists: function(item, $tag) {
		    $tag.hide().fadeIn();
		  }
		});

		$('#tags').tagsinput({
		  maxTags: 10,
		  freeInput: false,
		   onTagExists: function(item, $tag) {
		    $tag.hide().fadeIn();
		  },
		});

		// Remove Listeners
		$("#especialidad").on('itemRemoved', function(event) {
   			ctrl_bases.setChange('espec Remove')
		});
		$("#subespecialidad").on('itemRemoved', function(event) {
   			ctrl_bases.setChange('subespec Remove')
		});
		$("#tags").on('itemRemoved', function(event) {
   			ctrl_bases.setChange('tag Remove')
		});
		
    	ctrl_bases.genObj.on('comboChange', function(event) {
   			ctrl_bases.setChange('combo Change')
		});

		
		ctrl_bases.getExternal({
							url:"user/readespec",
							div:"#especialidadCombo",
							value:'nombre',
							label:'nombre',
							placeholder: "Seleccione una especialidad:",
							defaultVal:{}
							});

		ctrl_bases.getExternal({
							url:"user/readsubespec",
							div:"#subEspecialidadCombo",
							value:'nombre',
							label:'nombre',
							placeholder: "Seleccione una subespecialidad",
							defaultVal:{}
							});


		ctrl_bases.genObj.on('addEspecialidad',function(e){
			var cat = $('#especialidadCombo option:selected').text();

			if($('#especialidadCombo').prop('selectedIndex')!=0){
				$('#especialidad').tagsinput('add', cat);
			}
			
				// auto add desc
			var espec 	= cat;
			var item = {
						espec : espec,
						ts:utils.generateTS(),
						id:utils.generateUUID()};

			ctrl_bases.setChange(e.context)
		});	

		ctrl_bases.genObj.on('addSubEspecialidad',function(e){
			var cat = $('#subEspecialidadCombo option:selected').text();
			$('#subespecialidad').tagsinput('add', cat);
			var espec 	= cat;
			var item = {
						espec : espec,
						ts:utils.generateTS(),
						id:utils.generateUUID()};
			ctrl_bases.setChange(e.context)			
		});			

		 // Add Especialidad
		ctrl_bases.genObj.on('addTag',function(e){
			var str = $('#tagInput').val();
			$('#tags').tagsinput('add', str);
			var espec 	= str;
			var item = {
						espec : espec,
						ts:utils.generateTS(),
						id:utils.generateUUID()};
			ctrl_bases.setChange(e.context)
			$('#tagInput').val("").focus();

		});		

    	ctrl_bases.genObj.on('updateRS',function(){
    		console.log("updating...")
    		ctrl_bases.profileUpdate();
    	})

    	socket.removeListener('userdata');

		socket.on('userdata', function(response){
			
			console.log("regreso DATA",response)
			ctrl_bases.btDone()

        	ctrl_bases.profileData = response;
        	var id = response._id
        	ctrl_bases.userId = id
        	ctrl_bases.genObj.set('profileData',ctrl_bases.profileData)

        	$('#especialidad').tagsinput('removeAll');
        	$('#subespecialidad').tagsinput('removeAll');
        	$('#tags').tagsinput('removeAll');

        	if(response.especialidad!=undefined){
        		ctrl_bases.addTags('#especialidad',response.especialidad)
        	}
        	if(response.subespecialidad!=undefined){
        	ctrl_bases.addTags('#subespecialidad',response.subespecialidad)
        	}
        	if(response.tags!=undefined){
        	ctrl_bases.addTags('#tags',response.tags)
        	}

        	

      	});

		// Mascara teléfono
      	 $("#telefono").mask("(999) 999-9999");


		ctrl_bases.btAnim();
  		socket.emit('getUserInfo',{room:userRoom});


  		window.onbeforeunload = function (e) {
  			if(ctrl_bases.changes){
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
    	if(!ctrl_bases.changes){
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
    	ctrl_bases.changes = true;
    	ctrl_bases.btEnable();
    },
    profileUpdate : function(){

    	ctrl_bases.changes = false;
    	ctrl_bases.btDisable();
    	var obj = {
				'info.residencia' 		:  $('#residencia').val(),
				'info.telefono' 		:  $('#telefono').val(),
				'info.edocivil' 		:  $('#civilCombo').val(),
		  		'especialidad' 	:  $('#especialidad').tagsinput('items'),
				'subespecialidad'	:  $('#subespecialidad').tagsinput('items'),
				'tags' 			:  $('#tags').tagsinput('items'),
	}	

	// Validate Data		


		console.log(obj,"obj to update")

    	socket.removeListener('updateData');
		socket.on('updateData', function(response){
			
			ctrl_bases.btDone();
			createGrowl("App info","Registro Actualizado con éxito.",false,'bg_ok');
			socket.emit('getUserInfo',{room:userRoom});

      	});

      	socket.emit('updateUserInfo',{_id: ctrl_bases.userId, room:userRoom,data:obj});
		
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
		dbC.query(extra.url,"POST",params,ctrl_bases.external_Return,extra)
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


/**********************************************************
*	LOGIN CONTROLLER
***********************************************************/
$(document).ready(function() {
    mainC.initFoundation();
    ctrl_login.init();
});

var ctrl_login = {
	homePage : "",
	href : "",
	prefix : "/espera",
	profileImage : {},
	init : function(){
		ctrl_login.render();
	},
	login: function(username,password,persistent,landing){
		var params = {username:username,password:password,persistent:persistent};
	    $.ajax({
	        type: 'POST',
	        data: params,
	        url: 'user/accesoPaciente',
	        dataType: 'JSON'
	        }).done(function( response ) {
	        	
	        	var res = utils.get(response[0],"status");

	        	console.log(res)

	        	switch(res){
	        		case undefined : ctrl_login.loginError("Error de login, revise su usuario y contraseña."); break;
	        		case "0" : ctrl_login.loginError("Usuario no ha sido confirmado, por favor revise su e-mail y siga la liga."); break;
	        		case "1" : ctrl_login.redirect(landing);  break;
	        	}

	        }).fail(function( response ) {
	           	ctrl_login.loginError()
	    });   
	},
	loginError:function(msg){
		foundationJS.createAlert(msg,"#alertCont","alert")
	},
	redirect: function(url){

		if(ctrl_login.href==""){			
           			 window.location = url || "/";
   				} else {
   					 window.location = ctrl_login.href || "/";
   				}
		
	},
	render:function(){
		var logObj = template.render('#loginT','#content',{})
		logObj.on( 'loginActivate', function ( event ) {
			var username 	= $('[name="username"]').val();
			var password 	=  md5($('[name="password"]').val());
			var persistent 	=  $("input[name='persistent']").is(":checked");
	  		ctrl_login.login(username,password,persistent,"/");
		});


		logObj.on('keypress',function(e){

			var isC =  ctrl_login.isCapslock(e.original)
			console.log(isC)

			if(isC) {
				 foundationJS.createAlert('Mayúsculas Activado',"#alertCont","warning")
			} else {
		      $('#alertCont').empty();
    		}
		})

		template.render('#footerT','#footer',{})

		$('#footerLegales').click(function(){

          /*  $('#politicas').bPopup({
	            onOpen: function() { document.ontouchmove = function(e){  } }, 
	            onClose: function() { document.ontouchmove = function(e){ e.preventDefault(); } },
	            modalClose: true,
	            opacity: 0.6,
	            positionStyle: 'fixed' //'fixed' or 'absolute'
        	});*/
                
        })

	},
	// Check CAPS LOCK
	isCapslock : function(e){

        e = (e) ? e : window.event;

        var charCode = false;
        if (e.which) {
            charCode = e.which;
        } else if (e.keyCode) {
            charCode = e.keyCode;
        }
        var shifton = false;
        if (e.shiftKey) {
            shifton = e.shiftKey;
        } else if (e.modifiers) {
            shifton = !!(e.modifiers & 4);
        }
        if (charCode >= 97 && charCode <= 122 && shifton) {
            return true;
        }
        if (charCode >= 65 && charCode <= 90 && !shifton) {
            return true;
        }
        return false;

    }

}
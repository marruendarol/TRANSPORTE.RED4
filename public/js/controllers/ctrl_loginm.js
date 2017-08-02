/**********************************************************
*	LOGIN CONTROLLER
***********************************************************/
$(document).ready(function() {
    mainC.initApp();
    ctrl_login.init();
});

var ctrl_login = {
	lan : spanish,
	waiting : false,
	homePage : "",
	href : "",
	init : function(){
		ctrl_login.render();
	},
	login: function(username,password,persistent,landing){
		var mdPass = md5(password);
		console.log(mdPass,"mdPass");
		var params = {username:username,password:mdPass,persistent:persistent};
	    $.ajax({
	        type: 'POST',
	        data: params,
	        url: '/user/login',
	        dataType: 'JSON'
	        }).done(function( response ) {
	        	
	        	var res = utils.get(response[0],"status");

	        	switch(res){
	        		case undefined : ctrl_login.loginError("Login Error, Check Username and Password"); break;
	        		case "0" : ctrl_login.loginError("User Sign up is not complete, please check your email and follow validation link."); break;
	        		case "1" : ctrl_login.redirect(landing);  break;
	        	}

	        }).fail(function( response ) {
	           	ctrl_login.loginError("Connection Error")
	    });   
	},
	loginError:function(msg){
		//foundationJS.createAlert(msg,"#alertCont","alert")
	},
	redirect: function(url){

		if(ctrl_login.href==""){			
           			 window.location = url || "/";
   				} else {
   					 window.location = ctrl_login.href || "/";
   				}
		
	},
	render:function(){
		var logObj = template.render('#loginT','#content',{lan	: ctrl_login.lan})

		logObj.on( 'loginActivate', function ( event ) {
			var username 	= $('[name="email"]').val();
			var password 	=  $('[name="password"]').val();
			var persistent 	=  $("input[name='persistent']").is(":checked");
	  		ctrl_login.login(username,password,persistent,"../");
		});

		logObj.on('keypress',function(e){

			var isC =  ctrl_login.isCapslock(e.original)
			console.log(isC)

			if(isC) {
				 foundationJS.createAlert('Uppercase ON',"#alertCont","warning")
			} else {
		      $('#alertCont').empty();
    		}
		})

		template.render('#footerT','#footer',{lan	: ctrl_login.lan })
                
        
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
/**********************************************************
*	USER CONTROLLER
***********************************************************/
$(document).ready(function() {
	console.log("inciando user...")
    mainC.initApp();
    ctrl_user.init(ctrl_core.init);
});


var ctrl_user = {
	userInfo : {},
	callback : null,
	init : function(callback){
		if(callback) { ctrl_user.callback = callback}
		ctrl_user.checkSession();
	},
	rejectConn: function(){
		var currURL = utils.getURL();
		window.location = "../?href=" + currURL;
	},
	checkSession: function(){
		 $.ajax({
	        type: 'POST',
	        data: {},
	        url: '/user/session',
	        dataType: 'JSON'
	        }).done(function( response ) {
	        	//console.log(response,"RESPUESTA ")
        		if(response.status=="failed"){
        			window.location="../login"
        		}else{
        			if(response.type=="MEDICO"){
        				
        			}
        			if(response.type=="PACIENTE"){

        			}
        		
        		}
	        }).fail(function( response ) {
	           	
	    }); 
	},
	logOut:function(){
		$.ajax({
	        type: 'POST',
	        data: {},
	        url: 'user/logout',
	        dataType: 'JSON'
	        }).done(function( response ) {
	        	window.location = "/";

	        }).fail(function( response ) {
	        	window.location = "/";
	    });   
	}
};


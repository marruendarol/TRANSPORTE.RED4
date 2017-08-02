/**********************************************************
*	SIGNUP CONTROLLER
todo
***********************************************************/
$(document).ready(function() {
    ctrl_confirmar.init();
});

var ctrl_confirmar  = {
	waiting : false,
	init : function(){
		ctrl_confirmar.checkStatus();
	},
	checkStatus : function(){
		ctrl_confirmar.uid= utils.getURLparams().uid;
		ctrl_confirmar.email = utils.getURLparams().email;

		if(ctrl_confirmar.uid!=undefined){
			dbC.query("/user/getStatus","POST",{uid:ctrl_confirmar.uid,email:ctrl_confirmar.email},ctrl_confirmar.statPrev,{})
		}else{

		}
	},
	statPrev : function(response){
		console.log(response)
		if(response.status==0){
			ctrl_confirmar.mainR = template.render('#errorT','#content',{});
		}else{
			ctrl_confirmar.mainR = template.render('#completoT','#content',{});

		 ctrl_confirmar.mainR.on('retHome',function(){
	    	window.location = "/beta";
	    });
		}
	}
	
}



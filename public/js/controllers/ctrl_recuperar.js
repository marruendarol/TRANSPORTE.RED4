/**********************************************************
*	
***********************************************************/
$(document).ready(function() {
    mainC.initFoundation();
    ctrl_recuperar.init();
});

var ctrl_recuperar = {
	init 	: function(){
		ctrl_recuperar.render("#recuperarT");
	},
	render	: function(temp){
		
		var dataObj = {  }
		var menuObj = template.render(temp,'#content',dataObj)

	 	template.render('#footerT','#footer',{})


	 	menuObj.on('recuperar',function(){
			ctrl_recuperar.sendMsg();
		});


		
	},
	sendMsg : function(){	
		var params = {email:$('#email').val()};
		dbC.query("/user/recovery","POST",params,ctrl_recuperar.msgRet,params,null)
	},
	msgRet : function(response){
		console.log("dasda")
		template.render("#recuperarDoneT",'#content',{})
	}
}
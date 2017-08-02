/**********************************************************

CONTROLADOR TERMINOS Y CONDICIONES

**********************************************************/

$(document).ready(function() {
    mainC.initApp();
    ctrl_terminos.init();
});

var ctrl_terminos = {
	waiting : false,
	errors : [],
	toogle:false,
	selOrigen : 0,
	init : function(){
		ctrl_terminos.render();
	},
	render:function(res){

		ctrl_terminos.mainR = template.render('#terminosT','#content',{});

		 ctrl_terminos.mainR.on('retHome',function(){
	    	window.location = "/home2";
	    });
	}
	
}




var ctrl_exploracion = {
	rObj : {},
	profileData : {},
	userId : {},
	changes : false,
    init : function(obj){
    	ctrl_exploracion.genObj = template.render('#exploracionT','#sub_' + obj.id,{})

  	
    },

};


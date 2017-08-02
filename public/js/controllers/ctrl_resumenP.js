

var ctrl_resumenM = {
	tabData : {tabs  : []},
	rObj : {},
	userId : {},
	init: function(obj){
		ctrl_resumenM.render(obj)
	},
    render : function(obj){

    	ctrl_resumenM.rObj = template.render('#resumenT','#tab_' + obj.id,{profileData:ctrl_resumenM.profileData})
    	
    	
    
    }
};



/**********************************************************
*  CTRL Flotilla 
*
***********************************************************/

var ctrl_reportes = {
	init: function(){
       ctrl_reportes.getRoute(ctrl_app.session.seccs);
    },
    getRoute: function(response) {
        var r = new URI().path();
        r = r.split('/')
        for (var i = response.length - 1; i >= 0; i--) {
            if (response[i].subs != undefined) {
                for (var a = response[i].subs.length - 1; a >= 0; a--) {
                    if (response[i].url == r[2]) {
                        ctrl_reportes.subs = response[i].subs;
                    }
                    if (response[i].subs[a].url == r[3]) {
                        response[i].subs[a].sel = true;
                        $.getScript('/js/controllers/' + response[i].subs[a].js, function(data, textStatus, jqxhr) {

                        });
                    }
                }
            }
        }
        ctrl_reportes.render();
    },

    render : function(){
        console.log("renderinf menu flotilla")
        var rObj = template.render('#subItemsT','#subUI',{subs:ctrl_reportes.subs})
        
    }



}    

ctrl_reportes.init();



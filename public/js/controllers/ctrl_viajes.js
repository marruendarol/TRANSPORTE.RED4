
/**********************************************************
*  CTRL Flotilla 
*
***********************************************************/

var ctrl_viajes = {
	init: function(){
       ctrl_viajes.getRoute(ctrl_app.session.seccs);
       ctrl_app.suscribe('ctrl_viajes');
    },
    getRoute: function(response) {
        var r = new URI().path();
        r = r.split('/')
        for (var i = response.length - 1; i >= 0; i--) {
            if (response[i].subs != undefined) {
                for (var a = response[i].subs.length - 1; a >= 0; a--) {
                    if (response[i].url == r[2]) {
                        ctrl_viajes.subs = response[i].subs;
                    }
                    if (response[i].subs[a].url == r[3]) {
                        response[i].subs[a].sel = true;
                        $.getScript('/js/controllers/' + response[i].subs[a].js, function(data, textStatus, jqxhr) {

                        });
                    }
                }
            }
        }
        ctrl_viajes.render();
    },

    render : function(){
        console.log("renderinf menu flotilla")
        var rObj = template.render('#subItemsT','#subUI',{subs:ctrl_viajes.subs})
        
    }



}    

ctrl_viajes.init();



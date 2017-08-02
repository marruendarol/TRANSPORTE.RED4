
/**********************************************************
*  CTRL Flotilla 
*
***********************************************************/

var ctrl_configuracion = {
	init: function(){
       ctrl_configuracion.getRoute(ctrl_app.session.seccs);
       ctrl_app.suscribe('ctrl_configuracion');
    },
    getRoute: function(response) {
        var r = new URI().path();
        r = r.split('/')
        for (var i = response.length - 1; i >= 0; i--) {
            if (response[i].subs != undefined) {
                for (var a = response[i].subs.length - 1; a >= 0; a--) {
                    if (response[i].url == r[2]) {
                        ctrl_configuracion.subs = response[i].subs;
                    }
                    if (response[i].subs[a].url == r[3]) {
                        response[i].subs[a].sel = true;
                        $.getScript('/js/controllers/' + response[i].subs[a].js, function(data, textStatus, jqxhr) {

                        });
                    }
                }
            }
        }
        ctrl_configuracion.render();
    },

    render : function(){
        console.log("renderinf menu flotilla")
        var rObj = template.render('#subItemsT','#subUI',{subs:ctrl_configuracion.subs})
        
    }



}    

ctrl_configuracion.init();



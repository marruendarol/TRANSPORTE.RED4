
/**********************************************************
*  CTRL perfil 
*
***********************************************************/

var ctrl_perfil = {
	init: function(){
       ctrl_perfil.getRoute(ctrl_app.session.seccs);
       ctrl_app.suscribe('ctrl_perfil');
    },
    getRoute: function(response) {
        var r = new URI().path();
        r = r.split('/');
        ctrl_perfil.r= r;
        ctrl_perfil.subs = [];
        for (var i = 0; i < response.length; i++) {
            if (response[i].parent == r[2]) {
                ctrl_perfil.subs.push(response[i]);
                if(response[i].info.url==r[3]){
                    
                    if(response[i].list!=undefined){
                        ctrl_perfil.url = response[i].list;
                    }else{
                        ctrl_perfil.url = response[i].info.url;    
                    }
                    
                    $.getScript('/js/controllers/' + response[i].info.ctrl, function(data, textStatus, jqxhr) {});
                } 

            } 

        }

     ctrl_perfil.render()


    },
    render : function(){
        console.log("renderinf menu perfil")
        var rObj = template.render('#subItemsT','#subUI',{subs:ctrl_perfil.subs,urlApp:ctrl_perfil.url})
        
        rObj.on('menuClick',function(event){
            window.history.pushState({},event.context.info.nombre,"/app/perfil/" + event.context.info.url);
            document.title = event.context.info.nombre;
            ctrl_app.getRoute();
        })

    // REUSMEN
     if(ctrl_perfil.r[3]==undefined){
        console.log("RENDING RESUMEN")
       var resObj = template.render('#fresumeT','#subContent',{}) 
    } 

       resObj.on('goBases',function(){
          ctrl_app.setRoute('Bases','/app/perfil/bases')
       })

       resObj.on('goUnidades',function(){
           ctrl_app.setRoute('Unidades','/app/perfil/unidades')
       })

       resObj.on('goPreferencias',function(){
           ctrl_app.setRoute('Preferencias','/app/perfil/preferencias')
       })


    }



}    

ctrl_perfil.init();



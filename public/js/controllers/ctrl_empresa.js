
/**********************************************************
*  CTRL empresa 
*
***********************************************************/

var ctrl_empresa = {
	init: function(){
       ctrl_empresa.getRoute(ctrl_app.session.seccs);
       ctrl_app.suscribe('ctrl_empresa');
    },
    getRoute: function(response) {
        var r = new URI().path();
        r = r.split('/');
        ctrl_empresa.r= r;
        ctrl_empresa.subs = [];
        for (var i = 0; i < response.length; i++) {
            if (response[i].parent == r[2]) {
                ctrl_empresa.subs.push(response[i]);
                if(response[i].info.url==r[3]){
                    
                    if(response[i].list!=undefined){
                        ctrl_empresa.url = response[i].list;
                    }else{
                        ctrl_empresa.url = response[i].info.url;    
                    }
                    
                    $.getScript('/js/controllers/' + response[i].info.ctrl, function(data, textStatus, jqxhr) {});
                } 

            } 

        }

     ctrl_empresa.render()


    },
    render : function(){
        console.log("renderinf menu empresa")
        var rObj = template.render('#subItemsT','#subUI',{subs:ctrl_empresa.subs,urlApp:ctrl_empresa.url})
        
        rObj.on('menuClick',function(event){
            window.history.pushState({},event.context.info.nombre,"/app/empresa/" + event.context.info.url);
            document.title = event.context.info.nombre;
            ctrl_app.getRoute();
        })

    // REUSMEN
     if(ctrl_empresa.r[3]==undefined){
        console.log("RENDING RESUMEN")
       var resObj = template.render('#fresumeT','#subContent',{}) 
    } 

       resObj.on('goBases',function(){
          ctrl_app.setRoute('Bases','/app/empresa/bases')
       })

       resObj.on('goUnidades',function(){
           ctrl_app.setRoute('Unidades','/app/empresa/unidades')
       })

       resObj.on('goPreferencias',function(){
           ctrl_app.setRoute('Preferencias','/app/empresa/preferencias')
       })


    }



}    

ctrl_empresa.init();



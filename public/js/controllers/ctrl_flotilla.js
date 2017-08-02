
/**********************************************************
*  CTRL Flotilla 
*
***********************************************************/

var ctrl_flotilla = {
	init: function(){
       ctrl_flotilla.getRoute(ctrl_app.session.seccs);
       ctrl_app.suscribe('ctrl_flotilla');
    },
    getRoute: function(response) {
        var r = new URI().path();
        r = r.split('/');
        ctrl_flotilla.r= r;
        ctrl_flotilla.subs = [];
        for (var i = 0; i < response.length; i++) {
            if (response[i].parent == r[2]) {
                ctrl_flotilla.subs.push(response[i]);
                if(response[i].info.url==r[3]){
                    
                    if(response[i].list!=undefined){
                        ctrl_flotilla.url = response[i].list;
                    }else{
                        ctrl_flotilla.url = response[i].info.url;    
                    }
                    
                    $.getScript('/js/controllers/' + response[i].info.ctrl, function(data, textStatus, jqxhr) {});
                } 

            } 

        }

     ctrl_flotilla.render()


    },
    render : function(){
        console.log("renderinf menu flotilla")
        var rObj = template.render('#subItemsT','#subUI',{subs:ctrl_flotilla.subs,urlApp:ctrl_flotilla.url})
        
        rObj.on('menuClick',function(event){
            window.history.pushState({},event.context.info.nombre,"/app/flotilla/" + event.context.info.url);
            document.title = event.context.info.nombre;
            ctrl_app.getRoute();
        })

    // REUSMEN
     if(ctrl_flotilla.r[3]==undefined){
        console.log("RENDING RESUMEN")
       var resObj = template.render('#fresumeT','#subContent',{}) 
    } 

       resObj.on('goSucursales',function(){
          ctrl_app.setRoute('Sucursales','/app/flotilla/sucursales')
       })

       resObj.on('goUnidades',function(){
           ctrl_app.setRoute('Unidades','/app/flotilla/unidades')
       })

       resObj.on('goPreferencias',function(){
           ctrl_app.setRoute('Preferencias','/app/flotilla/preferencias')
       })


    }



}    

ctrl_flotilla.init();



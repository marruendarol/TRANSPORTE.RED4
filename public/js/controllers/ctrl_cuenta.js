
/**********************************************************
*  CTRL empresa 
*
***********************************************************/

var ctrl_cuenta = {
	init: function(){
       ctrl_cuenta.getRoute(ctrl_app.session.seccs);
       ctrl_app.suscribe('ctrl_cuenta');
    },
    getRoute: function(response) {
        var r = new URI().path();
        r = r.split('/');
        ctrl_cuenta.r= r;
        ctrl_cuenta.subs = [];
        for (var i = 0; i < response.length; i++) {
            if (response[i].parent == r[2]) {
                ctrl_cuenta.subs.push(response[i]);
                if(response[i].info.url==r[3]){
                    
                    if(response[i].list!=undefined){
                        ctrl_cuenta.url = response[i].list;
                    }else{
                        ctrl_cuenta.url = response[i].info.url;    
                    }
                    
                    $.getScript('/js/controllers/' + response[i].info.ctrl, function(data, textStatus, jqxhr) {});
                } 

            } 

        }

     ctrl_cuenta.render()


    },
    render : function(){
        console.log("renderinf menu ")
        var rObj = template.render('#subItemsT','#subUI',{subs:ctrl_cuenta.subs,urlApp:ctrl_cuenta.url})
        
        rObj.on('menuClick',function(event){
            window.history.pushState({},event.context.info.nombre,"/app/cuenta/" + event.context.info.url);
            document.title = event.context.info.nombre;
            ctrl_app.getRoute();
        })

    // REUSMEN
     if(ctrl_cuenta.r[3]==undefined){
        console.log("RENDING RESUMEN")
       //var resObj = template.render('#fresumeT','#subContent',{}) 
     } 


    }



}    

ctrl_cuenta.init();



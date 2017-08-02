
/**********************************************************
*  CTRL Flotilla 
*
***********************************************************/

var ctrl_mensajes = {
    init: function(){
       ctrl_mensajes.getRoute(ctrl_app.session.seccs);
       ctrl_app.suscribe('ctrl_mensajes');
    },
    getRoute: function(response) {
        var r = new URI().path();
        r = r.split('/')
        for (var i = response.length - 1; i >= 0; i--) {
            if (response[i].subs != undefined) {
                for (var a = response[i].subs.length - 1; a >= 0; a--) {
                    if (response[i].url == r[2]) {
                        ctrl_mensajes.subs = response[i].subs;
                    }
                    if (response[i].subs[a].url == r[3]) {
                        response[i].subs[a].sel = true;
                        $.getScript('/js/controllers/' + response[i].subs[a].js, function(data, textStatus, jqxhr) {

                        });
                    }
                }
            }
        }
        ctrl_mensajes.getMsgs();
    },
    getMsgs : function(){
       dbC.query('/msgCenter/readAll',"POST",{},ctrl_mensajes.msgRet)
    },
    msgRet : function(response){
         var items = ctrl_app.mObj.get('user.seccs');

            var unread = 0;
            for (var i = 0; i < response.length; i++) {
                if(response[i].estatus==0){
                    unread++;
                }
            }


        var itemS = "mensajes"
        for (var i = 0; i < items.length; i++) {
            console.log(items[i].info.url,"YUI")
            if(items[i].info.url==itemS){
                ctrl_app.mObj.set('user.seccs['+ i +'].warn',unread);
            }
        }

        ctrl_mensajes.render(response);
    },
    render : function(response){
        

        var rObj = template.render('#subItemsT','#subUI',{})

        var msgEj = response

        /* [
                {
                    sender :  "Raul Ortega",
                    subject : "Cobranza",
                    lastMsg : "29 10 2017",
                    lastTxt : "Si por favor envíame los papeles"
                },
                {
                    sender :  "Raul Ortega",
                    subject : "Cobranza",
                    lastMsg : "29 10 2017",
                    lastTxt : "Si por favor envíame los papeles"
                },
                {
                    sender :  "Raul Ortega",
                    subject : "Cobranza",
                    lastMsg : "29 10 2017",
                    lastTxt : "Si por favor envíame los papeles"
                }
            ]
*/            

        var rObj = template.render('#msgListT','#subContent',{msgsA:msgEj})
    
        autosize($(".preguntaArea"));
        
    }





}    

ctrl_mensajes.init();



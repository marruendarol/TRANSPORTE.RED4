/**********************************************************
*	LOGIN SUB 

***********************************************************/

var ctrl_login = {
	lan : spanish,
	waiting : false,
	homePage : "",
	href : "",
	logObj: {},
  ctrlCallBack : null,
	checkSession: function(callback){
		ctrl_login.callback = callback;
		 $.ajax({
	        type: 'POST',
	        data: {},
	        url: '/user/session',
	        dataType: 'JSON'
	        }).done(function( response ) {
            ctrl_login.userInfo = response;
	        	ctrl_login.callback(response);
	        }).fail(function( response ) {
	           	
	    });
	},
	login: function(username,password,tipo){
		var mdPass = md5(password);
		var params = {username:username,password:password};
	    $.ajax({
	        type: 'POST',
	        data: params,
	        url: '/user/acceso',
	        dataType: 'JSON'
	        }).done(function( response ) {
            ctrl_login.userInfo = response;
	        	console.log(response)
	        	var res = utils.get(response,"status");
	        	console.log(res,"RES",tipo)
	        	switch(parseInt(res)){
	        		case -1 : 
              if(tipo=="GOOGLE"){
                signOut();
                ctrl_login.modalNouser()
              }else{
                ctrl_login.loginError("Usuario o contraseña no son correctos");  
              }
               break;
	        		case 0 : ctrl_login.loginError("Su correo electrónico no ha sido confirmado, por favor revise su buzón y siga las instrucciones."); break;
	        		case 1 : $('.qtip-modal').qtip('hide');ctrl_login.callback(response);  break;
	        	}

	        }).fail(function( response ) {
	           	ctrl_login.loginError("Connection Error")
	    });   
	},
	loginError:function(msg){
		$('#alertLogin').empty();
		var msg = createAlertDiv("#alertLogin","Create Error",msg,true,'bg_error','qtipErrSign');
	},
	redirect: function(url){

		if(ctrl_login.href==""){			
           			 window.location = url || "/";
   				} else {
   					 window.location = ctrl_login.href || "/";
   				}
		
	},
	selectTipoUs : function(){
		ctrl_login.modal = template.render('#selectTipoT', '#modal', {id:1,data:{}});
  
        	createModal($('#selTipo'))

			ctrl_login.modal.on('cancel',function(event){	
				 $('.qtip-modal').qtip('hide');
			})

			ctrl_login.modal.on('cancel',function(event){	
				 $('.qtip-modal').qtip('hide');
			})

			ctrl_login.modal.on('cancel',function(event){	
				 $('.qtip-modal').qtip('hide');
			})
	},
  modalNouser : function(){
    ctrl_login.modal = template.render('#nouserT', '#modal', {id:1,data:{}});
  
          createModal($('#nouser'))

      ctrl_login.modal.on('cancel',function(event){ 
         $('.qtip-modal').qtip('hide');
      })

      ctrl_login.modal.on('goReg',function(event){ 
        ctrl_login.ctrlCallBack.registroOpen();
         $('.qtip-modal').qtip('hide');

      })

     
  },
  checkExistentUser2 : function(){


    $.ajax({
          type: 'POST',
          data: {username:profile.getEmail()},
          url: '/user/accesoGoogle',
          dataType: 'JSON'
          }).done(function( response ) {
           console.log(response,"response") 
           var res = response.status;

            switch(res){

              // 0 creada
              // 1 confirmada

              case 0 : console.log("no autorizada");  break;
              case 1 : ctrl_login.redirect("../");  break;
            }

          }).fail(function( response ) {
              ctrl_login.loginError("Connection Error")
      });   
  },
  createGoogle : function(tipo){

    ctrl_login.tipo = tipo;
     $.ajax({
          type: 'POST',
          data: {username:profile.getEmail(),tipo:tipo,id:profile.getId()},
          url: '/user/createGoogle',
          dataType: 'JSON'
          }).done(function( response ) {
           console.log(response,"response") 

            console.log(profile,"PROFILE")
            ctrl_login.login(profile.getEmail(),profile.getId());


           var res = response.status;

            switch(res){

              // 0 creada
              // 1 confirmada

              case 0 : console.log("no autorizada");  break;
              case 1 : ctrl_login.modalGoogle();  break;
          }

          }).fail(function( response ) {
              ctrl_login.loginError("Connection Error")
      });   
  },
  createLocal : function(tipo){


    var password = ctrl_login.ctrlCallBack.modal.get('password');
    var passwordc = ctrl_login.ctrlCallBack.modal.get('passwordc');
    var username = ctrl_login.ctrlCallBack.modal.get('username').toLowerCase();

    if(password!=passwordc){
       var msg = createAlertDiv("#alertLogin","Create Error","Las contraseñas no coinciden",true,'bg_error','qtipErrSign');
    }else{
      ctrl_login.tipo = tipo;
     $.ajax({
          type: 'POST',
          data: {username:username,tipo:tipo,password:password},
          url: '/user/createUser',
          dataType: 'JSON'
          }).done(function( response ) {
            console.log(response.status)
            if(response.status=='error'){
              var msg = createAlertDiv("#alertLogin","Create Error",response.msg,true,'bg_error','qtipErrSign');
            }else{
                ctrl_login.modalLocal(username);
            }                

          }).fail(function( response ) {
              ctrl_login.loginError("Connection Error")
      });   
    }
   

    
  },
  modalGoogle : function(){
    $('.qtip-modal').qtip('hide');

    ctrl_login.modal = template.render('#confirmaT', '#modal', {});
      
            createModal($('#confirma'))
            ctrl_login.modal.on('goPortada', function(event) {
                $('.qtip-modal').qtip('hide');              
            })

             ctrl_login.modal.on('cancel', function(event) {
                $('.qtip-modal').qtip('hide');
            })

            ctrl_login.modal.on('goPanel', function() {
                if(ctrl_login.tipo==1){
                window.location = "http://localhost:8600/app/empresa";  
              }else{
                window.location = "http://localhost:8600/app/empresa";  
              }

            })

  },
   modalLocal : function(username){
    $('.qtip-modal').qtip('hide');

   
    ctrl_login.modal = template.render('#localT', '#modal', {username:username});
      
            createModal($('#local'))
            ctrl_login.modal.on('confirm', function(event) {
                $('.qtip-modal').qtip('hide');
              
            })


             ctrl_login.modal.on('cancel', function(event) {
                $('.qtip-modal').qtip('hide');
              
            })

  }

}



// GOOGLE  OAUTH



function signIn() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signIn().then(function (e) {
      console.log("signIn")
    	 
    });
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
     
      
    });
  }

//--- Inscripción ---------------------------------------------------------------------
  var googleUser = {};
  var startApp = function() {
    gapi.load('auth2', function(){
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      auth2 = gapi.auth2.init({
        client_id: '485665433046-3v6hok8sfeu0th312tcllsb24apabvld.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin',
        // Request scopes in addition to 'profile' and 'email'
        //scope: 'additional_scope'
      });
      attachSignin(document.getElementById('customBtn'));
    });
  };

  function attachSignin(element) {
    console.log(element.id);
    auth2.attachClickHandler(element, {},
        function(googleUser) {
          profile = googleUser.getBasicProfile();
          $('#gSignInWrapper').html(loaderC)
          ctrl_login.createGoogle(ctrl_login.ctrlCallBack.modal.get('tipoCuenta'))
          //document.getElementById('name').innerText = "" + 
           //   googleUser.getBasicProfile().getName();
         
        }, function(error) {
          alert(JSON.stringify(error, undefined, 2));
        });
  }


   var startApp2 = function() {
    gapi.load('auth2', function(){
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      auth2 = gapi.auth2.init({
        client_id: '485665433046-3v6hok8sfeu0th312tcllsb24apabvld.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin',
        // Request scopes in addition to 'profile' and 'email'
        //scope: 'additional_scope'
      });
      attachSignin2(document.getElementById('customBtn2'));
    });
  };

  function attachSignin2(element) {
    console.log(element.id);
    auth2.attachClickHandler(element, {},
        function(googleUser) {

         profile = googleUser.getBasicProfile();      
         ctrl_login.login(profile.getEmail(),profile.getId(),"GOOGLE");
         $('.qtip-modal').qtip('hide')
          //document.getElementById('name').innerText = "" + 
           //   googleUser.getBasicProfile().getName();
         
        }, function(error) {
          alert(JSON.stringify(error, undefined, 2));
        });
  }




  function onSignIn(googleUser) {
  profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

  ctrl_login.checkSession(ctrl_login.ctrlCallBack.renderLogin);
}


 function onFailure(e){
 	console.log(e)
 } 


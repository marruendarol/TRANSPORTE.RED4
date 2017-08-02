/*===============================================================
/ NODE MODULES REQUIRE

TODO:  Session refresh !important
SWAPED ACCOUNT INFO !

TRAER INFO DE USUARIO PARA PUBOICACION DESDE BASE O REFRESCAR SESION
NO PODER CAMBIAR SI TIENE PUBLICACIONES O NO BORRAR IMAGEN

================================================================*/
 


/*-----------------------------------------------------------------------------------
    API USUARIOS
    transporte.red®
    v 1.0
-------------------------------------------------------------------------------------*/
var express = require('express');
var router = express.Router();
var databases = require('./database');
var mongoose = databases.mongoose;
var validators = databases.validators;
var ObjectId = require('mongoose').Types.ObjectId; 
var Schema = mongoose.Schema

var shortid = require('short-id');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

/*-----------------------------------------------------------------------------------
    ESQUEMA TRANSPORTISTA
-------------------------------------------------------------------------------------*/
var modelTransportista = {

        idUser   :  {type:Schema.Types.ObjectId,ctrl:"String",aliasN:"Id Usuario", visible:false,matchP: validators.short_field,},
        logotipo    : { type : Array , limit:1, ctrl:"UploadImage",folder:"logos",aliasN:"Logotipo", "default" : []},
        razonsocial : {type:'String',ctrl:"StringUpper", aliasN:"Razón Social",  matchP: validators.short_field},

        direccion   : { type : Array , limit:1, ctrl:"Addr",aliasN:"Dirección", "default" : [] },


        nombre :  {type:'String',ctrl:"StringUpper", aliasN:"Nombre",  matchP: validators.short_field},
        paterno : {type:'String',ctrl:"StringUpper", aliasN:"Apellido paterno",  matchP: validators.short_field},
        materno : {type:'String',ctrl:"StringUpper", aliasN:"Apellido materno",  matchP: validators.short_field},

        telcontacto  : {type:'String',ctrl:"PhoneMex",aliasN:"Teléfono",  matchP: validators.strlen},
        sitioweb : {type:'String',ctrl:"UrlLink", aliasN:"Sitio Web",  matchP: validators.short_field, default:''},

        empresa : {type:"Number"}

    }

var tSchema = mongoose.Schema(modelTransportista);

tSchema.index({ idUser : 1,empresa: 1 }); // schema level

// Schema Params
tSchema.set('minimize' , false)
tSchema.set('versionKey', false);
tSchema.set('autoIndex', true); // DEV

var transportistas = mongoose.model('transportistas', tSchema);


/*-----------------------------------------------------------------------------------
    ESQUEMA CLIENTE
-------------------------------------------------------------------------------------*/
var modelCliente = {

        idUser   :  {type:Schema.Types.ObjectId,ctrl:"String",aliasN:"Id Usuario", visible:false,matchP: validators.short_field,},

        razonsocial : {type:'String',ctrl:"StringUpper", aliasN:"Razón Social",  matchP: validators.short_field},
        direccion   : { type : Array , limit:1, ctrl:"Addr",aliasN:"Dirección", "default" : [] },

        nombre :  {type:'String',ctrl:"StringUpper", aliasN:"Nombre",  matchP: validators.short_field},
        paterno : {type:'String',ctrl:"StringUpper", aliasN:"Apellido paterno",  matchP: validators.short_field},
        materno : {type:'String',ctrl:"StringUpper", aliasN:"Apellido materno",  matchP: validators.short_field},

        telcontacto  : {type:'String',ctrl:"PhoneMex",aliasN:"Teléfono",  matchP: validators.strlen},
        sitioweb : {type:'String',ctrl:"UrlLink", aliasN:"Sitio Web",  matchP: validators.short_field, default:''},

    }

var cSchema = mongoose.Schema(modelCliente);

cSchema.index({ idUser : 1,empresa: 1 }); // schema level

// Schema Params
cSchema.set('minimize' , false)
cSchema.set('versionKey', false);
cSchema.set('autoIndex', true); // DEV

var clientes = mongoose.model('clientes', tSchema);

/*-----------------------------------------------------------------------------------
    SCHEMA & MODEL
-------------------------------------------------------------------------------------*/
var model = {
        username : {type:'String',ctrl:"String",aliasN:"Nombre de Usuario", matchP: validators.short_field, lowercase:true},
        password : {type:'String',ctrl:"String", aliasN:"Contraseña",  matchP: validators.short_field},
        status   : {type:'Number',ctrl:"", aliasN:"Estatus", default:0},
        tipo     : {type:'String',ctrl:"Combo",   aliasN:"Tipo de usuario"},
        cts      : {type: 'Date' ,ctrl:"Date"   , aliasN:"Fecha Creación", default: Date.now,visible:false },
        uts      : {type: 'Date' ,ctrl:"Date"  ,  aliasN:"Fecha Actualización", default: Date.now,visible:false },
        uid      : {type:'String'},
        name     : {type:'String'},
    }

var uSchema = mongoose.Schema(model);

uSchema.on('init', function (model) {
  // do stuff with the model
});


uSchema.index({ marca: 1}); // schema level

// Schema Params
uSchema.set('minimize' , false)
uSchema.set('versionKey', false);
uSchema.set('autoIndex', true); // DEV

var usuarios = mongoose.model('usuarios', uSchema);

//01800 2017566
//X97711 Soriana americas Celaya
//17 Diciembre 20:44
//i162017873


/*===============================================================
/ SECCIONES USUARIO
    // DEfault es primera en Array
================================================================*/

var modelSec = {};


// Necesitan ir en el orden de aparición


modelSec.empresa = {
    perms : {
        TRANSPORTISTA  : { user:1, client :1, del:true , create:true, modify:1 },
    },
    info : {
        ctrl        : "ctrl_empresa.js",
        ico         : "empresa24.png",
        fieldsRegEx     : [],
        fieldsExclude   : {},
        nombre      : "Empresa",
        url         : "empresa"
    },
    
}

modelSec.unidades = {
    perms : {
        TRANSPORTISTA  : { user:1, client :1, del:true , create:true, modify:1 },
        ASISTENTE  : { user:1, client :1, del:true , create:true, modify:1 },
        },
    info : {
            ctrl        : "ctrl_unidades.js",
            ico         : "unidades.png",
            fieldsRegEx     : [],
            fieldsExclude   : {},
            nombre      : "Unidades",
            url         : "unidades"
        },
    parent : "empresa"
}

modelSec.unidad = {
    perms : {
        TRANSPORTISTA  : { user:1, client :1, del:true , create:true, modify:1 },
        ASISTENTE  : { user:1, client :1, del:true , create:true, modify:1 },
        },
    info : {
            ctrl        : "ctrl_unidad.js",
            ico         : "unidades.png",
            fieldsRegEx     : [],
            fieldsExclude   : {},
            nombre      : "Unidad",
            url         : "unidad"
        },
    parent : "empresa",
    list: "unidades"
}

modelSec.bases = {
    perms : {
        TRANSPORTISTA  : { user:1, client :1, del:true , create:true, modify:1 },
        },
    info : {
            ctrl        : "ctrl_bases.js",
            ico         : "base24.png",
            fieldsRegEx     : [],
            fieldsExclude   : {},
            nombre      : "Bases",
            url         : "bases"
        },
    parent : "empresa"
}

modelSec.base = {
    perms : {
        TRANSPORTISTA  : { user:1, client :1, del:true , create:true, modify:1 },
        ASISTENTE  : { user:1, client :1, del:true , create:true, modify:1 },
        },
    info : {
            ctrl        : "ctrl_base.js",
            ico         : "base24.png",
            fieldsRegEx     : [],
            fieldsExclude   : {},
            nombre      : "Base",
            url         : "base"
        },
    parent : "empresa",
    list: "bases"
}


modelSec.dispositivos = {
    perms : {
        TRANSPORTISTA  : { user:1, client :1, del:true , create:true, modify:1 },
        },
    info : {
            ctrl        : "ctrl_dispositivos.js",
            ico         : "cell.png",
            fieldsRegEx     : [],
            fieldsExclude   : {},
            nombre      : "Dispositivos",
            url         : "dispositivos"
        },
    parent : "empresa"
}

modelSec.dispositivo = {
    perms : {
        TRANSPORTISTA  : { user:1, client :1, del:true , create:true, modify:1 },
        ASISTENTE  : { user:1, client :1, del:true , create:true, modify:1 },
        },
    info : {
            ctrl        : "ctrl_dispositivo.js",
            ico         : "cell.png",
            fieldsRegEx     : [],
            fieldsExclude   : {},
            nombre      : "Dispositivo",
            url         : "dispositivo"
        },
    parent : "empresa",
    list: "dispositivos"
}
// Perfil


modelSec.datos = {
    perms : {
        TRANSPORTISTA  : { user:1, client :1, del:true , create:true, modify:1 },
    },
    info : {
        ctrl        : "ctrl_personales.js",
        ico         : "perfil24.png",
        fieldsRegEx     : [],
        fieldsExclude   : {},
        nombre      : "Perfil",
        url         : "personales"
    },
    parent : "empresa",
}

modelSec.documentos = {
    perms : {
        TRANSPORTISTA  : { user:1, client :1, del:true , create:true, modify:1 },
    },
    info : {
        ctrl        : "ctrl_documentos.js",
        ico         : "docs24.png",
        fieldsRegEx     : [],
        fieldsExclude   : {},
        nombre      : "Documentos",
        url         : "documentos"
    },
    parent : "empresa",
}
modelSec.preferencias = {
    perms : {
        TRANSPORTISTA  : { user:1, client :1, del:true , create:true, modify:1 },
    },
    info : {
        ctrl        : "ctrl_pref.js",
        ico         : "pref24.png",
        fieldsRegEx     : [],
        fieldsExclude   : {},
        nombre      : "Preferencias",
        url         : "preferencias"
    },
    parent : "empresa",
}
modelSec.viajes = {
    perms : {
        TRANSPORTISTA  : { user:1, client :1, del:true , create:true, modify:1 },
    },
    info : {
        ctrl        : "ctrl_viajes.js",
        ico         : "viajes24.png",
        fieldsRegEx     : [],
        fieldsExclude   : {},
        nombre      : "Viajes",
        url         : "viajes"
    }
}

modelSec.mensajes = {
    perms : {
        TRANSPORTISTA  : { user:1, client :1, del:true , create:true, modify:1 },
    },
    info : {
        ctrl        : "ctrl_mensajes.js",
        ico         : "mensajes24.png",
        fieldsRegEx     : [],
        fieldsExclude   : {},
        nombre      : "Mensajes",
        url         : "mensajes",
    },
}

modelSec.reportes = {
    perms : {
        TRANSPORTISTA  : { user:1, client :1, del:true , create:true, modify:1 },
    },
    info : {
        ctrl        : "ctrl_reportes.js",
        ico         : "report24.png",
        fieldsRegEx     : [],
        fieldsExclude   : {},
        nombre      : "Reportes",
        url         : "reportes"
    }
}


// CLIENTE

modelSec.perfilCliente = {
    perms : {
       // CLIENTE  : { user:1, client :1, del:true , create:true, modify:1 },
    },
    info : {
        ctrl        : "ctrl_cuenta.js",
        ico         : "empresa24.png",
        fieldsRegEx     : [],
        fieldsExclude   : {},
        nombre      : "cuenta",
        url         : "cuenta"
    },
    
}

modelSec.viajes = {
    perms : {
        CLIENTE  : { user:1, client :1, del:true , create:true, modify:1 },     
        },
    info : {
            ctrl        : "ctrl_viajes.js",
            ico         : "unidades.png",
            fieldsRegEx     : [],
            fieldsExclude   : {},
            nombre      : "Viajes",
            url         : "viajes"
        },
    parent : "cuenta"
}

modelSec.viaje = {
    perms : {
        CLIENTE  : { user:1, client :1, del:true , create:true, modify:1 },    
        },
    info : {
            ctrl        : "ctrl_viaje.js",
            ico         : "unidades.png",
            fieldsRegEx     : [],
            fieldsExclude   : {},
            nombre      : "Viaje",
            url         : "viaje"
        },
    parent : "cuenta",
    list: "viajes"
}




/*===============================================================
/ CHECK SESSION
================================================================*/
router.post('/session',function(req,res){
	var sess=req.session;
	if(req.session.username!=undefined){
		var usObj = {};
        res.status(200).json({status:1,description:"active session",userInfo:sess.userInfo,tipo:sess.tipo,seccs:sess.seccs,username:sess.username});
	}else{
        res.status(200).json({status:'failed',description:"no active session",statusCode:200});
	}
});


router.post('/refreshSession',function(req,res){
    var sess=req.session;
    if(req.session.username!=undefined){
        var usObj = {};
        res.status(200).json({status:1,description:"active session",userInfo:sess.userInfo,tipo:sess.tipo,seccs:sess.seccs,username:sess.username});
    }else{
        res.status(200).json({status:'failed',description:"no active session",statusCode:200});
    }
});


router.get('/categorias', function(req, res) {
    res.status(200).json(databases.categorias)   
 });

router.get('/extras', function(req, res) {
    res.status(200).json(databases.extras)   
 });

router.get('/carac', function(req, res) {
    res.status(200).json(databases.caracteristicas)   
 });



router.get('/tipogas', function(req, res) {
    res.status(200).json([
                    {value: "Magna", text: "MAGNA"},
                    {value: "Premium", text: "PREMIUM"},
                    {value: "Diésel", text: "DIÉSEL"},
                    {value: "Gas", text: "GAS"},
                    
                ])   
 });   
/*===============================================================
/ LOGIN PACIENTE
================================================================*/
router.post('/acceso', function(req, res) {
	console.log('acceso');
    var username = req.body.username;
    var password = req.body.password;
    var retFields = { 'password': 0,'cts':0 };

    usuarios.find({ 'username': username, 'password': password }, retFields, function(err, result) {
        if(result.length==0){
            res.status(200).json({status:-1})    
        }else{
            if(result[0].status==1){
                var sess=req.session;
                console.log(result[0],"RESULTADO USUARIO")
                sess._id       = result[0]._id;
                sess.username = result[0].username;
                sess.tipo     = result[0].tipo;
                sess.name     = result[0].name;

                if(sess.tipo=="TRANSPORTISTA"){
                    getTransportistaInfo(result[0],res,req)
                }
                if(sess.tipo=="CLIENTE"){
                    getClienteInfo(result[0],res,req)
                }
            }else{
                res.status(200).json(result[0])    
            }
            
        }
        
    });
});

router.post('/getStatus', function(req, res) {
    console.log('acceso');
    var username = req.body.email;
    var uid = req.body.uid;
    var retFields = { 'password': 0,'cts':0 };

    usuarios.findOneAndUpdate({ 'username': username, 'uid': uid }, {status:1}, function(err, result) {
        console.log(result,"DIC")
        if(result==null){
            res.status(200).json({status:0})   
        }else{

          var sess=req.session;
          console.log(result,"RESULTADO USUARIO")
           sess._id       = result._id;
           sess.username = result.username;
           sess.tipo     = result.tipo;

            if(sess.tipo=="TRANSPORTISTA"){
                getTransportistaInfo(result,res,req)
            }
            if(sess.tipo=="CLIENTE"){
                getClienteInfo(result,res,req)
            }

            

        }   
        
    });
});



function getTransportistaInfo(data,res,req){
    
    transportistas.find({idUser:new ObjectId(data._id)},{},function(err,result){
        var sess=req.session;
        sess.userInfo = result[0];
        sess.empresa  = result[0].empresa;
        sess.seccs = getModelPerms("TRANSPORTISTA");
        res.status(200).json({status:1,tipo:"TRANSPORTISTA",result:result[0],seccs : sess.seccs,username:sess.username})
    })
    
}

function getClienteInfo(data,res,req){
    
    clientes.find({idUser:new ObjectId(data._id)},{},function(err,result){
        var sess=req.session;

        sess.userInfo = result[0];
        sess.seccs = getModelPerms("CLIENTE");
        res.status(200).json({status:1,tipo:"CLIENTE",result:result[0],seccs : sess.seccs})
    })
    
}


function getModelPerms(userType){
    var pArr = [];
    for (var a in modelSec){
        if(modelSec[a].perms[userType]!=undefined){
            pArr.push(modelSec[a])
        }
    }
    return pArr;
}




function createTransportista(obj,callback){
    obj.tipo = "TRANSPORTISTA";
    obj.name = "TR" + shortid.generate();

     createUsuario(obj,function(res){
            obj.idUser = res._id
            var tr = new transportistas(obj);
            tr.save(function(err){
             if (err) {
                callback(err);
              } else {
                callback(res)
              }
          });

    })

   

}
function createCliente(obj,callback){
    obj.tipo = "CLIENTE";
    obj.name = "CL" + shortid.generate();


    createUsuario(obj,function(res){
        obj.idUser = res._id;
        var cl = new clientes(obj);
        cl.save(function(err){
         if (err) {
            callback(err);
          } else {
            callback(res)
          }
        });
    })

    
}
function createUsuario(obj,callback){
    var ru = new usuarios(obj);
    ru.save(function(err){
     if (err) {
        callback(err);
      } else {
        callback(ru)
      }
    })
}
/*===============================================================
/ INTERNAL : CHECK USER 
================================================================*/
function userCheckExists(username, callback) {
    var exists;
    usuarios.count({ 'username': username }, function(err, count) {
        //console.log("medico count ",count)
        if (count == 0) {
            exists = false;
        } else {
            exists = true;
        }
        callback(err, exists);
    });
};

router.post('/accesoGoogle', function(req, res) {

var username = req.body.username;
    var retFields = {};

   usuarios.find({ 'username': username }, retFields, function(err, result) {
        if(result.length==0){
            res.status(200).json({status:-1})    
        }else{
            if(result[0].status==1){
                var sess=req.session;
                console.log(result[0],"RESULTADO USUARIO")
                sess._id       = result[0]._id;
                sess.username = result[0].username;
                sess.tipo     = result[0].tipo;

                if(sess.tipo=="TRANSPORTISTA"){
                    getTransportistaInfo(result[0],res,req)
                }
                if(sess.tipo=="CLIENTE"){
                    getClienteInfo(result[0],res,req)
                }
            }else{
                res.status(200).json(result[0])    
            }
            
        }
        
    });
});



router.post('/createGoogle', function(req, res) {

    var username = req.body.username;
    var id        = req.body.id;
    var retFields = {password:0};
    var tipo = req.body.tipo;

    usuarios.find({ 'username': username }, retFields, function(err, result) {
        

        console.log(result,tipo,"resuser")
        if(result.length==0 && tipo!=""){

            var obj = {
            username : req.body.username,
            password : req.body.id,
            tipo     : tipo
            }
  
            if(obj.tipo=="TRANSPORTISTA"){
                    obj.status = 1;
                    createTransportista(obj,function(result){
                    sendConfirmacionGoogle(username)
                        res.json({status:1}); 
                    })
            }
            if(obj.tipo=="CLIENTE"){
                     obj.status = 1;
                    createCliente(obj,function(result){
                        sendConfirmacionGoogleUsuario(username)
                        res.json({status:1}); 
                    });
            } 

        }else{
            res.json(result);    
        }

        
    });
});


/*===============================================================
/ CREATE USER
     - Check existante Email
================================================================*/
router.post('/createUser', function(req, res) {

   // shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'); 
    var uid = shortid.generate();

    var obj = {
        username : req.body.username,
        password : req.body.password,
        tipo     : req.body.tipo,
        uid      : uid
    }

    console.log("TREA")
  

    userCheckExists(obj.username,function(err,count){

        if(count){
            res.status(200).json({msg:"Un usuario ya ha sido registrado previamente con ese correo electrónico",status:"error"})
        }else{
            if(obj.tipo=="TRANSPORTISTA"){
                 obj.status = 0;
                createTransportista(obj,function(result){
                    sendConfirmacion(obj.username,obj.uid)
                    res.json({status:1});    
                })
            }
            if(obj.tipo=="CLIENTE"){
                 obj.status = 0;
                createCliente(obj,function(result){
                    sendConfirmacion(obj.username,obj.uid)
                   res.json({status:1}); 
                });
            }
        }
    })
  


});



/*===============================================================
/ DESTROY SESSION
================================================================*/
router.get('/cerrarSesion',function(req,res){
       req.session.destroy() 
       res.status = {status:'ok',description:"",statusCode:200};
       res.json({'status':'ok'});
});


/*===============================================================
/ PASSWORD RECOVERY
================================================================*/
router.post('/recovery', function(req, res) {

    var email = req.body.email
    var collection = dbMongo.pacientes
    var criteria = { 'username': email };

    collection.find(criteria, function(err, result) {
        if (result.length > 0) {
            var mail = { msg: "Tu contraseña es : " + result[0].password, recipients: result[0].username, subject: "Recuperación de contraseña" };
            ctrl_smtp.init(mail, res);
        } else {
            res.json({ status: "ok" })
        }

    });
});

/*===============================================================
/ ENVIAR EMAIL
================================================================*/
router.post('/sendNotification',function(req,res){
    var mail = req.body.mail;
    ctrl_smtp.init(mail,res);
});


function sendConfirmacion(username,uid){
        var jsonObj = { email: username,subject:"Creación de cuenta transporte.red", uid:uid, bcc:"ventas@transporte.red" };
        ctrl_smtp.loadTemplate("confirmacion.html", jsonObj);
}

function sendConfirmacionGoogle(username){
        var jsonObj = { email: username,subject:"Creación de cuenta transporte.red",  bcc:"ventas@transporte.red"  };
        ctrl_smtp.loadTemplate("confirmacion_google.html", jsonObj);
}


function sendConfirmacionGoogleUsuario(username){
        var jsonObj = { email: username,subject:"Creación de cuenta transporte.red",  bcc:"ventas@transporte.red"  };
        ctrl_smtp.loadTemplate("confirmacion_googleUsuario.html", jsonObj);
}



/*===============================================================
/ SMTP CLASS
================================================================*/

var fs = require('fs');
var Ractive = require('ractive');
var path = require('path');
var appDir = path.dirname(require.main.filename);

var ctrl_smtp = {
    connection: {},
    mail: {},
    loadTemplate : function(url,jsonData){
        fs.readFile(appDir + '/public/mailing/' + url,'utf8',function (err, data){

        var ractive = new Ractive({
        template: data,
        data : jsonData
        });
    
        var html = ractive.toHTML()
        ctrl_smtp.init(html,jsonData)
    

        });
    },
    init: function(html,jsonData) {
       
       
        if(jsonData.bcc==undefined) { jsonData.bcc=""};

        var transporter = nodemailer.createTransport(smtpTransport({
            host: 'secure.emailsrvr.com',
            port: '465',
            secure: true,
            auth: {
                user: 'info@transporte.red',
                pass: 'kf83k9WSdezvdyXn'
            }
        }));
        
        transporter.sendMail({
            from: 'info@transporte.red',
            to: jsonData.email,
            bcc : jsonData.bcc,
            //text: mail.msg,
            subject : jsonData.subject,
            html: html
        }, function(response) {
            console.log("Correo Enviado", response)
           
                //ctrl_smtp.res.json(response)
          

        });

    }

}




module.exports = router;
module.exports.transportistas = transportistas;
module.exports.modelTransportista = modelTransportista;

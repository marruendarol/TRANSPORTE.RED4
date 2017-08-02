/*-----------------------------------------------------------------------------------
	API PUBLICACION
	transporte.red®
	v 1.0
-------------------------------------------------------------------------------------*/

var express = require('express');
var router = express.Router();
var databases = require('./database');
var dbf = require('./utilities');
var shortid = require('short-id');
var mongoose = databases.mongoose;
var ObjectId = require('mongoose').Types.ObjectId; 
var validators = databases.validators;

var Schema = mongoose.Schema

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var unidades = require('./unidad');
var explain = require('mongoose-explain');

shortid.configure({
    length: 10,          // The length of the id strings to generate
    algorithm: 'sha1',  // The hashing algoritm to use in generating keys
    salt: Math.random   // A salt value or function
});

/*-----------------------------------------------------------------------------------
	SCHEMA & MODEL  // AL NEED GROUP
-------------------------------------------------------------------------------------*/


var model = {
        conversationId     : {type:'String'},
        msgs               : {type:Array},
	    ts 		: {type: 'Date' ,ctrl:"Date"  ,aliasN:"Fecha Creación", default: Date.now,visible:false },
        estatus : {type:'Number',default:0},
        msgs    : {type:Array},
        extID   : {type:"String"},
        userOr  : {type:Schema.Types.ObjectId},
        name    : {type:"String"},
        tipo    : {type:"String"},
        tipoDesc: {type:"String"},
        recipients : {type:Array}
	}
  

var mSchema = mongoose.Schema(model);

//mSchema.plugin(explain);  //  EXPLAIN QUERY 

mSchema.on('init', function (model) {
  // do stuff with the model
});


mSchema.index({ }); // schema indexes

// Schema Params
mSchema.set('minimize' , false)
mSchema.set('versionKey', false);
mSchema.set('autoIndex', true); // DEV

var messages = mongoose.model('messages', mSchema);


/*-----------------------------------------------------------------------------------

-------------------------------------------------------------------------------------*/


router.post('/addMsg',function(req,res){

    // Usuario ExtTID tipo

    var data = {};


    var extID = req.body.idPub;
    var userid = req.session._id;
    var tipo = req.body.tipo;

    var msgKey = {extID:extID,userOr:userid,tipo:tipo}

    var msg = req.body.msg;
    msg.ts = new Date();
    msg.estatus = 0;
    msg.name = req.session.name;

    console.log(msg,"MSG")

     messages.findOneAndUpdate(msgKey,
        {$push: {'msgs':msg}},
        {upsert:true},
        function(err,doc){
           sendMensajePub(msg)
                res.send({status:"ok"});
    })

});

router.post('/readAll',function(req,res){


    var userid = req.session._id;

console.log(userid,"USER ID reading")
     var msgKey = {'msgs.destMsg': String(userid)}

    messages.find(msgKey,{},function(err,result){
        if(!err){
             res.status(200).json(result)   
         }else{
            res.status(400);
         }
    });

});
router.post('/readMsgs',function(req,res){

    var extID = req.body.extID;
    var userid = req.session._id;
    var tipo = req.body.tipo;


     var msgKey = {extID:extID,userOr:userid,tipo:tipo}

    messages.find(msgKey,{},function(err,result){
        if(!err){
             res.status(200).json(result[0])   
         }else{
            res.status(400);
         }
    });

});    


function sendMensajePub(data){
        
    console.log(data,"Data to send")
        var jsonObj = { data:data, email: data.info.destMsg,subject:"Tienes una pregunta en transporte.red", bcc:"ventas@transporte.red" };
        ctrl_smtp.loadTemplate("mensajePublicacion.html", jsonObj);
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
            console.log("Correo Enviado", response, jsonData.email)
           
                //ctrl_smtp.res.json(response)
          

        });

    }

}



/*-----------------------------------------------------------------------------------
	EXPORT EXPRESS ROUTER
-------------------------------------------------------------------------------------*/
module.exports = router;
module.exports.messages = messages;
module.exports.modelMsgCenter = model;



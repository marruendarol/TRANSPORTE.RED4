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
        uid     : {type:'String'},
        info    : {},
        user    : {type:'String'},
        empresa : {type:'Number'},
        userId  : {type:Schema.Types.ObjectId},
        fechas  : [{dia:'String',abrMes:"String",numDia:'Number',tipo:'Boolean','date':"Date"}],
	    ts 		: {type: 'Date' ,ctrl:"Date"  ,aliasN:"Fecha Creación", default: Date.now,visible:false },
        estatus : {type:'Number',default:0},
        msgs    : {type:Array},
        costos  : {}
	}
  

var mSchema = mongoose.Schema(model);

//mSchema.plugin(explain);  //  EXPLAIN QUERY 

mSchema.on('init', function (model) {
  // do stuff with the model
});


mSchema.index({ fechas: 1,estatus:1,'info.tipo':1,'fechas':1 }); // schema indexes

// Schema Params
mSchema.set('minimize' , false)
mSchema.set('versionKey', false);
mSchema.set('autoIndex', true); // DEV

var publicacion = mongoose.model('publicaciones', mSchema);



/*-----------------------------------------------------------------------------------
   CRON JOB delete old pubs
-------------------------------------------------------------------------------------*/

router.get('/tp',function(req,res){
 //   pubMaint();
});


function pubMaint(){
     // Stamps
   
   var fechaAct  = new Date();
  
            publicacion.find({'estatus':0},{fechas:1,estatus:1},function(err,doc){
                
                //console.log("regreso res")

                for (var i = 0; i < doc.length; i++) {
                    var lastDoc = doc[i].fechas[doc[i].fechas.length-1]
                    var fechaD = lastDoc.date;

                            if(fechaD<fechaAct){
                                console.log(lastDoc,"RT"); 
                                doc[i].estatus = 3;   
                                doc[i].save(function(err){
                                    console.log("saved")
                                })
                            }
  
                }
                
            })

}
//setInterval(pubMaint, 60 * 60 *1000);  // Correo proceso cada hora

/*-----------------------------------------------------------------------------------
	CREATE UNIDADES
-------------------------------------------------------------------------------------*/
router.post('/save',function(req,res){

    // Stamps
    req.body.data.empresa = req.session.empresa; 
    req.body.data.user    = req.session.username; 
    req.body.data.userId  = req.session._id;

	var nu = new publicacion(req.body.data)

    console.log("grabando publiciacion")
    counter.findByIdAndUpdate({_id: '1'}, {$inc: { seq: 1} }, {new: true, upsert: true}).then(function(count) {
        console.log("...count: "+JSON.stringify(count));
        nu.uid = count.seq;

    	nu.save(function(err){
    	 if (err) {
        console.log(err);
    	  } else {

            console.log(req.body.data.info._id,"ID DEL VEHICULO")
            unidades.unidades.findByIdAndUpdate(req.body.data.info._id,{estatus:1,pubID:nu.uid},function(err,doc){
               // res.send(data);
               console.log("unidad actualizada")
        });

    	    res.json({status:"Created"})
    	  }
    	})


    },function(err){

            console.log(err,"ERR")
        });

});


router.post('/read',function(req,res){

    var id = String(req.body.id);

    publicacion.find({uid:id},{},function(err,result){
        if(!err){
             res.status(200).json(result[0])   
         }else{
            res.status(400);
         }
    });

});    


router.post('/quitar',function(req,res){

    // Stamps
    req.body.data.empresa = req.session.empresa; 
    req.body.data.user    = req.session.username; 

    var idPub = req.body.data.idPub;
    var idUnidad = req.body.data.idUnidad;
  

    console.log(idPub,idUnidad,{'info.pubID':idPub})
    unidades.unidades.findByIdAndUpdate(idUnidad,{estatus:0,pubID:0},function(err,doc){
            publicacion.findOneAndUpdate({'uid':idPub},{$set : {'estatus':2}},{new:false},function(err,doc){
                console.log(err,doc)
                res.send({status:"ok"});
            })
            
    });



});






var CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1000 }
});
var counter = mongoose.model('counter', CounterSchema);



/*-----------------------------------------------------------------------------------
	EXPORT EXPRESS ROUTER
-------------------------------------------------------------------------------------*/
module.exports = router;
module.exports.publicacion = publicacion;
module.exports.modelPublicacion = model;
module.exports.counter = counter;


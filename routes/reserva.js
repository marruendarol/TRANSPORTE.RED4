/*-----------------------------------------------------------------------------------
	API RESERVA
	transporte.red®
	v 1.0
-------------------------------------------------------------------------------------*/

var express = require('express');
var router = express.Router();
var databases = require('./database');
var dbf = require('./utilities');
var counter = require('./publicacion');

var shortid = require('short-id');
var mongoose = databases.mongoose;
var ObjectId = require('mongoose').Types.ObjectId; 
var validators = databases.validators;

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
        daysOn  : {type: mongoose.Schema.Types.Mixed, default: {}},
        user    : {type:'String'},
	    ts 		: {type: 'Date' ,ctrl:"Date"  ,aliasN:"Fecha Creación", default: Date.now,visible:false },
        estatus : {type:'Number',default:0},
        pubModel: {type: mongoose.Schema.Types.Mixed, default: {}}
	}
  

var mSchema = mongoose.Schema(model);

//mSchema.plugin(explain);  //  EXPLAIN QUERY 

mSchema.on('init', function (model) {
  // do stuff with the model
});


//mSchema.index({ fechas: 1,estatus:1,'info.tipo':1,'fechas':1 }); // schema indexes

// Schema Params
mSchema.set('minimize' , false)
mSchema.set('versionKey', false);
mSchema.set('autoIndex', true); // DEV

var reserva = mongoose.model('reservas', mSchema);


/*-----------------------------------------------------------------------------------
	CREATE UNIDADES
-------------------------------------------------------------------------------------*/
router.post('/save',function(req,res){

	var nu = new reserva()
    counter.counter.findByIdAndUpdate({_id: '2'}, {$inc: { seq: 1} }, {new: true, upsert: true}).then(function(count) {
        console.log("...count: "+JSON.stringify(count));
        nu.uid = count.seq;
        nu.pubModel = req.body.pubModel;
        nu.daysOn = req.body.daysOn;

    	nu.save(function(err){
    	 if (err) {
        console.log(err);
    	  } else {

    	    res.json({status:"Reserva Creada",uid:count.seq})
    	  }
    	})


    },function(err){

            console.log(err,"ERR")
        });

});


router.post('/read',function(req,res){

    var id = String(req.body.id);

    reserva.find({uid:id},{},function(err,result){
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
            reserva.findOneAndUpdate({'uid':idPub},{$set : {'estatus':2}},{new:false},function(err,doc){
                console.log(err,doc)
                res.send({status:"ok"});
            })
            
    });



});





/*-----------------------------------------------------------------------------------
	EXPORT EXPRESS ROUTER
-------------------------------------------------------------------------------------*/
module.exports = router;
module.exports.reserva = reserva;
module.exports.modelreserva = model;


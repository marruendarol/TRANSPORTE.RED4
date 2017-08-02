/*-----------------------------------------------------------------------------------
	API pagos
	transporte.red®
	v 1.0
-------------------------------------------------------------------------------------*/

var express = require('express');
var router = express.Router();
var databases = require('./database');
var dbf = require('./utilities');
var mongoose = databases.mongoose;
var validators = databases.validators;

/*-----------------------------------------------------------------------------------
	SCHEMA & MODEL  // AL NEED GROUP
-------------------------------------------------------------------------------------*/
var model = {
        nombre   : {type:'String',ctrl:"String",aliasN:"Nombre", matchP: validators.strlen, popInfo:"ej. Celular Chofer 1"},

        user    : {type:'String'},
        empresa : {type:'Number'},
	    ts 		: {type: 'Date' ,ctrl:"Date"  ,aliasN:"Fecha Creación", default: Date.now,visible:false },
	}
  

var mSchema = mongoose.Schema(model);

mSchema.on('init', function (model) {
  // do stuff with the model
});


mSchema.index({ empresa: 1 }); // schema indexes

// Schema Params
mSchema.set('minimize' , false)
mSchema.set('versionKey', false);
mSchema.set('autoIndex', true); // DEV

var pagos = mongoose.model('pagos', mSchema);

/*-----------------------------------------------------------------------------------
	READ MODEL
-------------------------------------------------------------------------------------*/
router.get('/model',function(req,res){
	res.json(model)
});

/*-----------------------------------------------------------------------------------
	READ pagos
-------------------------------------------------------------------------------------*/
router.post('/all',function(req,res){
	pagos.find({},function(err,docs){
		res.json(docs)
	})
});

/*-----------------------------------------------------------------------------------
	READ pagos
-------------------------------------------------------------------------------------*/
router.get('/item/:itemId',function(req,res){
	var _id = req.params.itemId;
	var projection = {ts:0}
	pagos.findById(_id,projection,function(err,docs){
		res.json(docs)
	})
});


/*-----------------------------------------------------------------------------------
    GET pagos
-------------------------------------------------------------------------------------*/
router.get('/pagos',function(req,res){

    var _id = req.body._id;

    pagos.find({},function(err,doc){
        if (err) return handleError(err);
        var items = [];
        for (var i = 0; i < doc.length; i++) {
            items.push({value:doc[i]._id,text:doc[i].nombre})
        }

        res.json(items)
    });
});

/*-----------------------------------------------------------------------------------
	CREATE pagos
-------------------------------------------------------------------------------------*/
router.post('/save',function(req,res){

     // Stamp empresa
    req.body.data.empresa = req.session.empresa; 
    req.body.data.user    = req.session.username; 

	var nu = new pagos(req.body.data)
	nu.save(function(err){
	 if (err) {
    console.log(err);
	  } else {
	    res.json({status:"Created"})
	  }
	})

});

/*-----------------------------------------------------------------------------------
	UPDATE UNIDAD
-------------------------------------------------------------------------------------*/
router.post('/update/:itemId',function(req,res){
	var _id = req.params.itemId;
	var data = req.body.data;
	pagos.findByIdAndUpdate(_id,data,function(err,doc){
            res.send(data);
	});
});


/*-----------------------------------------------------------------------------------
	DELETE UNIDADE
-------------------------------------------------------------------------------------*/
router.post('/remove',function(req,res){

	var _id = req.body._id;

	pagos.remove({_id:_id},function(err,doc){
		if (err) return handleError(err);
		res.json({'status':'ok'})
	});
});


/*-----------------------------------------------------------------------------------
	READ LIST
-------------------------------------------------------------------------------------*/

router.post('/read', function(req, res) {

    var route =    req.body.route;

    var qObj = {'pageInfo':{}};

    var mOrd = 1
    if(req.body.sd=="DESC"){ mOrd=-1 }

    qObj.pageInfo.pn     = parseInt(req.body.pn) || 1;
    qObj.pageInfo.rpp    = parseInt(req.body.rpp)   || 100 ;
    qObj.pageInfo.si     = req.body.si   || "_id";
    qObj.pageInfo.sd     = parseInt(mOrd)    || -1;
    qObj.pageInfo.q      = req.body.q;
    qObj.pageInfo.cl     = req.body.client || "";

    // Session Data
    var sess       = req.session;
    var username   = sess.username;
    var userRole   = sess.userRole;
    var clients    = sess.clients;

    console.log(req.body,"QOBJ")

    var fields = {}; // Exclude Fields  field:0

    var fieldsRegEx = ['marca']; // Incluye en la búsqueda
    var sortObj = {};
    sortObj[qObj.pageInfo.si] = qObj.pageInfo.sd;

    var criteria = {empresa:sess.empresa};

    console.log(sortObj,"SORT")

    if(qObj.pageInfo.q!=""){  // Filters 
       dbf.setRegEx(criteria,fieldsRegEx,qObj.pageInfo.q);
    }
  
    // Count
    pagos.count(criteria, function(err, result) {
        console.log(err,result,criteria)
        qObj.pageInfo.tc = result;
        qObj.pageInfo.tp = Math.ceil(result / qObj.pageInfo.rpp);

            pagos.find(criteria,fields).limit(qObj.pageInfo.rpp).skip((qObj.pageInfo.pn-1)*qObj.pageInfo.rpp).sort(sortObj).exec(function(err, result) {
             //   console.log(err,result)
            qObj.data = result
            res.json(qObj);
            });
    });
    // Find

});


/*-----------------------------------------------------------------------------------
	EXPORT EXPRESS ROUTER
-------------------------------------------------------------------------------------*/
module.exports = router;




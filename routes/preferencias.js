/*-----------------------------------------------------------------------------------
	API preferencias
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
/*
// Datos Bancarios Tarjeta cuenta clabe 
      Cuenta Depósitos 
        CLABE BANCO 
    Tarjeta de Credito Pagos al portal

// Datos de Facturación
// Preferencias 
// Datos Básicos de contacto
        - Nombres
        - Dicrección 
        - Teléfono
        - Logotipo
// Documentación
    - Acta constitutiva
    - 
Estados de cuenta 

*/
/*
Perfil 


Pagos y Facturación
Documentos
Datos Personales
Preferencias
*/

var model = {

        busquedaSin : {type:'Number',ctrl:"Radio", aliasN:"Recibir Avisos de búsquedas relacionadas con unidades similares", group:"Notificaciones", default:1,
        options:[{nameo:"autoc",val:1,text:"Si"},{nameo:"autoc",val:2,text:"No"}],
        popInfo:"Aunque no este su unidad publicada recibira avisos de los usuarios que estén buscando unidades similares "},

        resumen : {type:'Number',ctrl:"Radio", aliasN:"Recibir resumen diario de movimientos en correo electrónico",  default:1,
        options:[{nameo:"autoc",val:1,text:"Si"},{nameo:"autoc",val:2,text:"No"}],
        popInfo:"Aunque no este su unidad publicada recibira avisos de los usuarios que estén buscando unidades similares "},

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

var preferencias = mongoose.model('preferencias', mSchema);




/*-----------------------------------------------------------------------------------
	READ MODEL
-------------------------------------------------------------------------------------*/
router.get('/model',function(req,res){
	res.json(model)
});

/*-----------------------------------------------------------------------------------
	READ preferencias
-------------------------------------------------------------------------------------*/
router.post('/all',function(req,res){
	preferencias.find({},function(err,docs){
		res.json(docs)
	})
});

/*-----------------------------------------------------------------------------------
	READ preferencias
-------------------------------------------------------------------------------------*/
router.get('/item/:itemId',function(req,res){
	var _id = req.params.itemId;
	var projection = {ts:0}
	preferencias.findById(_id,projection,function(err,docs){
		res.json(docs)
	})
});




/*-----------------------------------------------------------------------------------
	CREATE preferencias
-------------------------------------------------------------------------------------*/
router.post('/save',function(req,res){

    // Stamps
    req.body.data.empresa = req.session.empresa; 
    req.body.data.user    = req.session.username; 

	var nu = new preferencias(req.body.data)
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
	preferencias.findByIdAndUpdate(_id,data,function(err,doc){
            res.send(data);
	});
});


/*-----------------------------------------------------------------------------------
	DELETE UNIDADE
-------------------------------------------------------------------------------------*/
router.post('/remove',function(req,res){

	var _id = req.body._id;

	preferencias.remove({_id:_id},function(err,doc){
		if (err) return handleError(err);
		res.json({'status':'ok'})
	});
});



/*-----------------------------------------------------------------------------------
	READ LIST
-------------------------------------------------------------------------------------*/

router.post('/read', function(req, res) {


    var sess=req.session;
   // console.log(sess)

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


    var fields = {}; // Exclude Fields  field:0

    var fieldsRegEx = ['marca','placas']; // Incluye en la búsqueda
    var sortObj = {};
    sortObj[qObj.pageInfo.si] = qObj.pageInfo.sd;

    var criteria = {empresa:sess.empresa};

    console.log(sortObj,"SORT")

    if(qObj.pageInfo.q!=""){  // Filters 
       setRegEx(criteria,fieldsRegEx,qObj.pageInfo.q);
    }

    // Count
    preferencias.count(criteria, function(err, result) {
        console.log(err,result,criteria)
        qObj.pageInfo.tc = result;
        qObj.pageInfo.tp = Math.ceil(result / qObj.pageInfo.rpp);

            preferencias.find(criteria,fields).limit(qObj.pageInfo.rpp).skip((qObj.pageInfo.pn-1)*qObj.pageInfo.rpp).sort(sortObj).exec(function(err, result) {
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
module.exports.preferencias = preferencias;


/*===============================================================
/ NODE MODULES REQUIRE
================================================================*/
var express = require('express');
var router = express.Router();
var databases = require('./database');
var utils = require('./utilities');
var dbMongo = databases.dbMongo;
var  ObjectID = databases.mongojs.ObjectId;
var sendRes = mainf.sendRes;
var shortid = require('short-id');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

/* MODULOS de EXPEDIENTE
            -1 Historial Familiar
            -2 Vacunas
            -3 Historial 
            -4 Estudios
            -5 
 */


/*===============================================================
/ Read List
================================================================*/
	exports.read_List = function(req,res){
		
	};

/*===============================================================
/ Read List
================================================================*/
	exports.read_Single = function(req,res){
		
	};	


/*===============================================================
/ Read Single by ID  
================================================================*/
router.post('/createPaciente',function(req,res){
	//var data = req.body.dataB;
	var curp = req.body.dataB.curp;
	console.log(data);
	var data = {info: req.body.dataB };
	//shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@'); 
	data.uid = shortid.generate();

	var pacienteID;

	var sess=req.session;

	pacienteCheckExists(curp,function(err,exists){
		if(exists){
			res.status = {status:'failed',description:"Curp Existente",statusCode:400};
			res.send(res.status);
		}else{
			dbMongo.pacientes.insert(data, function(err, doc){
			 if(err) throw err;
			 pacienteID = doc._id;

			 var paciente = pacienteID; 
			 var medico = req.session.userId;

			 console.log("Creando permiso de expedientes")
			 crearPermNuevoPaciente(paciente,medico,function(){
				res.send({data:doc});	
			 })
				
							
			});
		}	
	});
});

/*===============================================================
/ Crear Permiso al ser creado por un doctor siendo nuevo
================================================================*/
function crearPermNuevoPaciente (paciente,medico,callback,perms){
	var data = {   
		paciente   	: ObjectID(paciente),
		medico 	  	: ObjectID(medico),
		statusPerm 	: 1,
		personales  	: 1,
		antecedentes : 1,
		estudios   	: 1,
		notas      	: 1	,
		ts 		  	: Math.round(new Date() / 1000)

	};

	dbMongo.perms.insert(data, function(err, doc){
		if(err) throw err;	
		callback({data:doc});				
	});
}	


/*===============================================================
/ Create Permission  
================================================================*/
router.post('/solExpediente',function(req,res){
	var sess=req.session;
	var paciente = "";
	var medico = req.session.userId;
	var data = req.body.dataB;
	var curp = req.body.dataB.curp;

	console.log(req.body.dataB,"-----------------", data.notas);

	dbMongo.pacientes.find({'info.curp': curp}, function(err, docs){
	paciente = docs[0]._id;
	var obj = {   
		paciente   	: ObjectID(paciente),
		medico 	  	: ObjectID(medico),
		statusPerm 	: 0,
		personales  	: data.personales,
		antecedentes : data.antecedentes,
		estudios   	: data.estudios,
		notas      	: data.notas,
		ts 		  	: Math.round(new Date() / 1000)
	};

	console.log(paciente,medico,"DATOS ");

	 var sorting = {'_id':1};

	 dbMongo.perms.findAndModify({
		query: {paciente : ObjectID(paciente), medico : ObjectID(medico) },
		sort: sorting,
		update: {'$set' : obj },
		upsert: true
		},function(err,docs){
			console.log(err,docs);
			res.json(docs);
		});
	});
});

/*===============================================================
/ GET PERMISSION BY CURP
================================================================*/
router.post('/getPerm',function(req,res){
	var sess=req.session;
	var paciente = "";
	var medico = req.session.userId;
	var data = req.body.dataB;
	var curp = req.body.dataB.curp;

	console.log(req.body.dataB,"-----------------", data.notas);

	dbMongo.pacientes.find({'info.curp': curp}, function(err, docs){
		console.log(docs,"DOCS");
		if(docs.length===0){
			res.send({'status':"NONEXISTANT"});
		}else{
			paciente = docs[0]._id;
			console.log({'paciente': paciente, medico : medico},"DATOS PERM");
			dbMongo.perms.find({paciente: ObjectID(paciente), medico : ObjectID(medico)}, function(err, perm){
				res.send(perm);	
			});
		}
	});
});			

/*===============================================================
/ UPDTAE PERMISSION
================================================================*/
router.post('/updatePerm',function(req,res){
	var collection = dbMongo.perms;
	var id         = ObjectID(req.body.id);
	var criteria = {_id: id};
	var update = {statusPerm : "1"};
	var sorting = {'_id':1};

	 collection.findAndModify({
	query: criteria,
	sort: sorting,
	update: {'$set' : update },
	upsert: false
	},function(err,docs){
		res.json(docs);
	});
});

/*===============================================================
/ UPDTAE
================================================================*/
router.post('/update',function(req,res){
	var collection = dbMongo.perms;
	var id         = ObjectID(req.body.id);
	var criteria = {_id: id};
	var update = {statusPerm : "1"};
	var sorting = {'_id':1};

	collection.findAndModify({
	query: criteria,
	sort: sorting,
	update: {'$set' : update },
	upsert: false
	},function(err,docs){
		res.json(docs);
	});
});



/*===============================================================
/ Check user already in database
================================================================*/
function pacienteCheckExists (curp,callback){
	var exists;
	dbMongo.pacientes.count({'info.curp': curp}, function(err, count){
		console.log(count,"CUENTA");
		if(count===0) {
			exists=false;
		}
		else{
			exists=true;
		}
		callback(err,exists);
	});
}

module.exports = router;







	
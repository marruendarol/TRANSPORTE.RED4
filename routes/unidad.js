/*-----------------------------------------------------------------------------------
	API UNIDADES
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
        estatus    : {type:'Number',ctrl:"Number",aliasN:"Estatus", visible:false,default:0},
        pubID      : {type:'Number', visible:false},
        tipo    : {size:"small-12 medium-12", type:'Number',ctrl:"Tree",aliasN:"Tipo de Vehículo", group:"Información General", matchP: validators.notempty,required:true},
        tipoClase : {type:'Number',ctrl:"String",aliasN:"Clase de Vehículo", visible:false,default:0},
        tipoImg : {type:'String',ctrl:"String",aliasN:"Imagen del Vehículo", visible:false,default:""},
	    sucursal: {type:'String',ctrl:"Combo",aliasN:"Base Asignada",  matchP: validators.short_field,popInfo:"La unidad debe de estar asignada a una base para que los servicios de búsqueda la puedan localizar "},
        sucursalDesc : {type:'String', ctrl:"String",visible:false,aliasN:"SucursalDesc"},
        sucursalLoc : [],
        marca	: {type:'String',ctrl:"Combo",aliasN:"Marca",  matchP: validators.short_field},
        modelo 	: {type:'String',ctrl:"Combo",aliasN:"Modelo",  matchP: validators.short_field},	    
        ano     : {type:'Number',ctrl:"Slider", suffix:" ",aliasN:"Año",  max:2017, min:2005,matchP: validators.number, default:2016},
        
        tipogas : {type:'String',ctrl:"Combo",aliasN:"Tipo de Combustible",   matchP: validators.number,popInfo:"Este dato se utiliza para las auto cotizaciones"},
        rendimiento   : {type:'Number',ctrl:"Slider", suffix:" km/l",aliasN:"Rendimiento promedio de Gasolina", closeGroup:true, max:40, min:1,matchP: validators.notempty, default:5,popInfo:"Este dato se utliza para auto generar las cotizaciones y basar el precio en el combustible calculado a consumir en el trayecto total."},
       // ejes    : {type:'Number',ctrl:"Slider", suffix:" ",aliasN:"Ejes Excedentes",  max:10, min:0,matchP: validators.notempty, default:0},
      //  moneda  : {type:'Number',ctrl:"Moneda",aliasN:"Moneda",  matchP: validators.short_field},
        
        placas     : {type:'String',ctrl:"Placa",aliasN:"Placas", group:"Documentos",  matchP: validators.short_field, uppercase:true},
        poliza  : {type:'String',ctrl:"StringUpper",aliasN:"Poliza de Segúro", closeGroup:true, matchP: validators.short_field, uppercase:true},

       

        volmax: {type:'Number',ctrl:"Slider", suffix:" m3", aliasN:"Volumen máximo", group:"Capacidad", max:150, min:1, step:1,  default:100,tipoClase:[4,5,6]},
        cargamax: {type:'Number',ctrl:"Slider", suffix:" Toneladas", aliasN:"Tonelaje máximo", max:66.5, min:1, step:.5,  default:1.5,tipoClase:[4,5,6]},
        largo: {size:"small-12 medium-6 large-4",type:'Number',ctrl:"Slider", suffix:" m", aliasN:"Largo", max:30, min:1, step:1,  default:1,tipoClase:[4,5,6]},
        ancho: {size:"small-12 medium-6 large-4",type:'Number',ctrl:"Slider", suffix:" m", aliasN:"Ancho", max:4, min:1, step:.5,  default:3,tipoClase:[4,5,6]},
        alto: {size:"small-12 medium-6 large-4",type:'Number',ctrl:"Slider", suffix:" m", aliasN:"Alto", max:10, min:1, step:1,  default:3,tipoClase:[4,5,6]},
        pasajerosMax : {type:'Number',ctrl:"Slider", suffix:" pasajeros", aliasN:"Máximo de Pasajeros", max:50, min:1, step:1, default:4,tipoClase:[1,2,3]},

        path    : {type:'String',ctrl:"String",aliasN:"Tipo",closeGroup:true,visible:false},
	   
	    
        servicios   : {size:"small-12", type : Array , limit:1, ctrl:"Extras", aliasN:"Servicios Adicionales", group:"Servicios Adicionales" ,closeGroup:true },
        carac  : {size:"small-12", type : Array , limit:10, ctrl:"Carac", aliasN:"Características especiales", group:"Características especiales",closeGroup:true
         },

        comentarios : {size:"small-12 medium-12 large-6",type:'String',ctrl:"Textarea", matchP: validators.long_field,aliasN:"Comentarios adicionales sobre la unidad",default:"",popInfo:"Por favor respete las políticas de datos de transporte.red no ingresando datos personales o información de contacto."},

        autocotizar : {size:"small-12 medium-12",type:'Number',ctrl:"Radio", aliasN:"Cotización de Viajes", group:"Tarífas", default:1,
        options:[{nameo:"autoc",val:1,text:"Autocotizar"},{nameo:"autoc",val:2,text:"Cotización manual"}],
        popInfo:"Se recomienda utlizar la auto cotización del portal ya que su publicación aparecerá en lugar preferente"},
        percGanancia : {type:'Number',ctrl:"Slider", suffix:" %", aliasN:"Porcentaje de utilidad Ida", max:100, min:0, default:40,tipoCot:[1]},
        //percRegreso : {type:'Number',ctrl:"Slider",suffix:" %", aliasN:"Porcentaje de utilidad Regreso", max:100, min:0,matchP: validators.perc, default:30,tipoCot:[1]},
        percGastos : {type:'Number',ctrl:"Slider",suffix:" %", aliasN:"Porcentaje sobre gastos",closeGroup:true, max:200, min:0, default:100,tipoCot:[1]},

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

var unidades = mongoose.model('unidades', mSchema);



//------------------  MODELO CAMIONES
var modelU = {
        tipo    : {type:'Number',ctrl:"Tree",aliasN:"Tipo de Vehículo", group:"Información General", matchP: validators.notempty,required:true},
        sucursal: {type:'String',ctrl:"Combo",aliasN:"Sucursal",  matchP: validators.short_field,popInfo:"La unidad debe de estar asignada a una sucursal para que los servicios de ubicación la encuentren cerca de las coordenadas "},
        marca   : {type:'String',ctrl:"Combo",aliasN:"Marca",  matchP: validators.notempty},
        
    }
  

var mSchema = mongoose.Schema(modelU);


var camiones = mongoose.model('camiones', mSchema);


/*-----------------------------------------------------------------------------------
	READ MODEL
-------------------------------------------------------------------------------------*/
router.get('/model',function(req,res){
	res.json(model)
});

/*-----------------------------------------------------------------------------------
	READ UNIDADES
-------------------------------------------------------------------------------------*/
router.post('/all',function(req,res){
	unidades.find({},function(err,docs){
		res.json(docs)
	})
});

/*-----------------------------------------------------------------------------------
	READ UNIDADES
-------------------------------------------------------------------------------------*/
router.get('/item/:itemId',function(req,res){
	var _id = req.params.itemId;
	var projection = {ts:0}
	unidades.findById(_id,projection,function(err,docs){
		res.json(docs)
	})
});




/*-----------------------------------------------------------------------------------
	CREATE UNIDADES
-------------------------------------------------------------------------------------*/
router.post('/save',function(req,res){

    // Stamps
    req.body.data.empresa = req.session.empresa; 
    req.body.data.user    = req.session.username; 

	var nu = new unidades(req.body.data)
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
	unidades.findByIdAndUpdate(_id,data,function(err,doc){
            res.send(data);
	});
});


/*-----------------------------------------------------------------------------------
	DELETE UNIDADE
-------------------------------------------------------------------------------------*/
router.post('/remove',function(req,res){

	var _id = req.body._id;

	unidades.remove({_id:_id},function(err,doc){
		if (err) return handleError(err);
		res.json({'status':'ok'})
	});
});



/*-----------------------------------------------------------------------------------
    DELETE UNIDADE
-------------------------------------------------------------------------------------*/
router.get('/getCamionesMarca',function(req,res){

    //var _id = req.body._id;

    camiones.find({},{'modelos.Value':0},function(err,doc){
        if (err) return handleError(err);
    
        var resF = [];
        for (var i = 0; i < doc.length; i++) {
            resF.push({text:doc[i].marca,value:doc[i].marca});
        }

        res.json(resF)
    });
});

router.get('/getCamionesModelo',function(req,res){

    var marca = req.query.marca;

    console.log(marca,"MARCA")

    camiones.find({marca:marca},{},function(err,doc){
        if (err) return handleError(err);
        var resF = [];
        var resu = doc[0].toObject()
        console.log(resu)
        for (var i = 0; i < resu.modelos.length; i++) {
            resF.push({text:resu.modelos[i].Text,value:resu.modelos[i].Text});
        }
        res.json(resF)
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
    unidades.count(criteria, function(err, result) {
        console.log(err,result,criteria)
        qObj.pageInfo.tc = result;
        qObj.pageInfo.tp = Math.ceil(result / qObj.pageInfo.rpp);

            unidades.find(criteria,fields).limit(qObj.pageInfo.rpp).skip((qObj.pageInfo.pn-1)*qObj.pageInfo.rpp).sort(sortObj).exec(function(err, result) {
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
module.exports.unidades = unidades;


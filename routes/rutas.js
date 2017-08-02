/*-----------------------------------------------------------------------------------
	API RUTAS
	transporte.red®
	v 1.0
-------------------------------------------------------------------------------------*/

var express = require('express');
var router = express.Router();
var databases = require('./database');
var dbf = require('./utilities');
var shortid = require('short-id');
var mongoose = databases.mongoose;
var dbMongo = databases.dbMongo;
  var ObjectID = databases.mongojs.ObjectId;



/*-----------------------------------------------------------------------------------
	SCHEMA & MODEL  // AL NEED GROUP
-------------------------------------------------------------------------------------*/
var model = {
       
	}
  

var mSchema = mongoose.Schema(model,{strict:false});

//mSchema.index({ empresa: 1 }); // schema indexes

var rutas = mongoose.model('rutas', mSchema);


getGasolinas();


router.post('/ruta',function(req,res){

});

// Search route 

router.searchRoute = function(obj,callback){
		rutas.findOne({origen_place_id:obj.origen.place_id,destino_place_id:obj.destino.place_id},{},function(err,doc){
				if(err){
          console.log(err)
				}else{
					if(doc==null){
						mappir(obj,callback)
					}else{
						callback(doc.toJSON())
					}
				}
		})
}



// MAPPIR SERVICES

var request = require("request")

function mappir(obj,callback){



 origen = {"idCategoria":"A-9",
            "desc":obj.origen.nombre,
//            "idTramo":0,
//            "source":0,
//            "target":0,
            "x":obj.origen.lng,
            "y":obj.origen.lat
}

destinos = [{"idCategoria":"A-9","desc":obj.destino.nombre,
//              "idTramo":0,
//              "source":0,
//              "target":0,
              "x":obj.destino.lng,
              "y":obj.destino.lat
            }
]

opciones = {
  casetas : true,
  alertas : false
};

vehiculo = {
  tipo : obj.tipo,
  subtipo : obj.subTipo,
  excedente : obj.ejesExcedentes,
  rendimiento : obj.rendimiento,
  costoltgas : obj.precioGas,
  combustible : obj.tipoGas
};

var body = {
      "usr" : "sct",
      "key" : "sct",
      "origen" : origen,
      "destinos" : destinos,
      "ruta" : 1,
      "opciones" : opciones,
      "vehiculo" : vehiculo
};



var url = "http://ttr.sct.gob.mx/TTR/rest/GeoRouteSvt?callback=func&_=1474416540832&json=" + encodeURIComponent(JSON.stringify(body))


console.log(body,"url")

request({
    url: url,
    json: true
}, function (error, response, body) {
  console.log("error ",error)
    eval(body)

     if(error!= null){
      console.log("no se pudo obtener ruta desde mappir")
    }

    function func(json){
      
      json.results[0].origenlat = obj.origen.lat;
      json.results[0].origenlng = obj.origen.lng;
      json.results[0].origenNombre = obj.origen.nombre;

      json.results[0].destinolat = obj.destino.lat;
      json.results[0].destinolng = obj.destino.lng;
      json.results[0].destinoNombre = obj.destino.nombre;

      json.results[0].vehiculo = vehiculo;
      json.results[0].origen_place_id = obj.origen.place_id;
      json.results[0].destino_place_id = obj.destino.place_id;
      json.results[0].tipo = obj.tipo;
      json.results[0].subtipo = obj.subTipo

      delete json.results[0].unidades;
      delete json.results[0].diccionario;
      delete json.results[0].grafo;
      
      // Inserta la ruta en la base de datos 
      var ru = new rutas(json.results[0])
	ru.save(function(err){
	 if (err) {
    console.log(err);
	  } else {
	    callback(json.results[0])
	  }
	})

      
    }

    if (!error && response.statusCode === 200) {
       //res.json(response)
     //   console.log(body) // Print the json response
    }
})


}


var gasolinas = {};

function getGasolinas(){

      var body = {
          "make" : "CM",
          "type" : "json",
          "key"  : "T34JkNDI-g8JV-3IX6-IvRH-kNt5wu97qPIT"
    };



    var url = "http://gaia.inegi.org.mx/sakbe/wservice" + obj_to_query(body)

    console.log(url)

    var request = require("request")

    request({
        url: url,
        json: true
    }, function (error, response, body) {
        

      dbMongo.gasolinas.drop();  

      dbMongo.gasolinas.insert(body,function(err, result){
         
       if(result.errror==undefined){
           dbMongo.gasolinas.find({}).limit(4).sort({"natural":-1},function(err,res){
                gasolinas = res;
                module.exports.gasolinas = gasolinas
          })
       } else{
        console.log("Error al obtener g")
       }

         
        
     } ); 


    });

 
}



module.exports = router;
module.exports.gasolinas = gasolinas




function obj_to_query(obj) {
    var parts = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
        }
    }
    return "?" + parts.join('&');
}
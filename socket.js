	// INST DATABASE
	var databases = require('./routes/database');
	var utils = require('./routes/utilities.js');
	var dbMongo = databases.dbMongo;
	var ObjectID = databases.mongojs.ObjectId;



module.exports = function (io) {
  
   var nsp = io.of('/transporte');

  nsp.on('connection', function(socket) {

  	socket.on('create', function (room) {
	  console.log("ROOM JOINED ",room)
	  socket.join(room);
	  nsp.in(room).emit("joined",room);
	});

/*-----------------------------------------------------------------
*
-------------------------------------------------------------------*/-
    socket.on('oPlace', function(obj) {
      var reg = new RegExp('^' + obj.str + '' ,'i')
       dbMongo.municipios.find({ municipio_nombre: { $regex:  reg, $options: 'i'  }},{}).limit(5,function(err,res){
          nsp.in(obj.room).emit('placeOrigen',res);
     })
    });

/*-----------------------------------------------------------------
*
-------------------------------------------------------------------*/
    
    socket.on('getRoute', function(obj) {
       dbMongo.rutas.find({}).limit(1,function(err,res){
          console.log(res,"RES GASOS")
          nsp.in(obj.room).emit('gasolinas',res[0]);
        })
      })  
  
    socket.on('getmappir', function(obj) {
      console.log("getting mappir route..",obj)
         mappir(obj,function(res){
             nsp.in(obj.room).emit('mappirRoute',res);
         })
      })  

/*-----------------------------------------------------------------
*
-------------------------------------------------------------------*/
    socket.on('getGasolinas', function(obj) {
        dbMongo.gasolinas.find({}).limit(1).sort({ts:-1},function(err,res){
          console.log(res,"RES GASOS")
          nsp.in(obj.room).emit('gasolinas',res[0]);
        })
      })  




  });

}




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
  tipo : obj.tipoVel,
  subtipo : obj.subTipoVel,
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

    function func(json){
      
      json.results[0].vehiculo = vehiculo;
      callback(json)
    }

    if (!error && response.statusCode === 200) {
       //res.json(response)
     //   console.log(body) // Print the json response
    }
})


}
/*-----------------------------------------------------------------------------------
	API BÚSQUEDA
	transporte.red®
	v 1.0
-------------------------------------------------------------------------------------*/

var express = require('express');
var router = express.Router();
var databases = require('./database');
var dbf = require('./utilities');
var shortid = require('short-id');
var mongoose = databases.mongoose;

mongoose.set('debug', true);


var validators = databases.validators;

var unidades = require('./unidad');
var publicaciones = require('./publicacion').publicacion;
var rutas = require('./rutas');


/*-----------------------------------------------------------------------------------
	BUSQUEDA PRINCIPAL 

	- Búsqueda por ciudades no por GEO 
	- Busca el calculo
	- Si no esta hazlo y almacenalo
	- Haz los subcalculos 
	- Regresa Objetos


TODO 

MAPPIR FALLA MUCHO CMABIAR A INEGI Y MENSAJES DE QUE NO SE PUDO 
REFRESCAR RUTAS CADA MES PARA ACTUALIAR PRECIOS DE CASETAS 

Criterios 

Filtros
	- Año 
	- Capacidad de Carga
	- Servicios
	- Caracterísitcas

	-Ordenar por Precio / Cercanía de Base  / 




	- Ida y Vuellta o Tipo de Servicio  / Regresos 

	
Faltan datos del transporte 

	- Reputación 
	- Mejorar Disponibilidad 
	- Descripción adicional 
	- Piso / Lona / Redilas / Etc/ AC / Rejilla Superior / Remolque / 


-------------------------------------------------------------------------------------*/

router.post('/dist',function(req,res){

    var origen_loc = req.body.origen;
    var destino_loc = req.body.destino;
    var fecha  = new Date(req.body.fecha) || new Date();
    var tipo = req.body.tipo;
    var subTipo = req.body.subtipo;
    var rendimiento = req.body.rendimiento;
    var extraDistance = req.body.extraDistance

    // RANGO DIA
    var start = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(),0,0,0);
	var end = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(),23,59,59);

    var limit = 20;
    var maxDistance = 8;
    	maxDistance /= 111.12  // KM.


    if(extraDistance!=undefined){
    	maxDistance = extraDistance / 111.12;
    }	

    var loc = [origen_loc.lng,origen_loc.lat]

    var searchObj = {
    		 'info.origen': {
	        $near: loc,
	        $maxDistance: maxDistance
	      }, estatus:0,
	      	'fechas' : { $elemMatch : { 'date' : {$gte : start, $lt : end }, 'tipo' : true}},
    	}


    	console.log(searchObj)
    	// Por agrupaciones específicas
    	if(tipo!=1000 && tipo!=1001){
    		searchObj['info.tipo'] = tipo;
    	}else{
    		if(tipo==1000){
    			searchObj['info.tipo'] = {'$in' : [6,7,8,9,10,11,12]};
    		}
    		if(tipo==1001){
    			searchObj['info.tipo'] = {'$in' : [14,15,16,17,18,19,20]};
    		}
    	}

    	publicaciones.find(searchObj).limit(limit).exec(function(err,publicaciones){
    		 if (err) {
        		return res.json(500, err);
		      }

		      var mappirObj = {
		      	origen : {
		      		place_id : origen_loc.place_id,
		      		lng : origen_loc.lng,
		      		lat : origen_loc.lat,
		      		nombre : origen_loc.nombre,
		      		shortN : origen_loc.shortN
		      	},
		      	destino : {
		      		place_id : destino_loc.place_id,
		      		lng : destino_loc.lng,
		      		lat : destino_loc.lat,
		      		nombre : destino_loc.nombre,
		      		shortN : destino_loc.shortN
		      	},
		      	  tipo : tipo,
				  subTipo : subTipo,
				  ejesExcedentes : 0,
				  rendimiento : rendimiento,
				  precioGas : getPrecioGas("Magna"),
				  tipoGas : 1
		      }
		      rutas.searchRoute(mappirObj,function(result){
		      	

		      	// Cálculo
		      	 var ruta = result; // Costo de Ruta
		      	 ruta.gasolinas = rutas.gasolinas;
		      	 var distanciaTotal = Math.round(ruta.distanciaTotal / 1000);
		      	 var casetasTotal =  ruta.casetasTotal;
		      	 var tiempoTotal = ruta.tiempoTotal;
		      	


		      	 for (var i = 0; i < publicaciones.length; i++) {

		      	 
		      	 	var infoCat = getInfoCat(publicaciones[i].info.tipo)

		      	 	var tarifas = getTarifa(distanciaTotal,infoCat.tarifas);

		      	 	var publicacion = publicaciones[i];
		      	 	// Precio Actual de Gasolina
		      	 	var costos = {};

		      	 		if(extraDistance!=undefined){
		  				costos.foranea = true;
		  			}


		      	 	//costos.descuento

		      	 	var gasConsumida = distanciaTotal  / publicacion.info.rendimiento;
		      	 	console.log("GASTOS A ",gasConsumida,distanciaTotal, publicacion.info.rendimiento)

		      	 	costos.precioGas 	= getPrecioGas(publicacion.info.tipogas)
		      	 	// Gasolilna total litros por precio 
		      	 	costos.gasTotal  =  costos.precioGas * gasConsumida;

		      	 	console.log(costos.gasTotal,"GASTOTAL",costos.precioGas)
		      	 	// Utilidad IDA
		      	 	costos.percIda 	= publicacion.info.ofertaPerc;

		      	 	// Utilidad Regreso
		      	 	//costos.percReg 	= publicacion.info.ofertaPercR;
		      	 	// Gastos 
		      	 	costos.percGastos 	= publicacion.info.percGastos;
		      	 	// Gastos Totales
		      	 	costos.gastosTot 	= parseFloat(tarifas.tarifa) * (costos.percGastos/100);
		      	 	// 
		      	 	console.log(costos.gastosTot,"GASTOS TOTAL",parseFloat(tarifas.tarifa))

		      	 	costos.viajeGastos = casetasTotal + costos.gasTotal;
		      	 	costos.viajeTotal = costos.viajeGastos + costos.gastosTot
		      	 	costos.viajeTotalIda = costos.viajeTotal + (costos.viajeTotal* (costos.percIda/100));

		      	 	//costos.viajeTotalReg = costos.viajeTotal + (costos.viajeTotal* (costos.percReg/100));

		      	 	costos.viajeIDAREG = costos.viajeTotalIda *2  //+ costos.viajeTotalReg;

		      	 	// comisión portal  .5%
		      	 	costos.granTotal = costos.viajeIDAREG + (costos.viajeIDAREG * .05);

		      	 	costos.granIVA = costos.granTotal + (costos.granTotal * .16);

		  
		  			publicaciones[i].costos = costos;



		  			
		      	 }


		      	 res.status(200).json({infoSearch:mappirObj,publicaciones:publicaciones,ruta:result});



		      })

		      
    	})

});



router.post('/pub',function(req,res){

    var orid = req.body.orid;
    var deid = req.body.deid;
    var fecha  = new Date(req.body.fecha) || new Date();
    var idPub = req.body.id;

    // RANGO DIA
    var start = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(),0,0,0);
	var end = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(),23,59,59);

    var limit = 1;
    

    //var loc = [origen_loc.lng,origen_loc.lat]

    //

    var searchObj = {uid:idPub};

    	publicaciones.find(searchObj).limit(limit).exec(function(err,publicaciones){
    		 if (err) {
        		return res.json(500, err);
		      };

		      var mappirObj = {
		      	origen : {
		      		place_id : orid,
		      	//	lng : origen_loc.lng,
		      	//	lat : origen_loc.lat,
		      	//	nombre : origen_loc.nombre,
		      	//	shortN : origen_loc.shortN
		      	},
		      	destino : {
		      		place_id : deid,
		      	//	lng : destino_loc.lng,
		      	//	lat : destino_loc.lat,
		      	//	nombre : destino_loc.nombre,
		      	//	shortN : destino_loc.shortN
		      	},
		      	  tipo : publicaciones[0].info.tipo,
				//  subTipo : subTipo,
				  ejesExcedentes : 0,
				  rendimiento : publicaciones[0].info.rendimiento,
				  precioGas : getPrecioGas(publicaciones[0].info.tipogas),
				  tipoGas : publicaciones[0].info.tipogas
		      }
		      rutas.searchRoute(mappirObj,function(result){
		      	

		      	// Cálculo
		      	 var ruta = result; // Costo de Ruta
		      	 ruta.gasolinas = rutas.gasolinas;
		      	 var distanciaTotal = Math.round(ruta.distanciaTotal / 1000);
		      	 var casetasTotal =  ruta.casetasTotal;
		      	 var tiempoTotal = ruta.tiempoTotal;
		      	

		      	 	var infoCat = getInfoCat(publicaciones[0].info.tipo)

		      	 	var tarifas = getTarifa(distanciaTotal,infoCat.tarifas);

		      	 	var publicacion = publicaciones[0];
		      	 	// Precio Actual de Gasolina
		      	 	var costos = {};

		      	 	//costos.descuento

		      	 	var gasConsumida = distanciaTotal  / publicacion.info.rendimiento;

		      	 	costos.precioGas 	= getPrecioGas(publicacion.info.tipogas)
		      	 	// Gasolilna total litros por precio 
		      	 	costos.gasTotal  =  costos.precioGas * gasConsumida;

		      	 	//console.log(costos.gasTotal,"GASTOTAL",costos.precioGas)
		      	 	// Utilidad IDA
		      	 	costos.percIda 	= publicacion.info.ofertaPerc;

		      	 	// Utilidad Regreso
		      	 	//costos.percReg 	= publicacion.info.ofertaPercR;
		      	 	// Gastos 
		      	 	costos.percGastos 	= publicacion.info.percGastos;
		      	 	// Gastos Totales
		      	 	costos.gastosTot 	= parseFloat(tarifas.tarifa) * (costos.percGastos/100);
		      	 	// 
		      	 	console.log(costos.gastosTot,"GASTOS TOTAL",parseFloat(tarifas.tarifa))

		      	 	costos.viajeGastos = casetasTotal + costos.gasTotal;
		      	 	costos.viajeTotal = costos.viajeGastos + costos.gastosTot
		      	 	costos.viajeTotalIda = costos.viajeTotal + (costos.viajeTotal* (costos.percIda/100));

		      	 	//costos.viajeTotalReg = costos.viajeTotal + (costos.viajeTotal* (costos.percReg/100));

		      	 	costos.viajeIDAREG = costos.viajeTotalIda *2  //+ costos.viajeTotalReg;

		      	 	// comisión portal  .5%
		      	 	costos.granTotal = costos.viajeIDAREG + (costos.viajeIDAREG * .05);

		      	 	costos.granIVA = costos.granTotal + (costos.granTotal * .16);

		  
		  			publicacion.costos = costos;



		      	 res.status(200).json({infoSearch:mappirObj,publicacion:publicacion,ruta:result});



		      })

		      
    	})

});

function getInfoCat(tipo){
	var arr = databases.categorias;
	var infoCat;

		      for (var i = 0; i < arr.length; i++) {
		      	if(arr[i].id==tipo){
		      		//infoCat = arr[i];
		      	}

		      	if(arr[i].children!=undefined){
		      		for (var a = 0; a < arr[i].children.length; a++) {
		      			if(arr[i].children[a].id==tipo){
		      				infoCat = arr[i].children[a]
		      			}
		      			if(arr[i].children[a].children!=undefined){
		      					for (var o = 0; o < arr[i].children[a].children.length; o++) {
		      						if(arr[i].children[a].children[o].id==tipo){
			      							infoCat = arr[i].children[a].children[o];
			      					}
		      					}
		      			}
		      		}
		      	}
		      }

	return infoCat;	      
}

function getTarifa(km,tarifas){
			var item = {}
			for (var i = 0; i < tarifas.length; i++) {
				if(km>=tarifas[i].min && km<=tarifas[i].max){
					item = tarifas[i];
				}
			}
			return item;
	}

function getPrecioGas(tipo){
	for (var i = 0; i < rutas.gasolinas.length; i++) {
		 if(rutas.gasolinas[i].tipo==tipo){
		 	return rutas.gasolinas[i].costo;
		 }
	}
}



module.exports = router;
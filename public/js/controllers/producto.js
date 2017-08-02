// producto desde unidad en disponibilidad General

/*

Autos
Camiones
Camionetas
Autobuses  */


var product = {
	_id : ObjectId("57f65325af33b84a0c775790"),
	inicio : new Date(),
	final : new Date(),
	tipo : 1,
	carac : [
		{tipo : 2}, // Tipo de Vehiculo
		{ejes : 1}, // ejes Extra 
		{subDesc : "Refrigerada"},
		{carga : 2000}, // kilos total 
		{tipoViaje : [1,2,3]},  // Tipo de Viaje ida vuelta redondo
		{maxDistance: 10000}  //Maxima distancia de viaje desde base
		{descuentoGeneral : 10}
	],
	costos : [
		{utilidad_general : 40}, //  Utilidad General
		{utilidad_regreso:25}, // Utlidad en viaje de vuelta 
		{costosFijos: 40}, // Por centaje de utlidad de costos fijos
		{costoKm: 123}, // Proemdio de costo por KM
		{costoTiempo:12}, // Promedio de costo por tiempo Extra

	],
	infoEmpresa : [
		reputacion : 95, 

	]	
}


// producto desde unidad en Ruta Predeterminada


var product = {
	_id : ObjectId("57f65325af33b84a0c775790"),
	inicio : new Date(),
	final : new Date(),
	tipo : 2
	ciudad_origen : 213213,
	ciudad_destino : 123213,
	horario_salida : new Date(),
	desc: "Viaje Regreso Oferta",

	carac : [
		{tipo : 2}, // Tipo de Vehiculo
		{ejes : 1}, // ejes Extra 
		{subDesc : "Refrigerada"},
		{carga : 2000}, // kilos total 
		{tipoViaje : [1,2,3]},  // Tipo de Viaje ida vuelta redondo
		{maxDistance: 10000}  //Maxima distancia de viaje desde base
		{descuentoGeneral : 10}
	],
	costos : [
		{utilidad_general : 40}, //  Utilidad General
		{utilidad_regreso:25}, // Utlidad en viaje de vuelta 
		{costosFijos: 40}, // Por centaje de utlidad de costos fijos
		{costoKm: 123}, // Proemdio de costo por KM
		{costoTiempo:12}, // Promedio de costo por tiempo Extra

	],
	infoEmpresa : [
		reputacion : 95,

	]	
}

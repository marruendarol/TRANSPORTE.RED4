
// DATABASES 
/*===============================================================
/ MONGO
================================================================*/
var mongojs = require("mongojs");
var db = mongojs('mongodb://localhost/transporte', ['rutas','transportistas','municipios','cps','clientes','gasolinas','unidades','cajas','tarifas','ofertas','choferes','reservas','documentos','edocta','controlv','bases','usuarios']);
exports.dbMongo = db;
exports.mongojs = mongojs;

 
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/transporte',{ config: { autoIndex: true }});
exports.mongoose = mongoose;


var validators = {
		strlen: { pattern: '^(.){2,50}$', desc:"Requerido de 2 a 50 carácteres." },
		number_10: { pattern:  '^[0-9]{10,10}$', desc:"Requerido 10 carácteres." },
		decimal: { pattern:  '^[0-9]{1}$', desc:"Requerido un número entre 0 y 9." },
		number: { pattern:  '^[0-9]{0,10}', desc:"Requerido numérico." },
		short_field: { pattern: '^.{3,50}$', desc:"Requerido de 3 a 50 carácteres." },
		year: { pattern: '^.{4,4}$', desc:"Requerido de 4 carácteres ej. 2017 " },
		perc: { pattern: '^.{1,4}$', desc:"Requerido numero entre 1 y 100." },
		long_field: { pattern: '^.{0,1000}$', desc:"Requerido de 3 a 1000 carácteres." },
		notempty: { pattern: '^.{1,2}$', desc:"Requerido." },
		twitter: { pattern: '^.{0,140}$', desc:"Requerido de 2 a 50 carácteres." },
		dashes_only: {pattern:'^[0-9-]*$', desc: "Solo números y guiones"},
        ip_address: {pattern: '^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$',desc:"Ip ip_address"}
}




exports.validators = validators;


tarifas = [
			{min:0,max:50,tarifa:400},
			{min:51,max:100,tarifa:500},
			{min:101,max:200,tarifa:600},
			{min:201,max:300,tarifa:700},
			{min:301,max:400,tarifa:800},
			{min:401,max:700,tarifa:900},
			{min:701,max:900,tarifa:1000},
			{min:901,max:1500,tarifa:1200},
			{min:1500,max:2000,tarifa:1300},
			{min:2001,max:3000,tarifa:1400},
			{min:3001,max:5000,tarifa:1500},
			{min:5001,max:50000,tarifa:1600},
		]


var cats = [
			
			{tipoClase:4,id:5,text: "Caja Seca" ,icon:"/img/tipos/tipo_camion.png", children: [

					{tipoClase:4,id:6,text:"Camióneta 1t",icon:"/img/tipos/tipo_camioneta_1.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					{tipoClase:4,id:7,text:"Camióneta 3.5t" ,icon:"/img/tipos/tipo_camioncs35.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					{tipoClase:4,id:8,text:"Camióneta 5t" ,icon:"/img/tipos/tipo_cs_5.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					{tipoClase:4,id:9,text:"Rabón 7t" ,icon:"/img/tipos/tipo_cs_rabon.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					{tipoClase:4,id:10,text:"Torton 15t" ,icon:"/img/tipos/tipo_cs_torton.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					{tipoClase:4,id:11,text:"Trailer 27t" ,icon:"/img/tipos/tipo_trailer.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					{tipoClase:4,id:12,text:"Full" ,icon:"/img/tipos/ts_cs_full.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					]
			},
			{id:13,text : "Plataforma" ,icon:"/img/tipos/tipo_camion.png" , children: [
					{tipoClase:5,id:14,text:"Camióneta 1t",icon:"/img/tipos/tipo_camioneta_1.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					{tipoClase:5,id:15,text:"Camióneta 3.5t" ,icon:"/img/tipos/tipo_camioncs35.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					{tipoClase:5,id:16,text:"Camióneta 5t" ,icon:"/img/tipos/tipo_cs_5.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					{tipoClase:5,id:17,text:"Rabón 7t" ,icon:"/img/tipos/tipo_cs_rabon.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					{tipoClase:5,id:18,text:"Torton 15t" ,icon:"/img/tipos/tipo_cs_torton.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					{tipoClase:5,id:19,text:"Trailer 27t" ,icon:"/img/tipos/tipo_trailer.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					{tipoClase:5,id:20,text:"Full" ,icon:"/img/tipos/ts_cs_full.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					]
			},
			{id:21,text : "Especial" ,icon:"/img/tipos/tipo_camion.png", children: [
					{tipoClase:6,id:22,text:"Refrigerado" ,icon:"/img/tipos/tipo_camion.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					{tipoClase:6,id:23,text:"Autotanque" ,icon:"/img/tipos/tipo_camion.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					{tipoClase:6,id:24,text:"Grua" ,icon:"/img/tipos/tipo_camion.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					{tipoClase:6,id:25,text:"Tolva" ,icon:"/img/tipos/tipo_camion.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					{tipoClase:6,id:26,text:"Pesada" ,icon:"/img/tipos/tipo_camion.png",categoria:4,dataVal:8, rendimiento:6.00, tarifas:tarifas},
					]
			},
			{id:0,text:"Pasajeros", icon:"/img/tipos/tipo_autobus.png", children : [
				{tipoClase:1,id:1,text: "Autobus" ,icon:"/img/tipos/tipo_autobus.png", categoria:3,dataVal:5, rendimiento:6.00, tarifas:tarifas },
				{tipoClase:2,id:2,text: "Camioneta", icon:"/img/tipos/tipo_camioneta.png",categoria:1,dataVal:3, rendimiento:12.00, tarifas:tarifas},
				{tipoClase:3,id:3,text: "Coche", icon:"/img/tipos/tipo_coche.png",categoria:1,dataVal:16, rendimiento:12.00, tarifas:tarifas}
				]
			},
			 
					
		];


var extras = [
	{id:0, desc:"Maniobras", default:100, unidad:"/ tonelada",tipoClase:[4,5,6]},
	{id:1, desc:"Emplaye", default:100,unidad:"/ tonelada",tipoClase:[4,5,6]},
	{id:2, desc:"Almacenaje", default:100,unidad:"/ tonelada",tipoClase:[4,5,6]},
	{id:3, desc:"Entarimado", default:100,unidad:"/ tonelada",tipoClase:[4,5,6]},
	{id:4, desc:"Segundo Conductor", default:100,unidad:"/ conductor",tipoClase:[4,1,5,6]},
	{id:5, desc:"Tramites Administrativos", default:100,unidad:"/ tramite",tipoClase:[1,2,3,4,5,6]},
]


var carac = [
	{id:0, desc:"Grua Hidráulica Articulada", default:false,tipoClase:[4,5,6]},
	{id:1, desc:"Plataforma de Carga", default:false,tipoClase:[4,5,6]},
	{id:2, desc:"Plataforma Alargada", default:false,tipoClase:[4,5,6]},
	{id:3, desc:"Piso antiderrapante", default:false,tipoClase:[4,5,6]},
	{id:4, desc:"Grua Frontal", default:false,tipoClase:[4,5,6]},
	{id:5, desc:"Lona Protectora", default:false,tipoClase:[4,1,5,6]},
	{id:6, desc:"Rastreo transporte.red®", default:true,tipoClase:[1,2,3,4,5,6]},
	{id:7, desc:"GPS ", default:false,tipoClase:[1,2,3,4,5,6]},
	{id:8, desc:"Wi-Fi", default:false,tipoClase:[1,2]},
]



exports.extras = extras;
exports.categorias = cats;
exports.caracteristicas = carac;


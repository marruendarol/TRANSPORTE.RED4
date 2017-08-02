/*===============================================================
/ NODE MODULES REQUIRE
================================================================*/
var express = require('express');
var router = express.Router();
var databases = require('./database');
var utils = require('./utilities');
var GoogleMapsAPI = require('googlemaps')
var dbMongo = databases.dbMongo;
var  ObjectID = databases.mongojs.ObjectId;

var publicConfig = {
  key: 'AIzaSyBcrQxNRRRn5djIHjj5fXV7TP8dLz0WqN8',
  stagger_time:       1000, // for elevationPath
  encode_polylines:   false,
  secure:             true, // use https
  //proxy:              'http://127.0.0.1:9999' // optional, set a proxy for HTTP requests
};
var gmAPI = new GoogleMapsAPI(publicConfig);

/*===============================================================
/ REGISTRO PACIENTE
================================================================*/
router.get('/updateMun',function(req,res){
	 dbMongo.municipios.find({},function(err, result){
        var all = result;
        var count = 0

        console.log('res',result[0].municipio2  +  " "  + result[0].estado)

        getGeo(result[0].municipio2  +  " "  + result[0].estado)
     } ); 
});


function getGeo(add){

    var geocodeParams = {
  "address":    add,
  "components": "components=country:MX",
  "language":   "es",
  "region":     "mx"
};

    gmAPI.geocode(geocodeParams, function(err, result){
      console.log(JSON.stringify(result));
    });

}



router.get('/route',function(req,res){



 var params = {
       origin: 'Celaya, Gto, MX',
        destination: 'León, Gto, MX',
        mode: 'driving',
        departure_time: new Date(),
        language : 'es',
        
       
      };

      gmAPI.directions( params, function(err, results) {
        console.log("regreso",results,err)
        res.json(results)
      });



});


/*-------------------------------------------------------------*/

//Casetas localización
//https://www.datossct.gob.mx/resource/db94-gqu8.json

//Tarifas Vigentes
//https://www.datossct.gob.mx/resource/v7dm-q3ds.json

var http = require('http');

router.get('/inegi',function(req,res){

console.log("iniciando inegi...")


var request = require("request")


var body = {
      "usr" : "sct",
      "key" : "sct",
      "origen" : origen,
      "destinos" : destinos,
      "ruta" : 1,
      "opciones" : opciones,
      "vehiculo" : vehiculo
};

var url = "http://gaia.inegi.org.mx/sakbe/wservice&?callback=func&json=" + encodeURIComponent(JSON.stringify(body))


request({
    url: url,
    json: true
}, function (error, response, body) {

    eval(body)

    function func(json){
      res.json(json)
      //console.log(json)
    }


    if (!error && response.statusCode === 200) {
       //res.json(response)
     //   console.log(body) // Print the json response
    }
})

});




//--------PRECIOS GASOLINA ---------------------------------


    var http = require('http');

    router.get('/gasolinas',function(req,res){

    console.log("iniciando inegi gasolinas...")


    var request = require("request")


    var body = {
          "make" : "CM",
          "type" : "json",
          "key"  : "T34JkNDI-g8JV-3IX6-IvRH-kNt5wu97qPIT"
    };



    var url = "http://gaia.inegi.org.mx/sakbe/wservice" + obj_to_query(body)

    console.log(url)

    request({
        url: url,
        json: true
    }, function (error, response, body) {
        
      console.log(error,response)
      dbMongo.gasolinas.drop();  

      dbMongo.gasolinas.insert(body,function(err, result){
         
        res.json(body)
        
     } ); 


        

        if (!error && response.statusCode === 200) {
           //res.json(response)
         //   console.log(body) // Print the json response
        }
    })

    });



//-----------------------------------------




router.get('/mappirR',function(req,res){

console.log("iniciando...")

var request = require("request")

 origen = {"idCategoria":"A-9",
      "desc":"",
      "idTramo":0,
      "source":06,
      "target":0,
      "x":-100.836,
      "y":20.5334
}

destinos = [{"idCategoria":"A-2","desc":"León, Guanajuato",
              "idTramo":0,
              "source":0,
              "target":0,
              "x":-101.6821337,
              "y":21.1221486}
]

opciones = {
  casetas : true,
  alertas : false
};

vehiculo = {
  tipo : 1, 
  subtipo : 1,
  excedente : 0,
  rendimiento : 17.0,
  costoltgas : 13.98
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


request({
    url: url,
    json: true
}, function (error, response, body) {

    eval(body)

    function func(json){
      res.json(json)
      //console.log(json)
    }


    if (!error && response.statusCode === 200) {
       //res.json(response)
     //   console.log(body) // Print the json response
    }
})




});


//------------------ JSTS   //http://stackoverflow.com/questions/24912796/google-api-v3-show-nearby-markers-on-customer-road


function calcRoute() {
    var start = document.getElementById('start').value;
    var end = document.getElementById('end').value;
    var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            var overviewPath = response.routes[0].overview_path,
                overviewPathGeo = [];
            for (var i = 0; i < overviewPath.length; i++) {
                overviewPathGeo.push(
                [overviewPath[i].lng(), overviewPath[i].lat()]);
            }

            var distance = 10 / 111.12, // Roughly 10km
                geoInput = {
                    type: "LineString",
                    coordinates: overviewPathGeo
                };
            var geoInput = googleMaps2JTS(overviewPath);
            var geometryFactory = new jsts.geom.GeometryFactory();
            var shell = geometryFactory.createLineString(geoInput);
            var polygon = shell.buffer(distance);

            var oLanLng = [];
            var oCoordinates;
            oCoordinates = polygon.shell.points[0];
            for (i = 0; i < oCoordinates.length; i++) {
                var oItem;
                oItem = oCoordinates[i];
                oLanLng.push(new google.maps.LatLng(oItem[1], oItem[0]));
            }
            if (routePolygon && routePolygon.setMap) routePolygon.setMap(null);
            routePolygon = new google.maps.Polygon({
                paths: jsts2googleMaps(polygon),
                map: map
            });
            for (var j=0; j< gmarkers.length; j++) {
              if (google.maps.geometry.poly.containsLocation(gmarkers[j].getPosition(),routePolygon)) {
                gmarkers[j].setMap(map);
              } else {
                gmarkers[j].setMap(null);
              }
           }
        }
    });
}



module.exports = router;


function obj_to_query(obj) {
    var parts = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
        }
    }
    return "?" + parts.join('&');
}
// TRANSPORTE.RED 2017  

/*===============================================================
/ NODE MODULES REQUIRE
================================================================*/
var express       = require('express');
var http          = require('http');
var https          = require('https');
var bodyParser    = require('body-parser');
var cookieParser  = require('cookie-parser');
var session       = require('express-session');
var favicon       = require('serve-favicon');
var MongoStore    = require('connect-mongo/es5')(session);
var multer        = require('multer');
var request       = require('request');
var compression   = require('compression');
var fs            = require('fs');

/*===============================================================
/ CROSS DOMAIN
================================================================*/
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', false);
    res.header('Access-Control-Allow-Origin',  '*');
    res.header('Access-Control-Allow-Methods', 'POST,PUT,GET,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept, Origin');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) { res.send(200); } else { next(); }  // HANDLE OPTIONS VERB
}

/*===============================================================
/ EXPRESS INITIALIZATION
================================================================*/
var app = express();

app.use(allowCrossDomain)


//var options = {
 //  key  : fs.readFileSync('../ssl.key'),
 //  cert : fs.readFileSync('../ssl.cert')
//};

var server = http.createServer(app);

//var server = https.createServer(options,app);
/*===============================================================
/ CONFIGURATION BODY PARSER 
================================================================*/
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true , limit:'2mb' , parameterLimit: 10000 }));
app.use(cookieParser()); // read cookies
//app.use(multer({ dest: './public/uploads'}))

/*===============================================================
/ SESSION
================================================================*/
var sessionMiddleware = session({
    secret: 'transportered',
    store: new MongoStore({ url: 'mongodb://localhost/transporte' }),
    ttl: 14 * 24 * 60 * 60, // = 14 days. Default
    resave : true,
    saveUninitialized: true
})

var io = require('socket.io')(server);
   var socket = require('./socket');
   socket(io);

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(sessionMiddleware);

/*===============================================================
/ VIEWS CONFIG
================================================================*/
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(compression()); //use compression
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/views'));

/*===============================================================
/ FILE REQUIRE
================================================================*/
 
   var unidades = require('./routes/unidad');
   var bases = require('./routes/base');
   var publicacion = require('./routes/publicacion');
   var reserva = require('./routes/reserva');
   var busqueda = require('./routes/busqueda');
   var rutas = require('./routes/rutas');
   
   var dispositivos = require('./routes/dispositivo');
   var updates   = require('./routes/updateLoc');
   var user   = require('./routes/user');
   var msgCenter   = require('./routes/msgCenter');

   var personales = require('./routes/personales');
   var pagos = require('./routes/pagos');
   var documentos = require('./routes/documentos');
   var preferencias = require('./routes/preferencias');
  
   app.use('/updates', updates);
   app.use('/unidades', unidades);
   app.use('/bases', bases);
   app.use('/dispositivos', dispositivos);
   app.use('/busqueda', busqueda);
   app.use('/rutas', rutas);
   
   app.use('/personales', personales);
   app.use('/pagos', pagos);
   app.use('/documentos', documentos);
   app.use('/preferencias', preferencias);
   
   app.use('/publicacion', publicacion);
   app.use('/reserva', reserva);
   app.use('/user', user);
   app.use('/msgCenter', msgCenter);

/*===============================================================
/ VIEW ROUTES
================================================================*/

    app.get('/beta', function(req, res) {
        res.sendFile(__dirname + '/public/views/home.html');
    });

    app.get('/busqueda', function(req, res) {
        res.sendFile(__dirname + '/public/views/busqueda.html');
    });

    app.get('/publicacion/:item', function(req, res) {
        res.sendFile(__dirname + '/public/views/publicacion.html');
    });

    app.get('/reservar/:item', function(req, res) {
        res.sendFile(__dirname + '/public/views/reservar.html');
    });

     app.get('/tarifario', function(req, res) {
        res.sendFile(__dirname + '/public/views/tarifario.html');
    });

    app.get(['/app','/app/*'], function(req, res) {
       var sess=req.session;
        if(req.session.username==undefined){
            console.log("sending home")
            
        }else{
            console.log("sending app")
            res.sendFile(__dirname + '/public/views/app.html');    
        }
    });


    // Relleno
    app.get('/confirmar', function(req, res) {
        res.sendFile(__dirname + '/public/views/confirmar.html');
    });

    app.get('/recuperar', function(req, res) {
        res.sendFile(__dirname + '/public/views/recuperar.html');
    });

    app.get('/ayuda', function(req, res) {
        res.sendFile(__dirname + '/public/views/ayuda.html');
    });

     app.get('/acerdade', function(req, res) {
        res.sendFile(__dirname + '/public/views/acercade.html');
    });

    app.get('/privacidad', function(req, res) {
        res.sendFile(__dirname + '/public/views/privacidad.html');
    });

    app.get('/terminos', function(req, res) {
        res.sendFile(__dirname + '/public/views/terminos.html');
    });

   



/*===============================================================
/ INIT SERVER
================================================================*/
var port = 8600; 
server.listen(port);
console.log('Servidor funcionando en http://localhost:' + port);
module.exports = app;